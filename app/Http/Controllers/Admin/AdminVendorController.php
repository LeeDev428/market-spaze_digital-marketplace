<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorStore;
use App\Models\Appointment;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminVendorController extends Controller
{
    /**
     * Display a listing of vendor stores
     */
    public function index(Request $request)
    {
        $query = VendorStore::with(['user'])
            ->withCount(['appointments', 'orders']);

        // Apply search filter
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('business_name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('address', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function ($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%')
                               ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // Apply business type filter
        if ($request->filled('business_type')) {
            $query->where('business_type', $request->business_type);
        }

        // Apply status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $vendorStores = $query->orderBy('created_at', 'desc')
                             ->paginate(10)
                             ->withQueryString();

        return Inertia::render('admin/vendors/index-vendors', [
            'vendorStores' => $vendorStores,
            'filters' => $request->only(['search', 'business_type', 'status'])
        ]);
    }

    /**
     * Display the specified vendor store with detailed information
     */
    public function show(VendorStore $vendorStore)
    {
        $vendorStore->load([
            'user',
            'appointments' => function ($query) {
                $query->with(['user', 'vendorProductService'])
                      ->orderBy('created_at', 'desc')
                      ->limit(50);
            },
            'orders' => function ($query) {
                $query->with(['user', 'orderItems'])
                      ->orderBy('created_at', 'desc')
                      ->limit(20);
            },
            'productsServices' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }
        ]);

        // Get appointment statistics
        $appointmentStats = [
            'total' => $vendorStore->appointments()->count(),
            'pending' => $vendorStore->appointments()->where('status', 'pending')->count(),
            'confirmed' => $vendorStore->appointments()->where('status', 'confirmed')->count(),
            'completed' => $vendorStore->appointments()->where('status', 'completed')->count(),
            'cancelled' => $vendorStore->appointments()->where('status', 'cancelled')->count(),
        ];

        // Get order statistics
        $orderStats = [
            'total' => $vendorStore->orders()->count(),
            'pending' => $vendorStore->orders()->where('status', 'pending')->count(),
            'processing' => $vendorStore->orders()->where('status', 'processing')->count(),
            'delivered' => $vendorStore->orders()->where('status', 'delivered')->count(),
            'cancelled' => $vendorStore->orders()->where('status', 'cancelled')->count(),
        ];

        // Get recent activity (last 30 days)
        $recentAppointments = $vendorStore->appointments()
            ->with(['user', 'vendorProductService'])
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'appointments_page');

        // Calculate revenue (if applicable)
        $totalRevenue = $vendorStore->orders()
            ->where('status', 'delivered')
            ->sum('total_amount');

        $monthlyRevenue = $vendorStore->orders()
            ->where('status', 'delivered')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('total_amount');

        return Inertia::render('admin/vendors/index-vendors-details', [
            'vendorStore' => $vendorStore,
            'appointmentStats' => $appointmentStats,
            'orderStats' => $orderStats,
            'recentAppointments' => $recentAppointments,
            'totalRevenue' => $totalRevenue,
            'monthlyRevenue' => $monthlyRevenue,
        ]);
    }

    /**
     * Toggle vendor store active status
     */
    public function toggleStatus(Request $request, VendorStore $vendorStore)
    {
        $vendorStore->update([
            'is_active' => !$vendorStore->is_active
        ]);

        return back()->with('success', 'Vendor store status updated successfully.');
    }

    /**
     * Get appointment history for a vendor store
     */
    public function getAppointmentHistory(Request $request, VendorStore $vendorStore)
    {
        $appointments = $vendorStore->appointments()
            ->with(['user', 'vendorProductService'])
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->whereDate('appointment_date', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->whereDate('appointment_date', '<=', $request->date_to);
            })
            ->orderBy('appointment_date', 'desc')
            ->paginate(15);

        return response()->json($appointments);
    }

    /**
     * Get order history for a vendor store
     */
    public function getOrderHistory(Request $request, VendorStore $vendorStore)
    {
        $orders = $vendorStore->orders()
            ->with(['user', 'orderItems'])
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->whereDate('created_at', '<=', $request->date_to);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($orders);
    }
}
