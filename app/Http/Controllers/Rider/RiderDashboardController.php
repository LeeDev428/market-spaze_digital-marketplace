<?php

namespace App\Http\Controllers\Rider;

use App\Http\Controllers\Controller;
use App\Models\Rider;
use App\Models\Appointment;
use App\Models\RiderEarning;
use App\Models\RiderNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RiderDashboardController extends Controller
{
    /**
     * Display rider dashboard
     */
    public function index()
    {
        // TEMPORARY: Get rider directly for debugging (bypass auth)
        $rider = \App\Models\Rider::first();
        
        if (!$rider) {
            return response()->json(['error' => 'No rider found in database']);
        }

        // Simple stats without complex queries
        $stats = [
            'earnings_today' => 0,
            'earnings_week' => 0,
            'earnings_month' => 0,
            'appointments_today' => 0,
            'appointments_week' => 0,
            'appointments_month' => 0,
            'active_appointments' => 0,
            'average_rating' => $rider->rating ?? 5.0,
            'completion_rate' => 100,
        ];
        
        // Empty arrays for now
        $activeDeliveries = collect([]);
        $recentDeliveries = collect([]);
        $notifications = collect([]);

        return Inertia::render('rider/dashboard', [
            'auth' => [
                'user' => [
                    'id' => $rider->id,
                    'name' => $rider->name,
                    'email' => $rider->email,
                ],
                'rider' => [
                    'id' => $rider->id,
                    'user_id' => null,
                    'rider_id' => $rider->rider_id,
                    'vehicle_type' => $rider->vehicle_type,
                    'license_plate' => $rider->license_number,
                    'phone_number' => $rider->phone,
                    'status' => $rider->status,
                    'rating' => $rider->rating,
                    'total_deliveries' => 0,
                    'earnings_today' => $stats['earnings_today'],
                    'earnings_total' => $stats['earnings_month'],
                    'is_online' => $rider->is_online ?? false,
                ],
            ],
            'rider' => $rider,
            'stats' => [
                'today_earnings' => $stats['earnings_today'],
                'total_earnings' => $stats['earnings_month'],
                'completed_deliveries' => $stats['appointments_month'],
                'active_deliveries' => $activeDeliveries->count(),
                'rating' => $rider->rating,
                'status' => $rider->status,
                'is_online' => $rider->is_online ?? false,
            ],
            'activeAppointments' => $activeDeliveries,
            'recentAppointments' => $recentDeliveries,
            'notifications' => $notifications,
            // Debug data
            'debug' => [
                'rider_id' => $rider->id,
                'rider_name' => $rider->name,
                'stats_raw' => $stats,
                'method' => 'direct_access',
            ]
        ]);
    }

    /**
     * Toggle rider online/offline status
     */
    public function toggleOnlineStatus(Request $request)
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return back()->with('error', 'Please log in as a rider.');
        }

        $newStatus = !$rider->is_online;
        $rider->update([
            'is_online' => $newStatus,
            'status' => $newStatus ? 'online' : 'offline'
        ]);

        return back()->with('success', $newStatus ? 'You are now online!' : 'You are now offline!');
    }

    /**
     * Update rider location
     */
    public function updateLocation(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return response()->json(['error' => 'Please log in as a rider.'], 401);
        }

        $rider->update([
            'current_latitude' => $request->latitude,
            'current_longitude' => $request->longitude,
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Navigation page
     */
    public function navigation()
    {
        return Inertia::render('rider/navigation/Index');
    }

    /**
     * Help page
     */
    public function help()
    {
        return Inertia::render('rider/help/Index');
    }

    /**
     * Calculate completion rate
     */
    private function calculateCompletionRate($riderId)
    {
        $totalAppointments = Appointment::where('rider_id', $riderId)->count();
        $completedAppointments = Appointment::where('rider_id', $riderId)
            ->where('status', 'completed')
            ->count();
        
        if ($totalAppointments === 0) {
            return 100;
        }
        
        return round(($completedAppointments / $totalAppointments) * 100, 2);
    }
}