<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HistoryController extends Controller
{
    /**
     * Display appointment history page
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $filters = $request->only(['status', 'date_from', 'date_to', 'search', 'type']);
            
            // Build query based on user role
            $query = Appointment::query();
            
            // Filter by user role
            switch ($user->role) {
                case 'customer':
                    $query->where('user_id', $user->id);
                    break;
                case 'vendor':
                    $query->whereHas('vendorStore', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
                    break;
                case 'rider':
                    $rider = \App\Models\Rider::where('email', $user->email)->first();
                    if ($rider) {
                        $query->where('rider_id', $rider->id);
                    } else {
                        // If no rider found, return empty results
                        $query->whereRaw('1 = 0');
                    }
                    break;
                case 'admin':
                    // Admin can see all appointments
                    break;
                default:
                    $query->where('user_id', $user->id);
                    break;
            }

            // Apply filters
            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            if (!empty($filters['date_from'])) {
                $query->whereDate('appointment_date', '>=', $filters['date_from']);
            }

            if (!empty($filters['date_to'])) {
                $query->whereDate('appointment_date', '<=', $filters['date_to']);
            }

            if (!empty($filters['search'])) {
                $query->where(function ($q) use ($filters) {
                    $q->where('appointment_number', 'like', '%' . $filters['search'] . '%')
                      ->orWhere('customer_name', 'like', '%' . $filters['search'] . '%')
                      ->orWhere('customer_email', 'like', '%' . $filters['search'] . '%');
                });
            }

            // Show all appointments by default (not just completed/cancelled)
            // Users can filter by status if they want specific ones
            
            // Get paginated results with minimal relationships to avoid errors
            $appointments = $query->with(['vendorStore', 'service', 'rider'])
                                  ->orderBy('created_at', 'desc')
                                  ->paginate(15)
                                  ->withQueryString();

            // Transform data for frontend with safe handling
            $transformedAppointments = $appointments->through(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_number' => $appointment->appointment_number,
                    'customer_name' => $appointment->customer_name,
                    'appointment_date' => $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : null,
                    'appointment_time' => $appointment->appointment_time ? $appointment->appointment_time->format('H:i') : null,
                    'status' => $appointment->status,
                    'total_amount' => $appointment->total_amount ?? 0,
                    'currency' => $appointment->currency ?? 'USD',
                    'vendor' => $appointment->vendorStore ? [
                        'business_name' => $appointment->vendorStore->business_name,
                        'contact_phone' => $appointment->vendorStore->contact_phone,
                    ] : [
                        'business_name' => 'N/A',
                        'contact_phone' => 'N/A',
                    ],
                    'service' => $appointment->service ? [
                        'name' => $appointment->service->name,
                        'category' => $appointment->service->category,
                    ] : [
                        'name' => 'N/A',
                        'category' => 'N/A',
                    ],
                    'rider' => $appointment->rider ? [
                        'name' => $appointment->rider->name,
                        'phone' => $appointment->rider->phone,
                        'vehicle_type' => $appointment->rider->vehicle_type,
                    ] : null,
                    'created_at' => $appointment->created_at,
                    'completed_at' => $appointment->completed_at,
                    'cancelled_at' => $appointment->cancelled_at,
                ];
            });

            // Get stats with proper error handling
            $stats = $this->getHistoryStats($user);

            return Inertia::render('History/Index', [
                'appointments' => $transformedAppointments,
                'recentHistory' => [], // Disable Redis for now
                'filters' => $filters,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('History controller error: ' . $e->getMessage());
            
            // Return with safe default data
            return Inertia::render('History/Index', [
                'appointments' => [
                    'data' => [],
                    'links' => [],
                    'meta' => ['total' => 0, 'per_page' => 15]
                ],
                'recentHistory' => [],
                'filters' => $filters ?? [],
                'stats' => [
                    'total' => 0,
                    'completed' => 0,
                    'cancelled' => 0,
                    'this_month' => 0,
                    'total_amount' => 0
                ]
            ]);
        }
    }

    /**
     * Show detailed view of an appointment
     */
    public function show($appointmentId)
    {
        try {
            $user = Auth::user();
            
            // Find appointment with basic relationships
            $appointment = Appointment::with(['vendorStore.user', 'service', 'rider', 'user'])
                                     ->find($appointmentId);
            
            if (!$appointment) {
                abort(404);
            }

            // Check if user has access to this appointment
            $hasAccess = false;
            switch ($user->role) {
                case 'customer':
                    $hasAccess = $appointment->user_id == $user->id;
                    break;
                case 'vendor':
                    $hasAccess = $appointment->vendorStore && $appointment->vendorStore->user_id == $user->id;
                    break;
                case 'rider':
                    $rider = \App\Models\Rider::where('email', $user->email)->first();
                    $hasAccess = $rider && $appointment->rider_id == $rider->id;
                    break;
                case 'admin':
                    $hasAccess = true;
                    break;
            }

            if (!$hasAccess) {
                abort(403);
            }

            // Get comprehensive appointment details with safe handling
            $appointmentDetails = [
                'id' => $appointment->id,
                'appointment_number' => $appointment->appointment_number,
                'status' => $appointment->status,
                'appointment_date' => $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : null,
                'appointment_time' => $appointment->appointment_time ? $appointment->appointment_time->format('H:i') : null,
                'estimated_end_time' => $appointment->estimated_end_time ? $appointment->estimated_end_time->format('H:i') : null,
                'duration_minutes' => $appointment->duration_minutes,
                
                'customer' => [
                    'id' => $appointment->user_id,
                    'name' => $appointment->customer_name,
                    'email' => $appointment->customer_email,
                    'phone' => $appointment->customer_phone,
                    'address' => $appointment->customer_address,
                    'city' => $appointment->customer_city,
                    'emergency_contact_name' => $appointment->emergency_contact_name,
                    'emergency_contact_phone' => $appointment->emergency_contact_phone,
                ],
                
                'vendor' => $appointment->vendorStore ? [
                    'id' => $appointment->vendorStore->id,
                    'business_name' => $appointment->vendorStore->business_name,
                    'description' => $appointment->vendorStore->description,
                    'business_type' => $appointment->vendorStore->business_type,
                    'address' => $appointment->vendorStore->address,
                    'contact_phone' => $appointment->vendorStore->contact_phone,
                    'contact_email' => $appointment->vendorStore->contact_email,
                    'owner' => [
                        'name' => $appointment->vendorStore->user->name ?? 'N/A',
                        'email' => $appointment->vendorStore->user->email ?? 'N/A',
                    ]
                ] : null,
                
                'service' => $appointment->service ? [
                    'id' => $appointment->service->id,
                    'name' => $appointment->service->name,
                    'description' => $appointment->service->description,
                    'category' => $appointment->service->category,
                    'subcategory' => $appointment->service->subcategory,
                    'price' => $appointment->service->price,
                    'duration' => $appointment->service->duration,
                ] : null,
                
                'rider' => $appointment->rider ? [
                    'id' => $appointment->rider->id,
                    'rider_id' => $appointment->rider->rider_id,
                    'name' => $appointment->rider->name,
                    'email' => $appointment->rider->email,
                    'phone' => $appointment->rider->phone,
                    'vehicle_type' => $appointment->rider->vehicle_type,
                    'license_number' => $appointment->rider->license_number,
                    'rating' => $appointment->rider->rating ?? 0,
                    'total_deliveries' => $appointment->rider->total_deliveries ?? 0,
                    'status' => $appointment->rider->status,
                ] : null,
                
                'financial' => [
                    'service_price' => $appointment->service_price ?? 0,
                    'additional_charges' => $appointment->additional_charges ?? 0,
                    'discount_amount' => $appointment->discount_amount ?? 0,
                    'total_amount' => $appointment->total_amount ?? 0,
                    'currency' => $appointment->currency ?? 'USD',
                ],
                
                'notes' => [
                    'requirements' => $appointment->requirements,
                    'customer_notes' => $appointment->customer_notes,
                    'internal_notes' => $appointment->internal_notes,
                    'cancellation_reason' => $appointment->cancellation_reason,
                    'cancellation_details' => $appointment->cancellation_details,
                ],
                
                'timestamps' => [
                    'created_at' => $appointment->created_at,
                    'confirmed_at' => $appointment->confirmed_at,
                    'started_at' => $appointment->started_at,
                    'completed_at' => $appointment->completed_at,
                    'cancelled_at' => $appointment->cancelled_at,
                    'rescheduled_at' => $appointment->rescheduled_at,
                ],
                
                'notifications' => [
                    'sms_notifications' => $appointment->sms_notifications ?? false,
                    'email_notifications' => $appointment->email_notifications ?? false,
                ],
            ];

            return Inertia::render('History/Show', [
                'appointment' => $appointmentDetails
            ]);
        } catch (\Exception $e) {
            Log::error('History show error: ' . $e->getMessage());
            abort(500);
        }
    }

    /**
     * Get history statistics
     */
    private function getHistoryStats($user)
    {
        try {
            $query = Appointment::query();

            // Filter by user role
            switch ($user->role) {
                case 'customer':
                    $query->where('user_id', $user->id);
                    break;
                case 'vendor':
                    $query->whereHas('vendorStore', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
                    break;
                case 'rider':
                    $rider = \App\Models\Rider::where('email', $user->email)->first();
                    if ($rider) {
                        $query->where('rider_id', $rider->id);
                    } else {
                        // Return empty stats if no rider found
                        return [
                            'total' => 0,
                            'completed' => 0,
                            'cancelled' => 0,
                            'this_month' => 0,
                            'total_amount' => 0,
                        ];
                    }
                    break;
                case 'admin':
                    // Admin can see all appointments
                    break;
                default:
                    $query->where('user_id', $user->id);
                    break;
            }

            return [
                'total' => $query->count(),
                'completed' => (clone $query)->where('status', 'completed')->count(),
                'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
                'this_month' => (clone $query)->whereMonth('appointment_date', now()->month)
                                               ->whereYear('appointment_date', now()->year)
                                               ->count(),
                'total_amount' => (clone $query)->where('status', 'completed')->sum('total_amount') ?? 0,
            ];
        } catch (\Exception $e) {
            Log::error('Error getting history stats: ' . $e->getMessage());
            return [
                'total' => 0,
                'completed' => 0,
                'cancelled' => 0,
                'this_month' => 0,
                'total_amount' => 0,
            ];
        }
    }
}
