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
                'name' => 'Professional Electronics Repair',
                'description' => 'Complete electronics repair service including smartphones, laptops, tablets, and gaming consoles. Our certified technicians use original parts and provide warranty on all repairs.',
                'category' => 'Electronics & Technology',
                'price_min' => 500.00,
                'price_max' => 2000.00,
                'duration_minutes' => 120,
                'discount_percentage' => 15.00,
                'is_popular' => true,
                'is_guaranteed' => true,
                'is_professional' => true,
                'rating' => 4.8,
                'total_reviews' => 156,
                'response_time' => 'Within 2 hours',
                'includes' => json_encode([
                    'Free diagnostic assessment',
                    'Original parts replacement',
                    '90-day warranty',
                    'Pick-up and delivery service',
                    'Data recovery assistance'
                ]),
                'requirements' => json_encode([
                    'Device must be accessible',
                    'Provide purchase receipt if available',
                    'Backup important data before service'
                ]),
                'has_warranty' => true,
                'warranty_days' => 90,
                'pickup_available' => true,
                'delivery_available' => true,
                'emergency_service' => false,
                'special_instructions' => 'Please ensure device is charged and accessible before technician arrival.',
                'slug' => 'professional-electronics-repair',
                'tags' => json_encode(['electronics', 'repair', 'smartphone', 'laptop', 'warranty']),
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
