<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Create test appointment with service
$vendorStore = \App\Models\VendorStore::first();
$service = \App\Models\VendorProductService::has('images')->first();

if($vendorStore && $service) {
    $appointment = \App\Models\Appointment::create([
        'appointment_number' => 'APT-' . now()->format('YmdHis'),
        'vendor_store_id' => $vendorStore->id,
        'service_id' => $service->id,
        'customer_name' => 'Test Customer',
        'customer_email' => 'test@example.com',
        'customer_phone' => '+1234567890',
        'customer_address' => '123 Test St',
        'customer_city' => 'Manila',
        'service_name' => $service->name,
        'service_price' => $service->price,
        'total_amount' => $service->price,
        'appointment_date' => now()->addDay(),
        'appointment_time' => '10:00:00',
        'duration_minutes' => $service->duration_minutes ?? 60,
        'status' => 'confirmed',
        'payment_status' => 'paid'
    ]);
    
    echo "Created appointment ID: {$appointment->id} linked to service: {$service->name}\n";
    echo "Service has " . $service->images->count() . " images\n";
    
    if($service->images->count() > 0) {
        echo "Primary image: " . $service->images->where('is_primary', true)->first()?->image_path ?? 'None set as primary' . "\n";
        echo "All images: " . $service->images->pluck('image_path')->join(', ') . "\n";
    }
} else {
    echo "No vendor store or service with images found\n";
}