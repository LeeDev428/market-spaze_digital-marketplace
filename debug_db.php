<?php
// Simple PHP script to check the appointments table

require_once 'vendor/autoload.php';

// Use Laravel's database connection
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get all appointments with their rider_id status
echo "📊 APPOINTMENTS TABLE ANALYSIS\n";
echo "==============================\n\n";

try {
    $appointments = DB::table('appointments')
        ->select('id', 'appointment_number', 'status', 'rider_id', 'customer_name')
        ->orderBy('id', 'desc')
        ->limit(10)
        ->get();

    echo "📋 Recent 10 appointments:\n";
    echo "ID | Number | Status | Rider ID | Customer\n";
    echo "---|--------|--------|----------|----------\n";
    
    foreach ($appointments as $appointment) {
        $riderId = $appointment->rider_id ?? 'NULL';
        echo "{$appointment->id} | {$appointment->appointment_number} | {$appointment->status} | {$riderId} | {$appointment->customer_name}\n";
    }
    
    echo "\n📈 Status Summary:\n";
    $statusCounts = DB::table('appointments')
        ->select('status', DB::raw('count(*) as count'))
        ->groupBy('status')
        ->get();
    
    foreach ($statusCounts as $status) {
        echo "  {$status->status}: {$status->count}\n";
    }
    
    echo "\n🎯 Rider Assignment Summary:\n";
    $assigned = DB::table('appointments')->whereNotNull('rider_id')->count();
    $unassigned = DB::table('appointments')->whereNull('rider_id')->count();
    echo "  Assigned: {$assigned}\n";
    echo "  Unassigned: {$unassigned}\n";
    
    echo "\n👤 Riders in database:\n";
    $riders = DB::table('riders')
        ->join('users', 'riders.user_id', '=', 'users.id')
        ->select('riders.id', 'riders.rider_id', 'users.name', 'users.role')
        ->get();
    
    foreach ($riders as $rider) {
        echo "  ID: {$rider->id}, Rider ID: {$rider->rider_id}, Name: {$rider->name}, Role: {$rider->role}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
