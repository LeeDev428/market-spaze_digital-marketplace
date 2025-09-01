<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;
use App\Models\User;
use App\Models\VendorStore;
use App\Models\Rider;
use App\Models\VendorProductService;

class HistorySeeder extends Seeder
{
    public function run()
    {
        // Get or create a test user
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test Customer',
                'password' => bcrypt('password'),
                'role' => 'customer',
                'email_verified_at' => now(),
            ]
        );

        // Get or create a test vendor
        $vendor = User::firstOrCreate(
            ['email' => 'vendor@example.com'],
            [
                'name' => 'Test Vendor',
                'password' => bcrypt('password'),
                'role' => 'vendor',
                'email_verified_at' => now(),
            ]
        );

        // Create vendor store
        $vendorStore = VendorStore::firstOrCreate(
            ['user_id' => $vendor->id],
            [
                'business_name' => 'Test Business',
                'description' => 'A test business for appointments',
                'business_type' => 'services',
                'address' => '123 Test Street, Test City',
                'contact_phone' => '123-456-7890',
                'contact_email' => 'vendor@example.com',
                'is_active' => true,
                'setup_completed' => true,
            ]
        );

        // Create a service
        $service = VendorProductService::firstOrCreate(
            [
                'vendor_store_id' => $vendorStore->id,
                'name' => 'Test Service'
            ],
            [
                'description' => 'A test service',
                'category' => 'General',
                'subcategory' => 'Basic',
                'price' => 100.00,
                'duration' => 60,
                'is_active' => true,
            ]
        );

        // Create some sample appointments
        $statuses = ['completed', 'cancelled', 'confirmed', 'pending'];
        
        for ($i = 1; $i <= 10; $i++) {
            Appointment::create([
                'appointment_number' => 'APP' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'user_id' => $user->id,
                'customer_name' => 'Test Customer ' . $i,
                'customer_email' => 'customer' . $i . '@example.com',
                'customer_phone' => '123-456-789' . $i,
                'customer_address' => $i . ' Customer Street',
                'customer_city' => 'Test City',
                'vendor_store_id' => $vendorStore->id,
                'service_id' => $service->id,
                'appointment_date' => now()->subDays(rand(1, 30))->format('Y-m-d'),
                'appointment_time' => sprintf('%02d:00:00', rand(9, 17)),
                'estimated_end_time' => sprintf('%02d:00:00', rand(10, 18)),
                'duration_minutes' => 60,
                'service_price' => 100.00,
                'additional_charges' => 0,
                'discount_amount' => 0,
                'total_amount' => 100.00,
                'currency' => 'USD',
                'status' => $statuses[array_rand($statuses)],
                'requirements' => 'Test requirements for appointment ' . $i,
                'customer_notes' => 'Customer notes for appointment ' . $i,
                'sms_notifications' => true,
                'email_notifications' => true,
                'created_at' => now()->subDays(rand(1, 30)),
                'confirmed_at' => in_array($statuses[array_rand($statuses)], ['confirmed', 'completed']) ? now()->subDays(rand(1, 29)) : null,
                'completed_at' => $statuses[array_rand($statuses)] === 'completed' ? now()->subDays(rand(1, 28)) : null,
            ]);
        }

        echo "Created 10 sample appointments for testing\n";
    }
}
