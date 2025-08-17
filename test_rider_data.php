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
        echo "No rider assigned yet.\n";
        echo "Available riders:\n";
        $riders = Rider::take(3)->get();
        foreach($riders as $r) {
            echo "- {$r->name} (ID: {$r->id})\n";
        }
    }
} else {
    echo "Appointment not found.\n";
}
