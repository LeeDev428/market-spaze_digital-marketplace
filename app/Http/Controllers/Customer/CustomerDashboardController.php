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

    public function profile()
    {
        $user = Auth::user();
        
        return Inertia::render('Customer/Profile', [
            'user' => $user
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . Auth::id(),
        ]);

        $user = Auth::user();
        $user->update($request->only(['name', 'email']));

        return redirect()->route('customer.profile')->with('success', 'Profile updated successfully');
    }

    public function settings()
    {
        return Inertia::render('Customer/Settings');
    }

    public function updateSettings(Request $request)
    {
        // Handle settings update logic
        return redirect()->route('customer.settings')->with('success', 'Settings updated successfully');
    }

    public function orders()
    {
        $user = Auth::user();
        
        $orders = Appointment::where('user_id', $user->id)
            ->with(['vendorStore', 'service'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Customer/Orders', [
            'orders' => $orders
        ]);
    }

    public function showOrder($id)
    {
        $user = Auth::user();
        
        $order = Appointment::where('user_id', $user->id)
            ->where('id', $id)
            ->with(['vendorStore', 'service'])
            ->firstOrFail();

        return Inertia::render('Customer/OrderDetails', [
            'order' => $order
        ]);
    }

    public function cancelOrder($id)
    {
        $user = Auth::user();
        
        $order = Appointment::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $order->update(['status' => 'cancelled']);

        return redirect()->route('customer.orders')->with('success', 'Order cancelled successfully');
    }

    public function favorites()
    {
        $user = Auth::user();
        
        // For now, return mock data since we don't have a favorites table yet
        $favorites = collect([]);

        return Inertia::render('Customer/Favorites', [
            'favorites' => $favorites
        ]);
    }

    public function addFavorite($vendorId)
    {
        // Logic to add vendor to favorites
        // This would require a user_favorites table
        
        return redirect()->back()->with('success', 'Added to favorites');
    }

    public function removeFavorite($vendorId)
    {
        // Logic to remove vendor from favorites
        
        return redirect()->back()->with('success', 'Removed from favorites');
    }

    public function reviews()
    {
        $user = Auth::user();
        
        // Mock reviews data for now
        $reviews = collect([]);

        return Inertia::render('Customer/Reviews', [
            'reviews' => $reviews
        ]);
    }

    public function storeReview(Request $request)
    {
        $request->validate([
            'rating' => 'required|integer|between:1,5',
            'comment' => 'required|string|max:1000',
            'vendor_id' => 'required|exists:vendor_stores,id'
        ]);

        // Logic to store review
        
        return redirect()->route('customer.reviews')->with('success', 'Review added successfully');
    }

    public function updateReview(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|between:1,5',
            'comment' => 'required|string|max:1000'
        ]);

        // Logic to update review
        
        return redirect()->route('customer.reviews')->with('success', 'Review updated successfully');
    }

    public function markNotificationAsRead($id)
    {
        // Logic to mark notification as read
        
        return response()->json(['success' => true]);
    }

    public function support()
    {
        return Inertia::render('Customer/Support');
    }

    public function createTicket(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:low,medium,high'
        ]);

        // Logic to create support ticket
        
        return redirect()->route('customer.support')->with('success', 'Support ticket created successfully');
    }
}