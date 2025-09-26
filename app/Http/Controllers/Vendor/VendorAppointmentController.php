<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\VendorStore;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;



class VendorAppointmentController extends Controller
{
    /**
     * Display the vendor appointments calendar
     */
    public function index()
    {
        $vendorStore = VendorStore::where('user_id', auth()->id())->first();
        
        if (!$vendorStore) {
            return redirect()->route('vendor.dashboard')->with('error', 'Please complete your store setup first.');
        }

        // Get current month appointments with counts
        $currentMonth = now();
        $appointmentCounts = $this->getMonthlyAppointmentCounts($vendorStore->id, $currentMonth);
        
        // Get recent appointments for sidebar
        $recentAppointments = Appointment::where('vendor_store_id', $vendorStore->id)
            ->with(['vendorStore', 'rider', 'vendorProductService.images']) // Load all necessary relationships including service and images
            ->whereDate('appointment_date', '>=', now())
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->limit(10)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_number' => $appointment->appointment_number,
                    'customer_name' => $appointment->customer_name,
                    'customer_email' => $appointment->customer_email,
                    'customer_phone' => $appointment->customer_phone,
                    'customer_address' => $appointment->customer_address,
                    'customer_city' => $appointment->customer_city,
                    'emergency_contact_name' => $appointment->emergency_contact_name,
                    'emergency_contact_phone' => $appointment->emergency_contact_phone,
                    'service_name' => $appointment->service_name ?? $appointment->service_type ?? 'General Service',
                    'service_id' => $appointment->service_id,
                    'service_price' => $appointment->service_price,
                    'total_amount' => $appointment->total_amount,
                    'appointment_date' => $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : null,
                    'appointment_time' => Carbon::parse($appointment->appointment_time)->format('g:i A'),
                    'estimated_end_time' => $appointment->estimated_end_time,
                    'duration_minutes' => $appointment->duration_minutes,
                    'status' => $appointment->status,
                    'notes' => $appointment->notes,
                    'customer_notes' => $appointment->customer_notes,
                    'requirements' => $appointment->requirements ?? [],
                    'is_home_service' => $appointment->is_home_service,
                    'service_address' => $appointment->service_address,
                    'payment_status' => $appointment->payment_status,
                    'payment_method' => $appointment->payment_method,
                    'payment_reference' => $appointment->payment_reference,
                    'sms_notifications' => $appointment->sms_notifications,
                    'email_notifications' => $appointment->email_notifications,
                    'customer_rating' => $appointment->customer_rating,
                    'customer_feedback' => $appointment->customer_feedback,
                    'confirmed_at' => $appointment->confirmed_at,
                    'started_at' => $appointment->started_at,
                    'completed_at' => $appointment->completed_at,
                    'cancelled_at' => $appointment->cancelled_at,
                    'cancellation_reason' => $appointment->cancellation_reason,
                    'created_at' => $appointment->created_at,
                    'updated_at' => $appointment->updated_at,
                    'vendor_store' => $appointment->vendorStore ? [
                        'id' => $appointment->vendorStore->id,
                        'name' => $appointment->vendorStore->business_name,
                        'store_type' => $appointment->vendorStore->business_type,
                        'phone' => $appointment->vendorStore->contact_phone,
                        'email' => $appointment->vendorStore->contact_email,
                        'address' => $appointment->vendorStore->address,
                        'city' => $appointment->vendorStore->city,
                        'state' => $appointment->vendorStore->state,
                        'zip_code' => $appointment->vendorStore->zip_code,
                    ] : null,
                    'rider' => $appointment->rider ? [
                        'id' => $appointment->rider->id,
                        'name' => $appointment->rider->name,
                        'email' => $appointment->rider->email,
                        'phone' => $appointment->rider->phone,
                        'vehicle_type' => $appointment->rider->vehicle_type,
                        'license_number' => $appointment->rider->license_number,
                        'status' => $appointment->rider->status,
                    ] : null,
                    'vendor_product_service' => $appointment->vendorProductService ? [
                        'id' => $appointment->vendorProductService->id,
                        'name' => $appointment->vendorProductService->name,
                        'description' => $appointment->vendorProductService->description,
                        'price' => $appointment->vendorProductService->price,
                        'discounted_price' => $appointment->vendorProductService->discounted_price,
                        'category' => $appointment->vendorProductService->category,
                        'subcategory' => $appointment->vendorProductService->subcategory,
                        'service_type' => $appointment->vendorProductService->service_type,
                        'duration_minutes' => $appointment->vendorProductService->duration_minutes,
                        'is_available' => $appointment->vendorProductService->is_available,
                        'guarantee' => $appointment->vendorProductService->guarantee,
                        'ratings' => $appointment->vendorProductService->ratings,
                        'features' => $appointment->vendorProductService->features ? json_decode($appointment->vendorProductService->features, true) : [],
                        'images' => $appointment->vendorProductService->images ? $appointment->vendorProductService->images->map(function ($image) {
                            return [
                                'id' => $image->id,
                                'image_path' => $image->image_path,
                                'is_primary' => $image->is_primary,
                                'full_url' => asset('storage/' . $image->image_path)
                            ];
                        }) : [],
                    ] : null,
                ];
            });

        // Get statistics
        $stats = $this->getAppointmentStats($vendorStore->id);

        return Inertia::render('vendor/appointments/Index-appointments', [
            'appointmentCounts' => $appointmentCounts,
            'recentAppointments' => $recentAppointments,
            'stats' => $stats,
            'vendorStore' => $vendorStore
        ]);
    }

    /**
     * Get appointments for a specific month
     */
    public function getMonthlyAppointments(Request $request)
    {
        $vendorStore = VendorStore::where('user_id', auth()->id())->first();
        
        if (!$vendorStore) {
            return response()->json(['error' => 'Store not found'], 404);
        }

        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);
        
        $date = Carbon::create($year, $month, 1);
        $appointmentCounts = $this->getMonthlyAppointmentCounts($vendorStore->id, $date);

        return response()->json($appointmentCounts);
    }

    /**
     * Get appointments for a specific day
     */
    public function getDayAppointments(Request $request)
    {
        $vendorStore = VendorStore::where('user_id', auth()->id())->first();
        
        if (!$vendorStore) {
            return response()->json(['error' => 'Store not found'], 404);
        }

        $date = $request->get('date');
        
        $appointments = Appointment::where('vendor_store_id', $vendorStore->id)
            ->whereDate('appointment_date', $date)
            ->with(['vendorStore', 'rider', 'vendorProductService.images']) // Load all necessary relationships including service and images
            ->orderBy('appointment_time')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_number' => $appointment->appointment_number,
                    'customer_name' => $appointment->customer_name,
                    'customer_email' => $appointment->customer_email,
                    'customer_phone' => $appointment->customer_phone,
                    'customer_address' => $appointment->customer_address,
                    'customer_city' => $appointment->customer_city,
                    'emergency_contact_name' => $appointment->emergency_contact_name,
                    'emergency_contact_phone' => $appointment->emergency_contact_phone,
                    'service_name' => $appointment->service_name ?? $appointment->service_type ?? 'General Service',
                    'service_id' => $appointment->service_id,
                    'service_price' => $appointment->service_price,
                    'total_amount' => $appointment->total_amount,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'estimated_end_time' => $appointment->estimated_end_time,
                    'duration_minutes' => $appointment->duration_minutes,
                    'status' => $appointment->status,
                    'notes' => $appointment->notes,
                    'customer_notes' => $appointment->customer_notes,
                    'requirements' => $appointment->requirements ?? [],
                    'is_home_service' => $appointment->is_home_service,
                    'service_address' => $appointment->service_address,
                    'payment_status' => $appointment->payment_status,
                    'payment_method' => $appointment->payment_method,
                    'payment_reference' => $appointment->payment_reference,
                    'sms_notifications' => $appointment->sms_notifications,
                    'email_notifications' => $appointment->email_notifications,
                    'customer_rating' => $appointment->customer_rating,
                    'customer_feedback' => $appointment->customer_feedback,
                    'confirmed_at' => $appointment->confirmed_at,
                    'started_at' => $appointment->started_at,
                    'completed_at' => $appointment->completed_at,
                    'cancelled_at' => $appointment->cancelled_at,
                    'cancellation_reason' => $appointment->cancellation_reason,
                    'created_at' => $appointment->created_at,
                    'updated_at' => $appointment->updated_at,
                    'vendor_store' => $appointment->vendorStore ? [
                        'id' => $appointment->vendorStore->id,
                        'name' => $appointment->vendorStore->business_name,
                        'store_type' => $appointment->vendorStore->business_type,
                        'phone' => $appointment->vendorStore->contact_phone,
                        'email' => $appointment->vendorStore->contact_email,
                        'address' => $appointment->vendorStore->address,
                        'city' => $appointment->vendorStore->city,
                        'state' => $appointment->vendorStore->state,
                        'zip_code' => $appointment->vendorStore->zip_code,
                    ] : null,
                    'rider' => $appointment->rider ? [
                        'id' => $appointment->rider->id,
                        'name' => $appointment->rider->name,
                        'email' => $appointment->rider->email,
                        'phone' => $appointment->rider->phone,
                        'vehicle_type' => $appointment->rider->vehicle_type,
                        'license_number' => $appointment->rider->license_number,
                        'status' => $appointment->rider->status,
                    ] : null,
                    'vendor_product_service' => $appointment->vendorProductService ? [
                        'id' => $appointment->vendorProductService->id,
                        'name' => $appointment->vendorProductService->name,
                        'description' => $appointment->vendorProductService->description,
                        'price' => $appointment->vendorProductService->price,
                        'discounted_price' => $appointment->vendorProductService->discounted_price,
                        'category' => $appointment->vendorProductService->category,
                        'subcategory' => $appointment->vendorProductService->subcategory,
                        'service_type' => $appointment->vendorProductService->service_type,
                        'duration_minutes' => $appointment->vendorProductService->duration_minutes,
                        'is_available' => $appointment->vendorProductService->is_available,
                        'guarantee' => $appointment->vendorProductService->guarantee,
                        'ratings' => $appointment->vendorProductService->ratings,
                        'features' => $appointment->vendorProductService->features ? json_decode($appointment->vendorProductService->features, true) : [],
                        'images' => $appointment->vendorProductService->images ? $appointment->vendorProductService->images->map(function ($image) {
                            return [
                                'id' => $image->id,
                                'image_path' => $image->image_path,
                                'is_primary' => $image->is_primary,
                                'full_url' => asset('storage/' . $image->image_path)
                            ];
                        }) : [],
                    ] : null,
                ];
            });

        return response()->json($appointments);
    }

    /**
     * Update appointment status
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        try {
            $vendorStore = VendorStore::where('user_id', auth()->id())->first();
            
            if (!$vendorStore || $appointment->vendor_store_id !== $vendorStore->id) {
                return back()->withErrors(['error' => 'Unauthorized to update this appointment.']);
            }

            $request->validate([
                'status' => 'required|in:pending,confirmed,cancelled,completed'
            ]);

            // Prepare update data
            $updateData = ['status' => $request->status];
            
            // Set appropriate timestamps based on status
            switch ($request->status) {
                case 'confirmed':
                    $updateData['confirmed_at'] = now();
                    break;
                case 'cancelled':
                    $updateData['cancelled_at'] = now();
                    break;
                case 'completed':
                    $updateData['completed_at'] = now();
                    break;
                case 'pending':
                    // Reset timestamps when reverting to pending
                    $updateData['confirmed_at'] = null;
                    $updateData['cancelled_at'] = null;
                    $updateData['completed_at'] = null;
                    break;
            }

            $appointment->update($updateData);

            // Return Inertia response with success message
            return back()->with('success', "Appointment status updated to {$request->status} successfully!");

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            \Log::error('Error updating appointment status', [
                'error' => $e->getMessage(),
                'appointment_id' => $appointment->id,
                'user_id' => auth()->id()
            ]);

            return back()->withErrors(['error' => 'Failed to update appointment status. Please try again.']);
        }
    }

    /**
     * Show detailed appointments page with pagination
     */
    public function details(Request $request)
    {
        $vendorStore = VendorStore::where('user_id', auth()->id())->first();
        
        if (!$vendorStore) {
            return redirect()->route('vendor.dashboard')->with('error', 'Please complete your store setup first.');
        }

        $query = Appointment::where('vendor_store_id', $vendorStore->id)
            ->with(['user', 'rider', 'vendorStore', 'vendorProductService.images']); // Add rider and vendorStore relationships including service and images

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('appointment_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('appointment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('appointment_date', '<=', $request->date_to);
        }

        // Get appointments with pagination
        $appointments = $query->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->paginate(10);

        // Transform appointments data
        $appointments->getCollection()->transform(function ($appointment) {
            return [
                'id' => $appointment->id,
                'appointment_number' => $appointment->appointment_number ?? 'APT-' . str_pad($appointment->id, 6, '0', STR_PAD_LEFT),
                'customer_name' => $appointment->customer_name,
                'customer_email' => $appointment->customer_email,
                'customer_phone' => $appointment->customer_phone,
                'customer_address' => $appointment->customer_address,
                'customer_city' => $appointment->customer_city,
                'emergency_contact_name' => $appointment->emergency_contact_name,
                'emergency_contact_phone' => $appointment->emergency_contact_phone,
                'service_name' => $appointment->service_name ?? $appointment->service_type ?? 'General Service',
                'service_description' => $appointment->service_description ?? '',
                'appointment_date' => $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : now()->format('Y-m-d'),
                'appointment_time' => $appointment->appointment_time ?? '09:00:00',
                'estimated_end_time' => $appointment->estimated_end_time,
                'duration_minutes' => $appointment->duration_minutes ?? 60,
                'service_price' => $appointment->service_price ?? 0,
                'additional_charges' => $appointment->additional_charges ?? 0,
                'discount_amount' => $appointment->discount_amount ?? 0,
                'total_amount' => $appointment->total_amount ?? 0,
                'currency' => $appointment->currency ?? 'PHP',
                'status' => $appointment->status ?? 'pending',
                'customer_notes' => $appointment->customer_notes,
                'internal_notes' => $appointment->internal_notes,
                'requirements' => $appointment->requirements ? json_decode($appointment->requirements, true) : [],
                'sms_notifications' => $appointment->sms_notifications ?? false,
                'email_notifications' => $appointment->email_notifications ?? false,
                'is_home_service' => $appointment->is_home_service ?? false,
                'service_address' => $appointment->service_address,
                'weather_conditions' => $appointment->weather_conditions,
                'payment_status' => $appointment->payment_status ?? 'pending',
                'payment_method' => $appointment->payment_method,
                'payment_reference' => $appointment->payment_reference,
                'customer_rating' => $appointment->customer_rating,
                'customer_feedback' => $appointment->customer_feedback,
                'confirmed_at' => $appointment->confirmed_at?->format('Y-m-d H:i:s'),
                'started_at' => $appointment->started_at?->format('Y-m-d H:i:s'),
                'completed_at' => $appointment->completed_at?->format('Y-m-d H:i:s'),
                'cancelled_at' => $appointment->cancelled_at?->format('Y-m-d H:i:s'),
                'cancellation_reason' => $appointment->cancellation_reason,
                'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                
                // Relationships
                'vendor_store' => $appointment->vendorStore ? [
                    'id' => $appointment->vendorStore->id,
                    'business_name' => $appointment->vendorStore->business_name,
                    'business_type' => $appointment->vendorStore->business_type,
                    'address' => $appointment->vendorStore->address,
                    'contact_phone' => $appointment->vendorStore->contact_phone,
                    'contact_email' => $appointment->vendorStore->contact_email,
                    'logo_path' => $appointment->vendorStore->logo_path,
                ] : null,
                'rider' => $appointment->rider ? [
                    'id' => $appointment->rider->id,
                    'name' => $appointment->rider->name,
                    'email' => $appointment->rider->email,
                    'phone' => $appointment->rider->phone,
                    'rider_id' => $appointment->rider->rider_id,
                    'vehicle_type' => $appointment->rider->vehicle_type,
                    'license_number' => $appointment->rider->license_number,
                    'status' => $appointment->rider->status,
                    'rating' => $appointment->rider->rating,
                ] : null,
            ];
        });

        // Get stats
        $stats = [
            'total' => Appointment::where('vendor_store_id', $vendorStore->id)->count(),
            'pending' => Appointment::where('vendor_store_id', $vendorStore->id)->where('status', 'pending')->count(),
            'confirmed' => Appointment::where('vendor_store_id', $vendorStore->id)->where('status', 'confirmed')->count(),
            'completed' => Appointment::where('vendor_store_id', $vendorStore->id)->where('status', 'completed')->count(),
            'cancelled' => Appointment::where('vendor_store_id', $vendorStore->id)->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('vendor/appointments/details-appointments', [
            'appointments' => $appointments,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
            'stats' => $stats
        ]);
    }

    /**
     * Get monthly appointment counts by day
     */
    private function getMonthlyAppointmentCounts($vendorStoreId, Carbon $date)
    {
        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();

        $appointments = Appointment::where('vendor_store_id', $vendorStoreId)
            ->whereBetween('appointment_date', [$startOfMonth, $endOfMonth])
            ->select('appointment_date', 'status', DB::raw('count(*) as count'))
            ->groupBy('appointment_date', 'status')
            ->get();

        $result = [];
        foreach ($appointments as $appointment) {
            $day = $appointment->appointment_date->format('Y-m-d');
            if (!isset($result[$day])) {
                $result[$day] = [
                    'date' => $day,
                    'total' => 0,
                    'pending' => 0,
                    'confirmed' => 0,
                    'cancelled' => 0,
                    'completed' => 0,
                ];
            }
            $result[$day][$appointment->status] = $appointment->count;
            $result[$day]['total'] += $appointment->count;
        }

        return array_values($result);
    }

    /**
     * Get appointment statistics
     */
    private function getAppointmentStats($vendorStoreId)
    {
        $today = now()->toDateString();
        $thisWeek = [now()->startOfWeek(), now()->endOfWeek()];
        $thisMonth = [now()->startOfMonth(), now()->endOfMonth()];

        return [
            'today' => Appointment::where('vendor_store_id', $vendorStoreId)
                ->whereDate('appointment_date', $today)
                ->count(),
            'this_week' => Appointment::where('vendor_store_id', $vendorStoreId)
                ->whereBetween('appointment_date', $thisWeek)
                ->count(),
            'this_month' => Appointment::where('vendor_store_id', $vendorStoreId)
                ->whereBetween('appointment_date', $thisMonth)
                ->count(),
            'total' => Appointment::where('vendor_store_id', $vendorStoreId)->count(),
            'pending' => Appointment::where('vendor_store_id', $vendorStoreId)
                ->where('status', 'pending')
                ->count(),
            'confirmed' => Appointment::where('vendor_store_id', $vendorStoreId)
                ->where('status', 'confirmed')
                ->count(),
            'completed' => Appointment::where('vendor_store_id', $vendorStoreId)
                ->where('status', 'completed')
                ->count(),
        ];
    }
}
