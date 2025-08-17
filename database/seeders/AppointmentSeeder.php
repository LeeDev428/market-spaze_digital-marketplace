<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Appointment;
use App\Models\User;
use App\Models\VendorStore;
use Carbon\Carbon;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get customers and vendors
        $customers = User::where('role', 'customer')->get();
        $vendorStores = VendorStore::with('user')->get();

        if ($customers->isEmpty() || $vendorStores->isEmpty()) {
            $this->command->info('No customers or vendor stores found. Please run UserRolesSeeder and VendorStoresSeeder first.');
            return;
        }

        $services = [
            'Laundry Service',
            'Dry Cleaning',
            'Ironing Service',
            'Pickup & Delivery',
            'Express Cleaning',
            'Stain Removal',
            'Alterations',
            'Shoe Cleaning'
        ];

        $statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

        // Create 20 appointments
        for ($i = 0; $i < 20; $i++) {
            $customer = $customers->random();
            $vendorStore = $vendorStores->random();
            
            // Random date within last 30 days or next 30 days
            $appointmentDate = Carbon::now()->addDays(rand(-30, 30));
            $appointmentTime = Carbon::createFromTime(rand(8, 18), [0, 15, 30, 45][rand(0, 3)], 0);

            Appointment::create([
                'appointment_number' => 'APT-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'user_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'customer_phone' => $customer->phone ?? '09123456789',
                'vendor_store_id' => $vendorStore->id,
                'appointment_date' => $appointmentDate->format('Y-m-d'),
                'appointment_time' => $appointmentTime->format('H:i:s'),
                'status' => $statuses[array_rand($statuses)],
                'customer_notes' => 'Sample appointment notes for testing - ' . $services[array_rand($services)],
                'total_amount' => rand(50, 500) / 10, // Random amount between 5.0 and 50.0
                'created_at' => Carbon::now()->subDays(rand(0, 10)),
                'updated_at' => Carbon::now()->subDays(rand(0, 5)),
            ]);
        }

        $this->command->info('Created 20 sample appointments successfully.');
    }
}
