<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Appointment;
use App\Models\User;
use App\Models\VendorStore;
use App\Models\Rider;

Route::get('/test-history-data', function() {
    // Test appointment relationships
    $appointment = Appointment::with([
        'vendorStore.user',
        'service',
        'rider',
        'user'
    ])->first();
    
    if (!$appointment) {
        return response()->json(['error' => 'No appointments found']);
    }
    
    return response()->json([
        'appointment' => [
            'id' => $appointment->id,
            'appointment_number' => $appointment->appointment_number,
            'status' => $appointment->status,
            'customer_name' => $appointment->customer_name,
            'vendor_store' => $appointment->vendorStore ? [
                'business_name' => $appointment->vendorStore->business_name,
                'owner' => $appointment->vendorStore->user ? $appointment->vendorStore->user->name : null
            ] : null,
            'service' => $appointment->service ? [
                'name' => $appointment->service->name,
                'category' => $appointment->service->category
            ] : null,
            'rider' => $appointment->rider ? [
                'name' => $appointment->rider->name,
                'vehicle_type' => $appointment->rider->vehicle_type
            ] : null,
            'customer' => $appointment->user ? [
                'name' => $appointment->user->name,
                'email' => $appointment->user->email
            ] : null
        ],
        'total_appointments' => Appointment::count(),
        'with_riders' => Appointment::whereNotNull('rider_id')->count(),
        'with_vendors' => Appointment::whereNotNull('vendor_store_id')->count(),
    ]);
})->name('test.history.data');

Route::get('/test-redis-history', function() {
    try {
        $key = 'test:history:' . now()->timestamp;
        \Illuminate\Support\Facades\Redis::lpush($key, 1, 2, 3);
        \Illuminate\Support\Facades\Redis::expire($key, 60);
        
        $values = \Illuminate\Support\Facades\Redis::lrange($key, 0, -1);
        \Illuminate\Support\Facades\Redis::del($key);
        
        return response()->json([
            'redis_status' => 'working',
            'test_values' => $values,
            'redis_connection' => config('database.redis.default')
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'redis_status' => 'error',
            'error' => $e->getMessage()
        ]);
    }
})->name('test.redis.history');
