<?php

namespace App\Http\Controllers\Rider;

use App\Http\Controllers\Controller;
use App\Models\Rider;
use App\Models\RiderNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class RiderNotificationController extends Controller
{
    /**
     * Display notifications
     */
    public function index()
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return redirect()->route('login')->with('error', 'Please log in as a rider.');
        }
        
        $notifications = RiderNotification::where('rider_id', $rider->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return Inertia::render('rider/notifications/Index', [
            'notifications' => $notifications,
            'rider' => $rider,
        ]);
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead(RiderNotification $notification)
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        if ($notification->rider_id !== $rider->id) {
            abort(403, 'Unauthorized');
        }
        
        $notification->update(['is_read' => true, 'read_at' => now()]);
        
        return response()->json(['message' => 'Notification marked as read']);
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        RiderNotification::where('rider_id', $rider->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
        
        return response()->json(['message' => 'All notifications marked as read']);
    }
}