<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Appointment;

// Test customer email from the screenshot
$customerEmail = 'customer1@gmail.com';

echo "Testing appointment history for: {$customerEmail}\n";
echo "===========================================\n";

// Check all appointments for this customer
$appointments = Appointment::where('customer_email', $customerEmail)->get();

echo "Total appointments found: " . $appointments->count() . "\n\n";

if ($appointments->count() > 0) {
    foreach ($appointments as $appointment) {
        echo "Appointment ID: {$appointment->id}\n";
        echo "Customer Email: {$appointment->customer_email}\n";
        echo "Service Name: {$appointment->service_name}\n";
        echo "Status: {$appointment->status}\n";
        echo "Date: {$appointment->appointment_date}\n";
        echo "Time: {$appointment->appointment_time}\n";
        echo "Created: {$appointment->created_at}\n";
        echo "---\n";
    }
} else {
    echo "No appointments found for this customer email.\n";
    
    // Check what customer emails exist in the database
    echo "\nExisting customer emails in database:\n";
    $existingEmails = Appointment::select('customer_email')
        ->distinct()
        ->pluck('customer_email')
        ->toArray();
    
    foreach ($existingEmails as $email) {
        echo "- {$email}\n";
    }
}

// Test the API endpoint logic
echo "\n=== Testing API Controller Logic ===\n";

try {
    $appointments = Appointment::with(['vendorProductService', 'vendorStore'])
        ->where('customer_email', $customerEmail)
        ->orderBy('appointment_date', 'desc')
        ->orderBy('appointment_time', 'desc')
        ->limit(20)
        ->get()
        ->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'appointment_number' => $appointment->appointment_number,
                'service_name' => $appointment->vendorProductService->service_name ?? $appointment->service_name ?? 'Unknown Service',
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

    echo "API endpoint would return " . $appointments->count() . " appointments\n";
    
    if ($appointments->count() > 0) {
        echo "Sample API response:\n";
        echo json_encode($appointments->first(), JSON_PRETTY_PRINT) . "\n";
    }

} catch (Exception $e) {
    echo "Error in API logic: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
