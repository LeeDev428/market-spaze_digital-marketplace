<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Appointment;

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Creating test appointment...\n";

// Create a test user if none exists
$user = User::first();
if (!$user) {
    $user = User::create([
        'name' => 'Test Customer',
        'email' => 'customer@test.com', 
        'password' => bcrypt('password')
    ]);
    echo "✅ Test customer created\n";
}

// Create test appointment
$appointment = Appointment::create([
    'user_id' => $user->id,
    'appointment_number' => 'APT-TEST-' . date('His'),
    'customer_name' => 'Test Customer',
    'customer_email' => 'customer@test.com',
    'customer_phone' => '1234567890',
    'customer_address' => 'Test Address', 
    'customer_city' => 'Test City',
    'appointment_date' => today(),
    'appointment_time' => '10:00',
    'duration_minutes' => 60,
    'service_price' => 100,
    'total_amount' => 100,
    'status' => 'confirmed'
]);

echo "✅ Test appointment created with ID: {$appointment->id}\n";
echo "📋 Appointment Number: {$appointment->appointment_number}\n";
echo "🎯 Status: {$appointment->status}\n";
echo "🔗 View appointment: http://localhost:8000/rider/deliveries/{$appointment->id}\n";
