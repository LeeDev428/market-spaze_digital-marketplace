<?php

namespace App\Http\Controllers\Vendor;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\VendorStore;
use App\Models\VendorProductService;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VendorDashboardController extends Controller
{
    public function index()
    {
        $vendorId = auth()->id();
        
        // Get vendor stores
        $stores = VendorStore::where('user_id', $vendorId)
            ->withCount('productsServices')
            ->get();
            
        // Get total services across all stores
        $totalServices = VendorProductService::whereIn('vendor_store_id', $stores->pluck('id'))->count();
        
        // Get appointments/orders data
        $appointmentsQuery = Appointment::whereIn('service_id', 
            VendorProductService::whereIn('vendor_store_id', $stores->pluck('id'))->pluck('id')
        );
        
        // Current month stats
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        // Orders this month
        $ordersThisMonth = (clone $appointmentsQuery)->where('appointments.created_at', '>=', $currentMonth)->count();
        $ordersLastMonth = (clone $appointmentsQuery)
            ->whereBetween('appointments.created_at', [$lastMonth, $currentMonth])
            ->count();
        
        // Orders today
        $ordersToday = (clone $appointmentsQuery)->whereDate('appointments.created_at', Carbon::today())->count();
        $ordersYesterday = (clone $appointmentsQuery)->whereDate('appointments.created_at', Carbon::yesterday())->count();
        
        // Revenue calculations (using price_min as base for now)
        $serviceIds = VendorProductService::whereIn('vendor_store_id', $stores->pluck('id'))->pluck('id');
        
        $revenueThisMonth = Appointment::whereIn('service_id', $serviceIds)
            ->where('appointments.created_at', '>=', $currentMonth)
            ->where('appointments.status', 'completed')
            ->join('vendor_product_services', 'appointments.service_id', '=', 'vendor_product_services.id')
            ->sum('vendor_product_services.price_min');
            
        $revenueLastMonth = Appointment::whereIn('service_id', $serviceIds)
            ->whereBetween('appointments.created_at', [$lastMonth, $currentMonth])
            ->where('appointments.status', 'completed')
            ->join('vendor_product_services', 'appointments.service_id', '=', 'vendor_product_services.id')
            ->sum('vendor_product_services.price_min');
        
        // Calculate average rating across all services
        $averageRating = VendorProductService::whereIn('vendor_store_id', $stores->pluck('id'))
            ->where('rating', '>', 0)
            ->avg('rating') ?: 0;
            
        // Get service areas count
        $serviceAreas = $stores->pluck('serviceable_areas')->flatten()->unique()->count();
        
        // Recent appointments
        $recentAppointments = Appointment::whereIn('service_id', 
                VendorProductService::whereIn('vendor_store_id', $stores->pluck('id'))->pluck('id')
            )
            ->with(['customer', 'vendorProductService.vendorStore'])
            ->orderBy('appointments.created_at', 'desc')
            ->limit(5)
            ->get();
        
        // Setup progress calculation
        $setupProgress = $this->calculateSetupProgress($stores);
        
        // Popular services
        $popularServices = VendorProductService::whereIn('vendor_store_id', $stores->pluck('id'))
            ->withCount('appointments')
            ->orderBy('appointments_count', 'desc')
            ->limit(5)
            ->get();
        
        return Inertia::render('vendor/Dashboard', [
            'stats' => [
                'revenue' => [
                    'current' => $revenueThisMonth,
                    'previous' => $revenueLastMonth,
                    'change' => $revenueLastMonth > 0 ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1) : 0
                ],
                'orders' => [
                    'today' => $ordersToday,
                    'yesterday' => $ordersYesterday,
                    'thisMonth' => $ordersThisMonth,
                    'lastMonth' => $ordersLastMonth,
                    'change' => $ordersYesterday > 0 ? ($ordersToday - $ordersYesterday) : $ordersToday
                ],
                'rating' => [
                    'current' => round($averageRating, 1),
                    'change' => 0 // Can be calculated if we track historical ratings
                ],
                'serviceAreas' => $serviceAreas
            ],
            'stores' => $stores,
            'totalServices' => $totalServices,
            'recentAppointments' => $recentAppointments,
            'setupProgress' => $setupProgress,
            'popularServices' => $popularServices
        ]);
    }
    
    private function calculateSetupProgress($stores)
    {
        $totalStores = $stores->count();
        if ($totalStores === 0) {
            return [
                'businessProfile' => false,
                'serviceConfiguration' => false,
                'commissionAgreement' => false,
                'overallProgress' => 0
            ];
        }
        
        // Business Profile: At least one store with complete basic info
        $businessProfile = $stores->where('setup_completed', true)->count() > 0;
        
        // Service Configuration: At least one store with services
        $serviceConfiguration = $stores->where('products_services_count', '>', 0)->count() > 0;
        
        // Commission Agreement: All stores are active (assuming this means agreement signed)
        $commissionAgreement = $stores->where('is_active', true)->count() === $totalStores && $totalStores > 0;
        
        $completedSteps = collect([$businessProfile, $serviceConfiguration, $commissionAgreement])
            ->filter()->count();
            
        return [
            'businessProfile' => $businessProfile,
            'serviceConfiguration' => $serviceConfiguration,
            'commissionAgreement' => $commissionAgreement,
            'overallProgress' => round(($completedSteps / 3) * 100)
        ];
    }
}