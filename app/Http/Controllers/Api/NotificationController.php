<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\VendorStore;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Get appointment notifications for user
     */
    public function getAppointmentNotifications(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notifications = [];
        $unreadCount = 0;

        if ($user->user_type === 'vendor') {
            // Get vendor store
            $vendorStore = VendorStore::where('user_id', $user->id)->first();
            if (!$vendorStore) {
                return response()->json(['notifications' => [], 'unreadCount' => 0]);
            }

            // Get recent appointment status changes (last 7 days)
            $appointments = Appointment::where('vendor_store_id', $vendorStore->id)
                ->with(['vendorStore'])
                ->where('updated_at', '>=', Carbon::now()->subDays(7))
                ->orderBy('updated_at', 'desc')
                ->limit(20)
                ->get();

            foreach ($appointments as $appointment) {
                $message = $this->getNotificationMessage($appointment, 'vendor');
                $notifications[] = [
                    'id' => $appointment->id,
                    'type' => 'appointment',
                    'status' => $appointment->status,
                    'message' => $message,
                    'appointment_number' => $appointment->appointment_number,
                    'customer_name' => $appointment->customer_name,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'timestamp' => $appointment->updated_at,
                    'is_read' => false // You can implement read status later
                ];
            }

            // Count by status for badge
            $statusCounts = Appointment::where('vendor_store_id', $vendorStore->id)
                ->selectRaw('status, count(*) as count')
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->where('appointment_date', '>=', Carbon::today())
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            $unreadCount = array_sum($statusCounts);

        } else {
            // Customer notifications
            $appointments = Appointment::where('user_id', $user->id)
                ->with(['vendorStore'])
                ->where('updated_at', '>=', Carbon::now()->subDays(7))
                ->orderBy('updated_at', 'desc')
                ->limit(20)
                ->get();

            foreach ($appointments as $appointment) {
                $message = $this->getNotificationMessage($appointment, 'customer');
                $notifications[] = [
                    'id' => $appointment->id,
                    'type' => 'appointment',
                    'status' => $appointment->status,
                    'message' => $message,
                    'appointment_number' => $appointment->appointment_number,
                    'vendor_name' => $appointment->vendorStore->business_name ?? 'Unknown Vendor',
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'timestamp' => $appointment->updated_at,
                    'is_read' => false
                ];
            }

            // Count pending/confirmed appointments for customer
            $unreadCount = Appointment::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->where('appointment_date', '>=', Carbon::today())
                ->count();
        }

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    /**
     * Get notification message based on appointment status and user type
     */
    private function getNotificationMessage($appointment, $userType)
    {
        $statusMessages = [
            'vendor' => [
                'pending' => "New appointment request from {$appointment->customer_name}",
                'confirmed' => "Appointment confirmed with {$appointment->customer_name}",
                'in_progress' => "Appointment with {$appointment->customer_name} is in progress",
                'completed' => "Appointment with {$appointment->customer_name} completed",
                'cancelled' => "Appointment with {$appointment->customer_name} was cancelled",
                'no_show' => "{$appointment->customer_name} did not show up for appointment",
                'rescheduled' => "Appointment with {$appointment->customer_name} was rescheduled"
            ],
            'customer' => [
                'pending' => "Your appointment request is pending approval",
                'confirmed' => "Your appointment has been confirmed",
                'in_progress' => "Your appointment is currently in progress",
                'completed' => "Your appointment has been completed",
                'cancelled' => "Your appointment has been cancelled",
                'no_show' => "You were marked as no-show for your appointment",
                'rescheduled' => "Your appointment has been rescheduled"
            ]
        ];

        return $statusMessages[$userType][$appointment->status] ?? "Appointment status updated";
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request)
    {
        $notificationId = $request->input('notification_id');
        // Implement marking notification as read
        // You might want to create a separate notifications table for this
        
        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        // Implement marking all notifications as read
        return response()->json(['success' => true]);
    }
}