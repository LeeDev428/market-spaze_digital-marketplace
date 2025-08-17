<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\VendorProductService;
use App\Models\VendorStore;

class VendorProductServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get vendor stores
        $stores = VendorStore::all();

        if ($stores->count() > 0) {
            // Services for Fresh Mart Grocery (first store)
            $freshMart = $stores->first();
            
            VendorProductService::create([
                'vendor_store_id' => $freshMart->id,
                'name' => 'Grocery Delivery',
                'description' => 'Fresh groceries delivered to your doorstep. Including fruits, vegetables, dairy, and pantry items.',
                'price_min' => 500.00,
                'price_max' => 5000.00,
                'is_active' => true,
            ]);

            VendorProductService::create([
                'vendor_store_id' => $freshMart->id,
                'name' => 'Express Grocery',
                'description' => 'Quick grocery delivery within 1 hour for essential items.',
                'price_min' => 200.00,
                'price_max' => 2000.00,
                'is_active' => true,
            ]);

            VendorProductService::create([
                'vendor_store_id' => $freshMart->id,
                'name' => 'Bulk Shopping',
                'description' => 'Wholesale grocery shopping for events, parties, or monthly stocking.',
                'price_min' => 2000.00,
                'price_max' => 20000.00,
                'is_active' => true,
            ]);

            // Services for Tech Hub Electronics (second store if exists)
            if ($stores->count() > 1) {
                $techHub = $stores->skip(1)->first();
                
                VendorProductService::create([
                    'vendor_store_id' => $techHub->id,
                    'name' => 'Electronics Delivery',
                    'description' => 'Safe delivery of electronics including smartphones, laptops, tablets, and accessories.',
                    'price_min' => 1000.00,
                    'price_max' => 100000.00,
                    'is_active' => true,
                ]);

                VendorProductService::create([
                    'vendor_store_id' => $techHub->id,
                    'name' => 'Tech Setup Service',
                    'description' => 'Professional setup and installation of electronics at your location.',
                    'price_min' => 500.00,
                    'price_max' => 3000.00,
                    'is_active' => true,
                ]);

                VendorProductService::create([
                    'vendor_store_id' => $techHub->id,
                    'name' => 'Device Repair',
                    'description' => 'On-site repair services for smartphones, laptops, and other devices.',
                    'price_min' => 800.00,
                    'price_max' => 8000.00,
                    'is_active' => true,
                ]);
            }

            // Services for Bella Fashion Boutique (third store if exists)
            if ($stores->count() > 2) {
                $bellaFashion = $stores->skip(2)->first();
                
                VendorProductService::create([
                    'vendor_store_id' => $bellaFashion->id,
                    'name' => 'Fashion Delivery',
                    'description' => 'Careful delivery of clothing, shoes, and accessories with option for returns.',
                    'price_min' => 800.00,
                    'price_max' => 15000.00,
                    'is_active' => true,
                ]);

                VendorProductService::create([
                    'vendor_store_id' => $bellaFashion->id,
                    'name' => 'Personal Styling',
                    'description' => 'Personal fashion consultation and styling service at your location.',
                    'price_min' => 1500.00,
                    'price_max' => 5000.00,
                    'is_active' => false, // Inactive service for testing
                ]);

                VendorProductService::create([
                    'vendor_store_id' => $bellaFashion->id,
                    'name' => 'Fitting Service',
                    'description' => 'Professional fitting and alteration service for perfect clothing fit.',
                    'price_min' => 300.00,
                    'price_max' => 2000.00,
                    'is_active' => true,
                ]);
            }

            // Additional services for demonstration
            foreach ($stores as $store) {
                // General consultation service for all stores
                VendorProductService::create([
                    'vendor_store_id' => $store->id,
                    'name' => 'Customer Consultation',
                    'description' => 'Free consultation to help customers choose the right products or services.',
                    'price_min' => 0.00,
                    'price_max' => 500.00,
                    'is_active' => true,
                ]);
            }

            $this->command->info('Vendor product services seeder completed successfully!');
            $this->command->info('Created services for all available vendor stores.');
        } else {
            $this->command->warn('No vendor stores found. Please run VendorStoresSeeder first.');
        }
    }
}
