<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Appointment;

echo "Checking customer emails in appointments database:\n";
echo "==================================================\n";

// Get distinct customer emails
$emails = Appointment::select('customer_email')->distinct()->get();

echo "Found " . $emails->count() . " unique customer emails:\n\n";

foreach ($emails as $row) {
    $email = $row->customer_email;
    $count = Appointment::where('customer_email', $email)->count();
    echo "- {$email} ({$count} appointments)\n";
}

echo "\n";

// Show sample appointments for different customers
echo "Sample appointments by customer:\n";
echo "===============================\n";

foreach ($emails->take(3) as $row) {
    $email = $row->customer_email;
    echo "\nCustomer: {$email}\n";
    $appointments = Appointment::where('customer_email', $email)
        ->select('id', 'customer_name', 'customer_email', 'status', 'appointment_date', 'appointment_time')
        ->orderBy('appointment_date', 'desc')
        ->limit(3)
        ->get();
    
    foreach ($appointments as $apt) {
        echo "  - ID {$apt->id}: {$apt->customer_name} | {$apt->status} | {$apt->appointment_date} {$apt->appointment_time}\n";
    }
}
