<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\VendorStore;
use App\Models\User;

class VendorStoresSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get vendor users
        $vendors = User::where('role', 'vendor')->get();

        if ($vendors->count() > 0) {
            // Create store for first vendor
            VendorStore::create([
                'user_id' => $vendors[0]->id,
                'business_name' => 'Fresh Mart Grocery',
                'business_type' => 'products',
                'description' => 'Your neighborhood grocery store with fresh produce, organic foods, and daily essentials.',
                'address' => '123 Main Street, Downtown, Metro Manila, Philippines',
                'serviceable_areas' => ['Manila', 'Makati', 'Quezon City', 'Pasig'],
                'contact_phone' => '+63912345678',
                'contact_email' => 'info@freshmart.com',
                'service_description' => 'We deliver fresh groceries to your doorstep with same-day delivery options.',
                'is_active' => true,
                'setup_completed' => true,
            ]);

            // Create store for second vendor if exists
            if ($vendors->count() > 1) {
                VendorStore::create([
                    'user_id' => $vendors[1]->id,
                    'business_name' => 'Tech Hub Electronics',
                    'business_type' => 'products',
                    'description' => 'Latest gadgets, smartphones, laptops, and tech accessories at competitive prices.',
                    'address' => '456 Technology Ave, Makati City, Metro Manila, Philippines',
                    'serviceable_areas' => ['Makati', 'BGC', 'Ortigas', 'Manila'],
                    'contact_phone' => '+63923456789',
                    'contact_email' => 'support@techhub.com',
                    'service_description' => 'Professional electronics delivery with setup and installation services.',
                    'is_active' => true,
                    'setup_completed' => true,
                ]);
            }

            // Create store for third vendor if exists
            if ($vendors->count() > 2) {
                VendorStore::create([
                    'user_id' => $vendors[2]->id,
                    'business_name' => 'Bella Fashion Boutique',
                    'business_type' => 'services',
                    'description' => 'Trendy fashion for men and women. From casual wear to formal attire.',
                    'address' => '789 Fashion Street, Quezon City, Metro Manila, Philippines',
                    'serviceable_areas' => ['Quezon City', 'Manila', 'San Juan'],
                    'contact_phone' => '+63934567890',
                    'contact_email' => 'hello@bellafashion.com',
                    'service_description' => 'Personal styling and fashion consultation services with home delivery.',
                    'is_active' => false, // Inactive store for testing
                    'setup_completed' => false,
                ]);
            }

            $this->command->info('Vendor stores seeder completed successfully!');
            $this->command->info('Created stores for available vendors.');
        } else {
            $this->command->warn('No vendor users found. Please run UserRolesSeeder first.');
        }
    }
}
