<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Appointment;
use App\Models\Rider;

echo "Checking test appointment APT-000017...\n";
$apt = Appointment::where('appointment_number', 'APT-000017')->first();

if($apt) {
    echo "Appointment found: ID={$apt->id}, Status={$apt->status}, Rider ID=" . ($apt->rider_id ?? 'null') . "\n";
    
    if($apt->rider) {
        echo "Rider assigned: {$apt->rider->name} ({$apt->rider->email})\n";
    } else {
        echo "No rider assigned yet. Assigning a rider...\n";
        
        // Get the first available rider
        $rider = Rider::first();
        
        if($rider) {
            $apt->rider_id = $rider->id;
            $apt->save();
            echo "Assigned rider: {$rider->name} (ID: {$rider->id}) to appointment {$apt->appointment_number}\n";
        } else {
            echo "No riders found in the database.\n";
        }
    }
} else {
    echo "Appointment not found.\n";
}

echo "Done!\n";
