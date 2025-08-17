<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Models\VendorProductService;
use App\Models\VendorStore;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CustomerDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get customer statistics
        $stats = [
            'totalAppointments' => Appointment::where('user_id', $user->id)->count(),
            'activeAppointments' => Appointment::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->count(),
            'completedAppointments' => Appointment::where('user_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'totalSpent' => Appointment::where('user_id', $user->id)
                ->where('status', 'completed')
                ->sum('total_amount'),
            'totalStores' => VendorStore::count(), // Total stores available
            'upcomingAppointments' => Appointment::where('user_id', $user->id)
                ->where('appointment_date', '>=', now())
                ->where('status', '!=', 'cancelled')
                ->count(),
        ];

        // Get recent appointments (acting as orders)
        $recentOrders = Appointment::where('user_id', $user->id)
            ->with(['vendorStore', 'service'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'store_name' => $appointment->vendorStore->store_name ?? 'Unknown Store',
                    'service_name' => $appointment->service->service_name ?? 'Unknown Service',
                    'amount' => $appointment->total_amount ?? 0,
                    'status' => $appointment->status,
                    'created_at' => $appointment->created_at->toDateString(),
                ];
            });

        // Get upcoming appointments
        $upcomingAppointments = Appointment::where('user_id', $user->id)
            ->where('appointment_date', '>=', now())
            ->where('status', '!=', 'cancelled')
            ->with(['vendorStore', 'service'])
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->take(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'store_name' => $appointment->vendorStore->store_name ?? 'Unknown Store',
                    'service_name' => $appointment->service->service_name ?? 'Unknown Service',
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'status' => $appointment->status,
                ];
            });

        // Get popular stores (stores with most appointments)
        $popularStores = VendorStore::withCount('appointments')
            ->orderBy('appointments_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($store) {
                return [
                    'id' => $store->id,
                    'name' => $store->store_name,
                    'category' => $store->category ?? 'General',
                    'rating' => $store->rating ?? 4.5,
                    'location' => $store->address ?? 'Location not set',
                    'logo' => $store->logo,
                    'total_appointments' => $store->appointments_count,
                ];
            });

        // Mock notifications for now
        $notifications = collect([
            [
                'id' => 1,
                'title' => 'Welcome to MarketSpaze!',
                'message' => 'Start exploring amazing services in your area.',
                'type' => 'info',
                'created_at' => now()->toDateString(),
                'read' => false,
            ],
            [
                'id' => 2,
                'title' => 'New Services Available',
                'message' => 'Check out the latest services added by our vendors.',
                'type' => 'info',
                'created_at' => now()->subDays(1)->toDateString(),
                'read' => true,
            ]
        ]);

        return Inertia::render('dashboard', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ?? null,
            ],
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'upcomingAppointments' => $upcomingAppointments,
            'popularStores' => $popularStores,
            'notifications' => $notifications,
        ]);
    }
}