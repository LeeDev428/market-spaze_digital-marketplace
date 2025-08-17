<?php

namespace App\Http\Controllers\Rider;

use App\Http\Controllers\Controller;
use App\Models\Rider;
use App\Models\RiderEarning;
use App\Models\Delivery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RiderEarningsController extends Controller
{
    /**
     * Display earnings overview
     */
    public function index()
    {
        // Get authenticated rider directly
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return redirect()->route('login')->with('error', 'Please log in as a rider.');
        }
        
        // Earnings stats
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();
        
        $earnings = [
            'today' => RiderEarning::where('rider_id', $rider->id)
                ->whereDate('created_at', $today)
                ->sum('amount'),
            'week' => RiderEarning::where('rider_id', $rider->id)
                ->whereBetween('created_at', [$thisWeek, Carbon::now()])
                ->sum('amount'),
            'month' => RiderEarning::where('rider_id', $rider->id)
                ->whereBetween('created_at', [$thisMonth, Carbon::now()])
                ->sum('amount'),
            'total' => RiderEarning::where('rider_id', $rider->id)->sum('amount'),
        ];
        
        // Recent earnings
        $recentEarnings = RiderEarning::where('rider_id', $rider->id)
            ->with(['delivery.order'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        // Monthly earnings chart (last 12 months)
        $monthlyEarnings = RiderEarning::where('rider_id', $rider->id)
            ->whereBetween('created_at', [Carbon::now()->subMonths(11)->startOfMonth(), Carbon::now()->endOfMonth()])
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
        
        return Inertia::render('rider/earnings/Index', [
            'earnings' => $earnings,
            'recentEarnings' => $recentEarnings,
            'monthlyEarnings' => $monthlyEarnings,
            'rider' => $rider,
        ]);
    }
    
    /**
     * Get weekly earnings data
     */
    public function weekly()
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $weeklyEarnings = RiderEarning::where('rider_id', $rider->id)
            ->whereBetween('created_at', [Carbon::now()->subDays(6)->startOfDay(), Carbon::now()->endOfDay()])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as deliveries')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        return response()->json($weeklyEarnings);
    }
    
    /**
     * Get monthly earnings data
     */
    public function monthly()
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $monthlyEarnings = RiderEarning::where('rider_id', $rider->id)
            ->whereBetween('created_at', [Carbon::now()->subMonths(11)->startOfMonth(), Carbon::now()->endOfMonth()])
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as deliveries')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
        
        return response()->json($monthlyEarnings);
    }
    
    /**
     * Display analytics
     */
    public function analytics()
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return redirect()->route('login')->with('error', 'Please log in as a rider.');
        }
        
        // Performance analytics
        $analytics = [
            'total_deliveries' => Delivery::where('rider_id', $rider->id)->where('status', 'completed')->count(),
            'total_earnings' => RiderEarning::where('rider_id', $rider->id)->sum('amount'),
            'average_earnings_per_delivery' => 0,
            'best_earning_day' => null,
            'most_active_hour' => null,
            'completion_rate' => 0,
            'average_delivery_time' => 0,
        ];
        
        if ($analytics['total_deliveries'] > 0) {
            $analytics['average_earnings_per_delivery'] = $analytics['total_earnings'] / $analytics['total_deliveries'];
        }
        
        // Best earning day
        $bestDay = RiderEarning::where('rider_id', $rider->id)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount) as total'))
            ->groupBy('date')
            ->orderBy('total', 'desc')
            ->first();
        
        if ($bestDay) {
            $analytics['best_earning_day'] = [
                'date' => $bestDay->date,
                'amount' => $bestDay->total
            ];
        }
        
        // Most active hour
        $activeHour = Delivery::where('rider_id', $rider->id)
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('COUNT(*) as count'))
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->first();
        
        if ($activeHour) {
            $analytics['most_active_hour'] = $activeHour->hour . ':00';
        }
        
        return Inertia::render('rider/analytics/Index', [
            'analytics' => $analytics,
            'rider' => $rider,
        ]);
    }
}