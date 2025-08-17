<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    /**
     * Get appointment history for a user by email
     */
    public function getUserHistory(string $email): JsonResponse
    {
        try {
            // Decode the email parameter
            $email = urldecode($email);
            
            Log::info('Fetching appointment history for email: ' . $email);
            
            $appointments = Appointment::with(['vendorProductService', 'vendorStore'])
                ->where('customer_email', $email)
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->limit(20) // Limit to last 20 appointments
                ->get();
                
            Log::info('Found ' . $appointments->count() . ' appointments for email: ' . $email);
            
            $mappedAppointments = $appointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_number' => $appointment->appointment_number,
                    'service_name' => $appointment->vendorProductService->name ?? $appointment->service_name ?? 'General Service',
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'status' => $appointment->status,
                    'total_amount' => $appointment->total_amount,
                    'customer_rating' => $appointment->customer_rating,
                    'customer_feedback' => $appointment->customer_feedback,
                    'created_at' => $appointment->created_at,
                    'vendor_store_name' => $appointment->vendorStore->business_name ?? 'Unknown Store',
                ];
            });

            return response()->json([
                'success' => true,
                'appointments' => $mappedAppointments,
                'total' => $mappedAppointments->count(),
                'customer_email' => $email
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching appointment history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointment history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed appointment statistics for a user
     */
    public function getUserStats(string $email): JsonResponse
    {
        try {
            $appointments = Appointment::where('customer_email', $email)->get();

            $stats = [
                'total_appointments' => $appointments->count(),
                'completed_appointments' => $appointments->where('status', 'completed')->count(),
                'cancelled_appointments' => $appointments->where('status', 'cancelled')->count(),
                'pending_appointments' => $appointments->where('status', 'pending')->count(),
                'total_spent' => $appointments->where('status', 'completed')->sum('total_amount'),
                'average_rating' => $appointments->whereNotNull('customer_rating')->avg('customer_rating'),
                'first_appointment' => $appointments->min('appointment_date'),
                'last_appointment' => $appointments->max('appointment_date'),
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'customer_email' => $email
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
