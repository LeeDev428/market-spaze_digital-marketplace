<?php

namespace App\Http\Controllers\Rider;

use App\Http\Controllers\Controller;
use App\Models\Rider;
use App\Models\Appointment;
use App\Models\RiderEarning;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RiderDeliveryController extends Controller
{
    /**
     * Display active deliveries/appointments
     */
    public function active()
    {
        try {
            // Get authenticated rider directly - use same approach as dashboard
            $rider = Auth::guard('rider')->user();
            
            // If rider auth fails, try getting first rider (for debugging)
            if (!$rider) {
                $rider = \App\Models\Rider::first();
                if (!$rider) {
                    return Inertia::render('rider/active-deliveries/Index-active-deliveries', [
                        'appointments' => collect([]),
                        'stats' => [
                            'total_active' => 0,
                            'pending_count' => 0,
                            'confirmed_count' => 0,
                            'in_progress_count' => 0,
                            'today_earnings' => 0,
                        ],
                        'error' => 'No rider account found. Please contact support.'
                    ]);
                }
            }
            
            // ✅ FIXED: Get appointments properly filtered - show ALL relevant appointments
            $appointments = Appointment::with(['vendorStore', 'service', 'user'])
                ->where(function($query) use ($rider) {
                    // Show all appointments that riders can interact with:
                    // 1. Available appointments (confirmed by vendor, not assigned to any rider)
                    $query->where(function($q) {
                        $q->where('status', 'confirmed')
                          ->whereNull('rider_id');
                    })
                    // 2. Rider's own assignments (in_progress, completed today)
                    ->orWhere(function($q) use ($rider) {
                        $q->where('rider_id', $rider->id)
                          ->whereIn('status', ['in_progress', 'completed'])
                          ->whereDate('appointment_date', '>=', Carbon::today()->subDays(1));
                    })
                    // 3. Show pending appointments (so riders can see what's coming)
                    ->orWhere(function($q) {
                        $q->where('status', 'pending')
                          ->whereDate('appointment_date', '>=', Carbon::today());
                    });
                })
                ->whereDate('appointment_date', '>=', Carbon::today()->subDays(1)) // Show today and future
                ->orderBy('appointment_date')
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
                        'appointment_date' => $appointment->appointment_date instanceof \Carbon\Carbon 
                            ? $appointment->appointment_date->format('Y-m-d') 
                            : $appointment->appointment_date,
                        'appointment_time' => $appointment->appointment_time,
                        'estimated_end_time' => $appointment->estimated_end_time,
                        'duration_minutes' => $appointment->duration_minutes,
                        'service_price' => $appointment->service_price,
                        'total_amount' => $appointment->total_amount,
                        'status' => $appointment->status,
                        'customer_notes' => $appointment->customer_notes,
                        'is_home_service' => $appointment->is_home_service,
                        'service_address' => $appointment->service_address,
                        'rider_id' => $appointment->rider_id,
                        'vendor_store' => $appointment->vendorStore ? [
                            'id' => $appointment->vendorStore->id,
                            'store_name' => $appointment->vendorStore->business_name ?? 'Unknown Store',
                            'store_address' => $appointment->vendorStore->address ?? '',
                            'store_phone' => $appointment->vendorStore->phone ?? '',
                        ] : null,
                        'service' => $appointment->service ? [
                            'id' => $appointment->service->id,
                            'service_name' => $appointment->service->name ?? 'Unknown Service',
                            'service_description' => $appointment->service->description ?? '',
                        ] : null,
                    ];
                });

            // Calculate stats properly
            $stats = [
                'total_active' => $appointments->count(),
                'pending_count' => $appointments->where('status', 'pending')->count(),
                'confirmed_count' => $appointments->where('status', 'confirmed')
                                                  ->where('rider_id', null)->count(),
                'in_progress_count' => $appointments->where('status', 'in_progress')
                                                    ->where('rider_id', $rider->id)->count(),
                'today_earnings' => $this->calculateTodayEarnings($rider),
            ];

            // ✅ FIXED: Use the correct component name
            return Inertia::render('rider/active-deliveries/Index-active-deliveries', [
                'appointments' => $appointments,
                'stats' => $stats,
                'rider' => [  // ✅ ADD this missing rider data
                    'id' => $rider->id,
                    'rider_id' => $rider->rider_id,
                    'name' => $rider->name, // Use rider's name, not auth user
                    'phone' => $rider->phone ?? '',
                    'vehicle_type' => $rider->vehicle_type,
                    'status' => $rider->status,
                    'rating' => $rider->rating,
                    'total_deliveries' => $rider->total_deliveries ?? 0,
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Active deliveries error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return Inertia::render('rider/active-deliveries/Index-active-deliveries', [
                'appointments' => collect([]),
                'stats' => [
                    'total_active' => 0,
                    'pending_count' => 0,
                    'confirmed_count' => 0,
                    'in_progress_count' => 0,
                    'today_earnings' => 0,
                ],
                'rider' => [  // ✅ ADD rider data for error case too
                    'id' => 0,
                    'rider_id' => 'UNKNOWN',
                    'name' => 'Unknown Rider',
                    'phone' => '',
                    'vehicle_type' => 'Motorcycle',
                    'status' => 'offline',
                    'rating' => 5.0,
                    'total_deliveries' => 0,
                ],
                'error' => 'Unable to load active deliveries. Please try again.'
            ]);
        }
    }

    /**
     * Show specific appointment details
     */
    public function show(Appointment $appointment)
    {
        try {
            $rider = Auth::guard('rider')->user();
            
            if (!$rider) {
                return redirect()->route('login')->with('error', 'Please log in as a rider.');
            }
            
            $appointment->load(['vendorStore', 'service', 'user']);
            
            return Inertia::render('rider/active-deliveries/read-active-deliveries', [
                'appointment' => $appointment,
                'rider' => [
                    'id' => $rider->id,
                    'name' => $rider->name,
                    'phone' => $rider->phone ?? '',
                    'vehicle_type' => $rider->vehicle_type,
                    'status' => $rider->status,
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Show appointment error: ' . $e->getMessage());
            
            return redirect()->route('rider.deliveries.active')
                ->with('error', 'Unable to load appointment details.');
        }
    }

    /**
     * Show job acceptance page
     */
    public function getJob(Appointment $appointment)
    {
        try {
            $rider = Auth::guard('rider')->user();
            
            if (!$rider) {
                return redirect()->route('login')->with('error', 'Please log in as a rider.');
            }
            
            // ✅ FIXED: Only allow getting CONFIRMED appointments (confirmed by vendor)
            if ($appointment->status !== 'confirmed') {
                $message = match($appointment->status) {
                    'pending' => 'This appointment needs to be confirmed by the vendor first.',
                    'in_progress' => 'This appointment is already in progress.',
                    'completed' => 'This appointment has already been completed.',
                    'cancelled' => 'This appointment has been cancelled.',
                    default => 'This appointment is not available for assignment.'
                };
                
                return redirect()->route('rider.deliveries.show', $appointment)
                    ->with('error', $message);
            }
            
            // ✅ Check if already assigned to another rider
            if ($appointment->rider_id !== null) {
                return redirect()->route('rider.deliveries.show', $appointment)
                    ->with('error', 'This appointment has already been assigned to another rider.');
            }
            
            $appointment->load(['vendorStore', 'service', 'user']);
            
            // ✅ FIXED: Prepare appointment data properly
            $appointmentData = [
                'id' => $appointment->id,
                'appointment_number' => $appointment->appointment_number,
                'customer_name' => $appointment->customer_name,
                'customer_email' => $appointment->customer_email,
                'customer_phone' => $appointment->customer_phone,
                'customer_address' => $appointment->customer_address,
                'customer_city' => $appointment->customer_city,
                'emergency_contact_name' => $appointment->emergency_contact_name,
                'emergency_contact_phone' => $appointment->emergency_contact_phone,
                'appointment_date' => $appointment->appointment_date instanceof \Carbon\Carbon 
                    ? $appointment->appointment_date->format('Y-m-d') 
                    : $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'estimated_end_time' => $appointment->estimated_end_time,
                'duration_minutes' => $appointment->duration_minutes,
                'service_price' => $appointment->service_price,
                'total_amount' => $appointment->total_amount,
                'status' => $appointment->status,
                'customer_notes' => $appointment->customer_notes,
                'is_home_service' => $appointment->is_home_service,
                'service_address' => $appointment->service_address,
                'rider_id' => $appointment->rider_id,
                'vendor_store' => $appointment->vendorStore ? [
                    'id' => $appointment->vendorStore->id,
                    'store_name' => $appointment->vendorStore->business_name ?? 'Unknown Store',
                    'store_address' => $appointment->vendorStore->address ?? '',
                    'store_phone' => $appointment->vendorStore->phone ?? '',
                ] : null,
                'service' => $appointment->service ? [
                    'id' => $appointment->service->id,
                    'service_name' => $appointment->service->name ?? 'Unknown Service',
                    'service_description' => $appointment->service->description ?? '',
                ] : null,
            ];
            
            return Inertia::render('rider/active-deliveries/get-active-deliveries', [
                'appointment' => $appointmentData,
                'rider' => [
                    'id' => $rider->id,
                    'rider_id' => $rider->rider_id,
                    'name' => $rider->name,
                    'phone' => $rider->phone ?? '',
                    'vehicle_type' => $rider->vehicle_type,
                    'status' => $rider->status,
                    'rating' => $rider->rating,
                    'total_deliveries' => $rider->total_deliveries ?? 0,
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Get job error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->route('rider.deliveries.active')
                ->with('error', 'Unable to load job details. Please try again.');
        }
    }

    /**
     * Accept an appointment (Rider accepts a CONFIRMED appointment)
     */
    public function accept(Request $request, Appointment $appointment)
    {
        // ✅ DETAILED LOGGING - Let's see everything
        \Log::info('🚀 ACCEPT JOB STARTED', [
            'rider_id' => Auth::guard('rider')->id(),
            'appointment_id' => $appointment->id,
            'appointment_status' => $appointment->status,
            'appointment_rider_id' => $appointment->rider_id,
            'request_method' => $request->method(),
            'request_url' => $request->url(),
            'request_all' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        try {
            // ✅ Get authenticated rider directly (no user_id lookup needed)
            $rider = Auth::guard('rider')->user();
            
            if (!$rider) {
                \Log::error('❌ Rider not authenticated');
                return back()->with('error', 'Please log in as a rider to continue.');
            }

            \Log::info('✅ Rider found', [
                'rider_id' => $rider->id,
                'rider_email' => $rider->email,
                'rider_status' => $rider->status
            ]);
            
            // ✅ Validate form data
            $validatedData = $request->validate([
                'estimated_arrival_time' => 'nullable|string|max:100',
                'rider_notes' => 'nullable|string|max:500',
                'accept_terms' => 'required|boolean|accepted',
            ]);

            \Log::info('✅ Validation passed', ['validated_data' => $validatedData]);
            
            // ✅ Check appointment status
            if ($appointment->status !== 'confirmed') {
                \Log::warning('⚠️ Appointment not confirmed', [
                    'current_status' => $appointment->status,
                    'required' => 'confirmed'
                ]);
                return back()->with('error', 'This appointment must be confirmed by the vendor first.');
            }

            // ✅ Check if already assigned
            if ($appointment->rider_id !== null) {
                \Log::warning('⚠️ Already assigned', [
                    'current_rider_id' => $appointment->rider_id,
                    'attempting_rider_id' => $rider->id
                ]);
                return back()->with('error', 'This appointment has already been assigned to another rider.');
            }

            \Log::info('✅ All checks passed, updating appointment...');

            // ✅ SIMPLE UPDATE - No transaction for now to debug easier
            $beforeUpdate = [
                'id' => $appointment->id,
                'status' => $appointment->status,
                'rider_id' => $appointment->rider_id,
            ];

            \Log::info('📋 Before update', $beforeUpdate);

            // ✅ Update the appointment
            $appointment->update([
                'status' => 'in_progress',
                'rider_id' => $rider->id,
                'started_at' => Carbon::now(),
            ]);

            // ✅ Refresh to get latest data
            $appointment->refresh();

            $afterUpdate = [
                'id' => $appointment->id,
                'status' => $appointment->status,
                'rider_id' => $appointment->rider_id,
            ];

            \Log::info('📋 After update', $afterUpdate);

            // ✅ Double check with fresh query
            $freshAppointment = Appointment::find($appointment->id);
            \Log::info('🔍 Fresh from DB', [
                'id' => $freshAppointment->id,
                'status' => $freshAppointment->status,
                'rider_id' => $freshAppointment->rider_id,
            ]);

            // ✅ Update rider status
            // Update rider status to busy
            $rider->status = 'busy';
            $rider->save();
            \Log::info('✅ Rider status updated to busy');

            // ✅ Create earning record
            if (class_exists('App\Models\RiderEarning')) {
                try {
                    $earning = RiderEarning::create([
                        'rider_id' => $rider->id,
                        'appointment_id' => $appointment->id,
                        'amount' => 50.00,
                        'type' => 'bonus',
                        'description' => "Job acceptance bonus for appointment #{$appointment->appointment_number}",
                        'earned_at' => Carbon::now(),
                    ]);
                    \Log::info('💰 Earning created', ['earning_id' => $earning->id]);
                } catch (\Exception $earningError) {
                    \Log::warning('⚠️ Failed to create earning', ['error' => $earningError->getMessage()]);
                }
            }

            \Log::info('🎉 ACCEPT JOB COMPLETED SUCCESSFULLY');
            
            return redirect()->route('rider.deliveries.active')
                ->with('success', 'Job accepted successfully! You are now assigned to this appointment.');
                
        } catch (\Exception $e) {
            \Log::error('💥 Accept job error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->with('error', 'Failed to accept job. Please try again.');
        }
    }

    /**
     * Update appointment status
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        try {
            $rider = Auth::guard('rider')->user();
            
            if (!$rider) {
                return response()->json(['error' => 'Please log in as a rider'], 401);
            }

            $request->validate([
                'status' => 'required|in:completed,cancelled'
            ]);

            // Only allow status updates for rider's own appointments
            if ($appointment->rider_id !== $rider->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $appointment->update([
                'status' => $request->status,
                'completed_at' => $request->status === 'completed' ? Carbon::now() : null,
                'cancelled_at' => $request->status === 'cancelled' ? Carbon::now() : null,
            ]);

            // Update rider status back to available if job completed/cancelled
            if (in_array($request->status, ['completed', 'cancelled'])) {
                $rider->status = 'available';
                $rider->save();
                
                // Record completion earnings
                if ($request->status === 'completed') {
                    $commissionAmount = $appointment->total_amount * 0.15; // 15% commission
                    
                    RiderEarning::create([
                        'rider_id' => $rider->id,
                        'appointment_id' => $appointment->id,
                        'amount' => $commissionAmount,
                        'type' => 'service_commission',
                        'description' => "Service completion commission for appointment #{$appointment->appointment_number}",
                        'earned_at' => Carbon::now(),
                    ]);
                }
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Update status error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update status'], 500);
        }
    }

    /**
     * Calculate today's earnings
     */
    private function calculateTodayEarnings($rider)
    {
        try {
            $todayEarnings = RiderEarning::where('rider_id', $rider->id)
                ->whereDate('earned_at', Carbon::today())
                ->sum('amount');
                
            return $todayEarnings ?? 0;
        } catch (\Exception $e) {
            Log::error('Calculate earnings error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Display calendar view with appointments by date
     */
    public function calendar(Request $request)
    {
        try {
            $rider = Auth::guard('rider')->user();
            
            if (!$rider) {
                $rider = \App\Models\Rider::first();
                if (!$rider) {
                    return redirect()->route('login')->with('error', 'Please log in as a rider.');
                }
            }

            // Get current month and year from request or use current
            $currentYear = $request->input('year', Carbon::now()->year);
            $currentMonth = $request->input('month', Carbon::now()->format('F'));
            
            // Convert month name to number
            $monthNumber = Carbon::parse("$currentMonth 1")->month;
            
            // Get appointments for the current month
            $startOfMonth = Carbon::create($currentYear, $monthNumber, 1)->startOfMonth();
            $endOfMonth = Carbon::create($currentYear, $monthNumber, 1)->endOfMonth();
            
            $appointments = Appointment::with(['vendorStore', 'service', 'user'])
                ->whereBetween('appointment_date', [$startOfMonth, $endOfMonth])
                ->orderBy('appointment_date')
                ->orderBy('appointment_time')
                ->get();

            // Group appointments by date
            $appointmentsByDate = $appointments->groupBy(function($appointment) {
                return $appointment->appointment_date instanceof \Carbon\Carbon 
                    ? $appointment->appointment_date->format('Y-m-d') 
                    : $appointment->appointment_date;
            })->map(function($dateAppointments) {
                $date = $dateAppointments->first()->appointment_date instanceof \Carbon\Carbon 
                    ? $dateAppointments->first()->appointment_date->format('Y-m-d') 
                    : $dateAppointments->first()->appointment_date;
                
                return [
                    'date' => $date,
                    'total_count' => $dateAppointments->count(),
                    'pending_count' => $dateAppointments->where('status', 'pending')->count(),
                    'confirmed_count' => $dateAppointments->where('status', 'confirmed')->count(),
                    'in_progress_count' => $dateAppointments->where('status', 'in_progress')->count(),
                    'completed_count' => $dateAppointments->where('status', 'completed')->count(),
                    'cancelled_count' => $dateAppointments->where('status', 'cancelled')->count(),
                    'appointments' => $dateAppointments->map(function($appointment) {
                        return [
                            'id' => $appointment->id,
                            'appointment_number' => $appointment->appointment_number,
                            'customer_name' => $appointment->customer_name,
                            'appointment_time' => $appointment->appointment_time,
                            'status' => $appointment->status,
                            'service_name' => $appointment->service->name ?? 'Unknown Service',
                            'customer_phone' => $appointment->customer_phone,
                        ];
                    })->toArray()
                ];
            })->values()->toArray();

            // Calculate overall stats for the month
            $stats = [
                'total_appointments' => $appointments->count(),
                'pending_count' => $appointments->where('status', 'pending')->count(),
                'confirmed_count' => $appointments->where('status', 'confirmed')->count(),
                'in_progress_count' => $appointments->where('status', 'in_progress')->count(),
                'completed_count' => $appointments->where('status', 'completed')->count(),
                'cancelled_count' => $appointments->where('status', 'cancelled')->count(),
            ];

            return Inertia::render('rider/active-deliveries/all-appointments-calendar', [
                'appointmentsByDate' => $appointmentsByDate,
                'currentMonth' => $currentMonth,
                'currentYear' => $currentYear,
                'stats' => $stats,
                'rider' => [
                    'id' => $rider->id,
                    'rider_id' => $rider->rider_id,
                    'name' => $rider->name,
                    'phone' => $rider->phone ?? '',
                    'vehicle_type' => $rider->vehicle_type,
                    'status' => $rider->status,
                    'rating' => $rider->rating,
                    'total_deliveries' => $rider->total_deliveries ?? 0,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Calendar view error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->route('rider.deliveries.active')
                ->with('error', 'Unable to load calendar. Please try again.');
        }
    }

    /**
     * Display all appointments with pagination and filtering
     */
    public function all(Request $request)
    {
        try {
            $rider = Auth::guard('rider')->user();
            
            if (!$rider) {
                $rider = \App\Models\Rider::first();
                if (!$rider) {
                    return redirect()->route('login')->with('error', 'Please log in as a rider.');
                }
            }

            $query = Appointment::with(['vendorStore', 'service', 'user']);

            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('appointment_number', 'like', "%{$search}%")
                      ->orWhere('customer_name', 'like', "%{$search}%")
                      ->orWhere('customer_phone', 'like', "%{$search}%")
                      ->orWhere('customer_email', 'like', "%{$search}%");
                });
            }

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->filled('date_from')) {
                $query->whereDate('appointment_date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('appointment_date', '<=', $request->date_to);
            }

            // Order by date and time
            $query->orderBy('appointment_date', 'desc')
                  ->orderBy('appointment_time', 'desc');

            // Paginate
            $appointments = $query->paginate(10)->withQueryString();

            // Transform appointment data
            $appointments->getCollection()->transform(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_number' => $appointment->appointment_number,
                    'customer_name' => $appointment->customer_name,
                    'customer_email' => $appointment->customer_email,
                    'customer_phone' => $appointment->customer_phone,
                    'customer_address' => $appointment->customer_address,
                    'customer_city' => $appointment->customer_city,
                    'appointment_date' => $appointment->appointment_date instanceof \Carbon\Carbon 
                        ? $appointment->appointment_date->format('Y-m-d') 
                        : $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'estimated_end_time' => $appointment->estimated_end_time,
                    'duration_minutes' => $appointment->duration_minutes,
                    'service_price' => $appointment->service_price,
                    'total_amount' => $appointment->total_amount,
                    'status' => $appointment->status,
                    'customer_notes' => $appointment->customer_notes,
                    'is_home_service' => $appointment->is_home_service,
                    'service_address' => $appointment->service_address,
                    'rider_id' => $appointment->rider_id,
                    'vendor_store' => $appointment->vendorStore ? [
                        'id' => $appointment->vendorStore->id,
                        'store_name' => $appointment->vendorStore->business_name ?? 'Unknown Store',
                        'store_address' => $appointment->vendorStore->address ?? '',
                        'store_phone' => $appointment->vendorStore->phone ?? '',
                    ] : null,
                    'service' => $appointment->service ? [
                        'id' => $appointment->service->id,
                        'service_name' => $appointment->service->name ?? 'Unknown Service',
                        'service_description' => $appointment->service->description ?? '',
                        'category' => $appointment->service->category ?? '',
                    ] : null,
                ];
            });

            // Calculate stats
            $stats = [
                'total_appointments' => Appointment::count(),
                'pending_count' => Appointment::where('status', 'pending')->count(),
                'confirmed_count' => Appointment::where('status', 'confirmed')->whereNull('rider_id')->count(),
                'in_progress_count' => Appointment::where('status', 'in_progress')->count(),
                'completed_count' => Appointment::where('status', 'completed')->count(),
                'cancelled_count' => Appointment::where('status', 'cancelled')->count(),
            ];

            return Inertia::render('rider/active-deliveries/all-active-deliveries', [
                'appointments' => $appointments,
                'filters' => [
                    'search' => $request->search,
                    'status' => $request->status,
                    'date_from' => $request->date_from,
                    'date_to' => $request->date_to,
                ],
                'stats' => $stats,
                'rider' => [
                    'id' => $rider->id,
                    'rider_id' => $rider->rider_id,
                    'name' => $rider->name,
                    'phone' => $rider->phone ?? '',
                    'vehicle_type' => $rider->vehicle_type,
                    'status' => $rider->status,
                    'rating' => $rider->rating,
                    'total_deliveries' => $rider->total_deliveries ?? 0,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('All appointments error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->route('rider.deliveries.active')
                ->with('error', 'Unable to load appointments. Please try again.');
        }
    }

    /**
     * Display detailed appointment information
     */
    public function details(Appointment $appointment)
    {
        try {
            $rider = Auth::guard('rider')->user();
            
            if (!$rider) {
                $rider = \App\Models\Rider::first();
                if (!$rider) {
                    return redirect()->route('login')->with('error', 'Please log in as a rider.');
                }
            }

            // Load all necessary relationships
            $appointment->load(['vendorStore', 'service', 'user', 'rider']);
            
            // Transform appointment data with all comprehensive fields
            $appointmentData = [
                'id' => $appointment->id,
                'appointment_number' => $appointment->appointment_number,
                'customer_name' => $appointment->customer_name,
                'customer_email' => $appointment->customer_email,
                'customer_phone' => $appointment->customer_phone,
                'customer_address' => $appointment->customer_address,
                'customer_city' => $appointment->customer_city,
                'emergency_contact_name' => $appointment->emergency_contact_name,
                'emergency_contact_phone' => $appointment->emergency_contact_phone,
                'service_name' => $appointment->service_name,
                'service_id' => $appointment->service_id,
                'appointment_date' => $appointment->appointment_date instanceof \Carbon\Carbon 
                    ? $appointment->appointment_date->format('Y-m-d') 
                    : $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'estimated_end_time' => $appointment->estimated_end_time,
                'duration_minutes' => $appointment->duration_minutes,
                'service_price' => $appointment->service_price,
                'total_amount' => $appointment->total_amount,
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
                'rider_id' => $appointment->rider_id,
                'vendor_store' => $appointment->vendorStore ? [
                    'id' => $appointment->vendorStore->id,
                    'store_name' => $appointment->vendorStore->business_name ?? 'Unknown Store',
                    'business_name' => $appointment->vendorStore->business_name ?? '',
                    'business_type' => $appointment->vendorStore->business_type ?? '',
                    'store_address' => $appointment->vendorStore->address ?? '',
                    'address' => $appointment->vendorStore->address ?? '',
                    'city' => $appointment->vendorStore->city ?? '',
                    'state' => $appointment->vendorStore->state ?? '',
                    'zip_code' => $appointment->vendorStore->zip_code ?? '',
                    'store_phone' => $appointment->vendorStore->contact_phone ?? '',
                    'contact_phone' => $appointment->vendorStore->contact_phone ?? '',
                    'contact_email' => $appointment->vendorStore->contact_email ?? '',
                ] : null,
                'service' => $appointment->service ? [
                    'id' => $appointment->service->id,
                    'service_name' => $appointment->service->name ?? 'Unknown Service',
                    'service_description' => $appointment->service->description ?? '',
                    'category' => $appointment->service->category ?? '',
                ] : null,
                'user' => $appointment->user ? [
                    'id' => $appointment->user->id,
                    'name' => $appointment->user->name,
                    'email' => $appointment->user->email,
                    'phone' => $appointment->user->phone ?? '',
                ] : null,
                'rider' => $appointment->rider ? [
                    'id' => $appointment->rider->id,
                    'name' => $appointment->rider->name,
                    'email' => $appointment->rider->email,
                    'phone' => $appointment->rider->phone ?? '',
                    'vehicle_type' => $appointment->rider->vehicle_type ?? '',
                    'license_number' => $appointment->rider->license_number ?? '',
                    'status' => $appointment->rider->status ?? '',
                ] : null,
            ];
            
            return Inertia::render('rider/active-deliveries/appointment-details-active-deliveries', [
                'appointment' => $appointmentData,
                'rider' => [
                    'id' => $rider->id,
                    'rider_id' => $rider->rider_id,
                    'name' => $rider->name,
                    'phone' => $rider->phone ?? '',
                    'vehicle_type' => $rider->vehicle_type,
                    'status' => $rider->status,
                    'rating' => $rider->rating,
                    'total_deliveries' => $rider->total_deliveries ?? 0,
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Appointment details error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return redirect()->route('rider.deliveries.all')
                ->with('error', 'Unable to load appointment details. Please try again.');
        }
    }

}
