<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\VendorStore;
use App\Models\VendorProductService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    /**
     * Display the appointment booking page.
     */
    public function index()
    {
        // Get available stores for booking with their services
        $vendorStores = VendorStore::where('is_active', true)
            ->where('setup_completed', true)
            ->with([
                'user',
                'productsServices' => function($query) {
                    $query->where('is_active', true)
                          ->select('id', 'vendor_store_id', 'name', 'description', 'price_min', 'price_max', 'is_active');
                }
            ])
            ->select([
                'id',
                'business_name', 
                'description',
                'business_type',
                'address',
                'contact_phone',
                'contact_email',
                'logo_path',
                'serviceable_areas',
                'user_id'
            ])
            ->get()
            ->map(function ($store) {
                // Ensure logo_path is properly formatted
                if ($store->logo_path) {
                    $store->logo_path = basename($store->logo_path);
                }
                return $store;
            });

        return Inertia::render('appointments', [
            'vendorStores' => $vendorStores
        ]);
    }

    /**
     * Store a new appointment.
     */
    public function store(Request $request)
    {
        try {
            Log::info('=== APPOINTMENT BOOKING START ===');
            Log::info('Request data:', $request->all());

            // Enhanced Validation - Match the database migration structure
            $validated = $request->validate([
                'appointment_number' => 'required|string|unique:appointments,appointment_number',
                'vendor_store_id' => 'required|exists:vendor_stores,id',
                'service_id' => 'required|exists:vendor_product_services,id',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|string',
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_phone' => 'required|string|max:20',
                'customer_address' => 'nullable|string|max:500',
                'customer_city' => 'nullable|string|max:100',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'customer_notes' => 'nullable|string|max:1000',
                'requirements' => 'nullable|array',
                'sms_notifications' => 'boolean',
                'email_notifications' => 'boolean',
                'is_home_service' => 'boolean',
                'service_address' => 'nullable|string|max:500',
                // Keep legacy field for backward compatibility
                'notes' => 'nullable|string|max:1000'
            ]);

            Log::info('Validation passed:', $validated);

            // Verify service belongs to the selected vendor store
            $service = VendorProductService::where('id', $validated['service_id'])
                ->where('vendor_store_id', $validated['vendor_store_id'])
                ->where('is_active', true)
                ->first();

            if (!$service) {
                Log::error('Service validation failed', [
                    'service_id' => $validated['service_id'],
                    'vendor_store_id' => $validated['vendor_store_id']
                ]);
                return back()
                    ->withErrors(['service_id' => 'Selected service is not available for this provider.'])
                    ->withInput();
            }

            // Convert time to 24-hour format
            try {
                $timeIn24Hour = Carbon::createFromFormat('h:i A', $validated['appointment_time'])->format('H:i:s');
                Log::info('Time converted successfully', [
                    'original' => $validated['appointment_time'], 
                    'converted' => $timeIn24Hour
                ]);
            } catch (\Exception $e) {
                Log::error('Time conversion failed', [
                    'error' => $e->getMessage(), 
                    'time' => $validated['appointment_time']
                ]);
                return back()
                    ->withErrors(['appointment_time' => 'Invalid time format selected.'])
                    ->withInput();
            }

            // Check if the time slot is already booked
            $existingAppointment = Appointment::where('vendor_store_id', $validated['vendor_store_id'])
                ->where('appointment_date', $validated['appointment_date'])
                ->where('appointment_time', $timeIn24Hour)
                ->whereIn('status', ['pending', 'confirmed'])
                ->first();

            if ($existingAppointment) {
                Log::info('Time slot already booked', [
                    'vendor_store_id' => $validated['vendor_store_id'],
                    'appointment_date' => $validated['appointment_date'],
                    'appointment_time' => $timeIn24Hour
                ]);
                return back()
                    ->withErrors(['appointment_time' => 'This time slot is already booked. Please choose another time.'])
                    ->withInput();
            }

            // Calculate estimated end time based on service duration
            $estimatedEndTime = null;
            if ($service->duration_minutes) {
                $estimatedEndTime = Carbon::createFromFormat('H:i:s', $timeIn24Hour)
                    ->addMinutes($service->duration_minutes)
                    ->format('H:i:s');
            }

            // Prepare comprehensive appointment data
            $appointmentData = [
                'appointment_number' => $validated['appointment_number'],
                'user_id' => Auth::id(),
                'vendor_store_id' => (int)$validated['vendor_store_id'],
                'service_id' => (int)$validated['service_id'],
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $timeIn24Hour,
                'estimated_end_time' => $estimatedEndTime,
                'duration_minutes' => $service->duration_minutes ?? 60,
                'service_price' => $service->price_min,
                'total_amount' => $service->price_min,
                'currency' => 'PHP',
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'customer_address' => $validated['customer_address'] ?? null,
                'customer_city' => $validated['customer_city'] ?? null,
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                'customer_notes' => $validated['customer_notes'] ?? $validated['notes'] ?? null,
                'requirements' => $validated['requirements'] ?? null,
                'sms_notifications' => $validated['sms_notifications'] ?? true,
                'email_notifications' => $validated['email_notifications'] ?? true,
                'is_home_service' => $validated['is_home_service'] ?? false,
                'service_address' => $validated['service_address'] ?? null,
                'status' => 'pending',
                'payment_status' => 'pending'
            ];

            Log::info('Creating appointment with data:', $appointmentData);

            // Create the appointment
            $appointment = Appointment::create($appointmentData);

            Log::info('Appointment created successfully', [
                'id' => $appointment->id,
                'appointment_number' => $appointment->appointment_number
            ]);

            Log::info('=== APPOINTMENT BOOKING SUCCESS ===');

            return back()->with('success', 'Appointment booked successfully! Reference: #' . $appointment->appointment_number);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', [
                'errors' => $e->errors()
            ]);
            return back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            Log::error('=== APPOINTMENT BOOKING ERROR ===', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->withErrors(['general' => 'Failed to create appointment. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Show appointment success page.
     */
    public function success(Appointment $appointment)
    {
        $appointment->load(['vendorStore', 'service']);

        return Inertia::render('appointment-success', [
            'appointment' => $appointment
        ]);
    }

    /**
     * Get available time slots for a specific date and store.
     */
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'vendor_store_id' => 'required|exists:vendor_stores,id',
            'date' => 'required|date'
        ]);

        $allSlots = [
            '08:00', '09:00', '10:00', '11:00',
            '13:00', '14:00', '15:00', '16:00', '17:00'
        ];

        // Get booked slots for the date
        $bookedSlots = Appointment::where('vendor_store_id', $request->vendor_store_id)
            ->where('appointment_date', $request->date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->pluck('appointment_time')
            ->map(function ($time) {
                return Carbon::parse($time)->format('H:i');
            })
            ->toArray();

        // Filter out booked slots
        $availableSlots = array_filter($allSlots, function ($slot) use ($bookedSlots) {
            return !in_array($slot, $bookedSlots);
        });

        return response()->json([
            'available_slots' => array_values($availableSlots)
        ]);
    }

    /**
     * Cancel an appointment.
     */
    public function cancel(Request $request, Appointment $appointment)
    {
        try {
            // Check if user can cancel this appointment
            if (Auth::id() !== $appointment->user_id && $request->customer_email !== $appointment->customer_email) {
                abort(403, 'Unauthorized to cancel this appointment.');
            }

            $validated = $request->validate([
                'cancellation_reason' => 'nullable|string|max:500'
            ]);

            $appointment->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $validated['cancellation_reason'] ?? 'No reason provided'
            ]);

            return back()->with('success', 'Appointment cancelled successfully.');

        } catch (\Exception $e) {
            Log::error('Failed to cancel appointment', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage()
            ]);
            return back()->with('error', 'Failed to cancel appointment. Please try again.');
        }
    }

    /**
     * Show customer's appointments.
     */
    public function myAppointments()
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $appointments = Appointment::where('user_id', Auth::id())
            ->with(['vendorStore', 'service'])
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->paginate(10);

        return Inertia::render('my-appointments', [
            'appointments' => $appointments
        ]);
    }

    /**
     * Show customer's appointment history with filters and statistics.
     */
    public function customerHistory(Request $request)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $userId = Auth::id();
        
        // Start building the query
        $query = Appointment::where('user_id', $userId)
            ->with([
                'vendorStore:id,business_name,address,contact_phone,contact_email',
                'vendorProductService:id,name,price_min,price_max',
                'rider:id,name,email,phone,rider_id,vehicle_type,license_number,status,rating'
            ]);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('service_name', 'like', "%{$search}%")
                  ->orWhereHas('vendorStore', function ($sq) use ($search) {
                      $sq->where('business_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('appointment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('appointment_date', '<=', $request->date_to);
        }

        // Get appointments with pagination
        $appointments = $query->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->paginate(10)
            ->appends($request->query());

        // Calculate statistics
        $allAppointments = Appointment::where('user_id', $userId)->get();
        
        // Calculate favorite service
        $favoriteService = $allAppointments->groupBy('service_name')
            ->map(function ($group) {
                return $group->count();
            })
            ->sortDesc()
            ->keys()
            ->first();
        
        $stats = [
            'total_appointments' => $allAppointments->count(),
            'completed_appointments' => $allAppointments->where('status', 'completed')->count(),
            'cancelled_appointments' => $allAppointments->where('status', 'cancelled')->count(),
            'pending_appointments' => $allAppointments->where('status', 'pending')->count(),
            'total_spent' => $allAppointments->where('status', 'completed')->sum('total_amount') ?: 0,
            'average_rating' => $allAppointments->where('customer_rating', '>', 0)->avg('customer_rating'),
            'favorite_service' => $favoriteService,
            'first_appointment' => $allAppointments->min('created_at')
        ];

        return Inertia::render('history', [
            'appointments' => $appointments,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to'])
        ]);
    }
}