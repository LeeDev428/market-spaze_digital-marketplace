<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Rider;
use Illuminate\Support\Facades\Hash;

class UserRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'is_activated' => true,
            'email_verified_at' => now(),
        ]);

        // Create Sample Customers
        User::create([
            'name' => 'John Doe',
            'email' => 'customer1@gmail.com',
            'password' => Hash::make('users123'),
            'role' => 'customer',
            'is_activated' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'customer2@gmail.com',
            'password' => Hash::make('users123'),
            'role' => 'customer',
            'is_activated' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Bob Johnson',
            'email' => 'customer3@gmail.com',
            'password' => Hash::make('users123'),
            'role' => 'customer',
            'is_activated' => false, // Inactive customer for testing
            'email_verified_at' => now(),
        ]);

        // Create Sample Vendors
        User::create([
            'name' => 'Maria Garcia',
            'email' => 'vendor1@gmail.com',
            'password' => Hash::make('vendor123'),
            'role' => 'vendor',
            'is_activated' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'David Chen',
            'email' => 'vendor2@gmail.com',
            'password' => Hash::make('vendor123'),
            'role' => 'vendor',
            'is_activated' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Sarah Wilson',
            'email' => 'vendor3@gmail.com',
            'password' => Hash::make('vendor123'),
            'role' => 'vendor',
            'is_activated' => false, // Inactive vendor for testing
            'email_verified_at' => now(),
        ]);

        // Create Sample Riders (using the Rider model since they're independent)
        Rider::create([
            'name' => 'Mike Rodriguez',
            'email' => 'rider1@gmail.com',
            'password' => Hash::make('rider123'),
            'rider_id' => 'RDR001',
            'phone' => '+1234567890',
            'vehicle_type' => 'Motorcycle',
            'license_number' => 'LIC123456',
            'status' => 'available',
            'rating' => 4.8,
            'total_deliveries' => 150,
            'is_verified' => true,
            'is_activated' => true,
            'is_online' => true,
            'email_verified_at' => now(),
        ]);

        Rider::create([
            'name' => 'Carlos Martinez',
            'email' => 'rider2@gmail.com',
            'password' => Hash::make('rider123'),
            'rider_id' => 'RDR002',
            'phone' => '+1234567891',
            'vehicle_type' => 'Bicycle',
            'license_number' => 'LIC123457',
            'status' => 'offline',
            'rating' => 4.5,
            'total_deliveries' => 89,
            'is_verified' => true,
            'is_activated' => true,
            'is_online' => false,
            'email_verified_at' => now(),
        ]);

        Rider::create([
            'name' => 'Alex Thompson',
            'email' => 'rider3@gmail.com',
            'password' => Hash::make('rider123'),
            'rider_id' => 'RDR003',
            'phone' => '+1234567892',
            'vehicle_type' => 'Car',
            'license_number' => 'LIC123458',
            'status' => 'busy',
            'rating' => 4.9,
            'total_deliveries' => 200,
            'is_verified' => false, // Unverified rider
            'is_activated' => true,
            'is_online' => true,
            'email_verified_at' => now(),
        ]);

        Rider::create([
            'name' => 'Lisa Brown',
            'email' => 'rider4@gmail.com',
            'password' => Hash::make('rider123'),
            'rider_id' => 'RDR004',
            'phone' => '+1234567893',
            'vehicle_type' => 'Motorcycle',
            'license_number' => 'LIC123459',
            'status' => 'offline',
            'rating' => 4.2,
            'total_deliveries' => 45,
            'is_verified' => true,
            'is_activated' => false, // Inactive rider for testing
            'is_online' => false,
            'email_verified_at' => now(),
        ]);

        $this->command->info('User roles seeder completed successfully!');
        $this->command->info('Created: 1 Admin, 3 Customers, 3 Vendors, 4 Riders');
    }
}
