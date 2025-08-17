<?php
// Test script to simulate the form submission

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "🧪 TESTING RIDER ASSIGNMENT FUNCTIONALITY\n";
echo "==========================================\n\n";

// Get the appointment
$appointment = App\Models\Appointment::find(1);
echo "📋 Current appointment status:\n";
echo "  ID: {$appointment->id}\n";
echo "  Status: {$appointment->status}\n"; 
echo "  Rider ID: " . ($appointment->rider_id ?? 'NULL') . "\n";
echo "  Customer: {$appointment->customer_name}\n\n";

// Get the rider
$rider = App\Models\Rider::find(1);
echo "👤 Rider info:\n";
echo "  ID: {$rider->id}\n";
echo "  Rider ID: {$rider->rider_id}\n";
echo "  User ID: {$rider->user_id}\n";
echo "  Status: {$rider->status}\n\n";

// Simulate the assignment (what the controller should do)
echo "🔄 Simulating assignment...\n";

try {
    $appointment->update([
        'status' => 'in_progress',
        'rider_id' => $rider->id,
        'started_at' => now(),
    ]);
    
    $appointment->refresh();
    
    echo "✅ Assignment successful!\n";
    echo "  New Status: {$appointment->status}\n";
    echo "  New Rider ID: {$appointment->rider_id}\n";
    echo "  Started At: {$appointment->started_at}\n";
    
    // Reset for testing
    echo "\n🔄 Resetting for actual testing...\n";
    $appointment->update([
        'status' => 'confirmed',
        'rider_id' => null,
        'started_at' => null,
    ]);
    
    $appointment->refresh();
    echo "✅ Reset complete - ready for form testing!\n";
    echo "  Status: {$appointment->status}\n";
    echo "  Rider ID: " . ($appointment->rider_id ?? 'NULL') . "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
