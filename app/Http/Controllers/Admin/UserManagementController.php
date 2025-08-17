<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rider;
use App\Models\VendorStore;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class UserManagementController extends Controller
{
    /**
     * Display all users with different roles
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $role = $request->get('role', '');
        $status = $request->get('status', '');

        // Get Customers with pagination
        $customers = User::where('role', 'customer')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status) {
                return $query->where('is_activated', $status === 'active' ? 1 : 0);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'customers_page');

        // Get Vendors with pagination
        $vendors = User::where('role', 'vendor')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status) {
                return $query->where('is_activated', $status === 'active' ? 1 : 0);
            })
            ->with(['vendorStore'])
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'vendors_page');

        // Get Riders with pagination
        $riders = Rider::query()
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('rider_id', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status) {
                return $query->where('is_activated', $status === 'active' ? 1 : 0);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'riders_page');

        // Apply role filter to show only specific sections
        if ($role === 'customer') {
            $vendors = collect([]);
            $riders = collect([]);
        } elseif ($role === 'vendor') {
            $customers = collect([]);
            $riders = collect([]);
        } elseif ($role === 'rider') {
            $customers = collect([]);
            $vendors = collect([]);
        }

        // Calculate statistics
        $stats = [
            'total_users' => User::where('role', '!=', 'admin')->count(),
            'total_customers' => User::where('role', 'customer')->count(),
            'total_vendors' => User::where('role', 'vendor')->count(),
            'total_riders' => Rider::count(),
            'active_users' => User::where('role', '!=', 'admin')->where('is_activated', true)->count(),
            'inactive_users' => User::where('role', '!=', 'admin')->where('is_activated', false)->count(),
            'active_riders' => Rider::where('is_activated', true)->count(),
            'inactive_riders' => Rider::where('is_activated', false)->count(),
        ];

        return Inertia::render('admin/users/index-users-management', [
            'customers' => $customers,
            'vendors' => $vendors,
            'riders' => $riders,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ]
        ]);
    }

    /**
     * Toggle user activation status
     */
    public function toggleActivation(Request $request)
    {
        $request->validate([
            'user_type' => 'required|in:user,rider',
            'user_id' => 'required|integer',
            'is_activated' => 'required|boolean'
        ]);

        try {
            if ($request->user_type === 'rider') {
                $rider = Rider::findOrFail($request->user_id);
                $rider->update(['is_activated' => $request->is_activated]);
                
                $message = $request->is_activated 
                    ? "Rider {$rider->name} has been activated successfully." 
                    : "Rider {$rider->name} has been deactivated successfully.";
            } else {
                $user = User::where('role', '!=', 'admin')->findOrFail($request->user_id);
                $user->update(['is_activated' => $request->is_activated]);
                
                // If it's a vendor, also update their store status
                if ($user->role === 'vendor') {
                    VendorStore::where('user_id', $user->id)
                              ->update(['is_active' => $request->is_activated]);
                }
                
                $message = $request->is_activated 
                    ? "User {$user->name} has been activated successfully." 
                    : "User {$user->name} has been deactivated successfully.";
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update user status. Please try again.');
        }
    }

    /**
     * Get detailed information about a specific user
     */
    public function show($type, $id)
    {
        try {
            if ($type === 'rider') {
                $user = Rider::with(['riderEarnings', 'deliveries.order'])
                           ->findOrFail($id);
                           
                // Get additional stats for rider
                $additionalData = [
                    'total_earnings' => $user->riderEarnings->sum('amount') ?? 0,
                    'total_deliveries' => $user->total_deliveries ?? 0,
                    'current_status' => $user->status,
                    'rating' => $user->rating,
                    'is_verified' => $user->is_verified,
                    'recent_deliveries' => $user->deliveries()->with(['order'])->latest()->take(10)->get(),
                    'earnings_history' => $user->riderEarnings()->latest()->take(10)->get(),
                ];
            } else {
                $user = User::where('role', '!=', 'admin')->findOrFail($id);
                
                $additionalData = [];
                
                // If it's a customer, get their appointments and orders
                if ($user->role === 'customer') {
                    $additionalData = [
                        'appointment_history' => $user->appointments()->with(['vendorStore'])->latest()->take(10)->get(),
                        'order_history' => $user->orders()->with(['vendorStore', 'orderItems'])->latest()->take(10)->get(),
                        'total_appointments' => $user->appointments()->count(),
                        'total_orders' => $user->orders()->count(),
                        'total_spent' => $user->orders()->sum('total_amount') ?? 0,
                    ];
                }
                
                // If it's a vendor, get their store details and business stats
                if ($user->role === 'vendor') {
                    $vendorStore = VendorStore::where('user_id', $user->id)->first();
                    $additionalData = [
                        'vendor_store' => $vendorStore,
                        'total_revenue' => $user->vendorOrders()->sum('total_amount') ?? 0,
                        'total_orders' => $user->vendorOrders()->count(),
                        'recent_orders' => $user->vendorOrders()->with(['user', 'orderItems'])->latest()->take(10)->get(),
                        'appointments_received' => $vendorStore ? $vendorStore->appointments()->with(['user'])->latest()->take(10)->get() : [],
                    ];
                }
            }

            return Inertia::render('admin/users/user-detail', [
                'user' => $user,
                'userType' => $type,
                'additionalData' => $additionalData
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'User not found.');
        }
    }

    /**
     * Manage customers with detailed view
     */
    public function manageCustomers(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', '');

        $customers = User::where('role', 'customer')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status) {
                return $query->where('is_activated', $status === 'active' ? 1 : 0);
            })
            ->withCount(['appointments', 'orders'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/users/manage-customers', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ]
        ]);
    }

    /**
     * Manage riders with detailed view
     */
    public function manageRiders(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', '');

        $riders = Rider::query()
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('rider_id', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status) {
                return $query->where('is_activated', $status === 'active' ? 1 : 0);
            })
            ->withCount(['deliveries', 'riderEarnings'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/users/manage-riders', [
            'riders' => $riders,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ]
        ]);
    }

    /**
     * Manage vendors with detailed view
     */
    public function manageVendors(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', '');

        $vendors = User::where('role', 'vendor')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status) {
                return $query->where('is_activated', $status === 'active' ? 1 : 0);
            })
            ->with(['vendorStore'])
            ->withCount(['vendorOrders'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/users/manage-vendors', [
            'vendors' => $vendors,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ]
        ]);
    }
}
