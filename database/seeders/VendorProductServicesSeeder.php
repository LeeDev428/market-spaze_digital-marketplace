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
                'category' => 'Grocery & Food',
                'price_min' => 200.00,
                'price_max' => 2000.00,
                'duration_minutes' => 60,
                'is_popular' => true,
                'rating' => 4.5,
                'total_reviews' => 89,
                'response_time' => 'Within 1 hour',
                'includes' => json_encode([
                    'Express delivery',
                    'Fresh quality guarantee',
                    'Real-time tracking'
                ]),
                'requirements' => json_encode([
                    'Delivery area must be accessible',
                    'Someone must be available to receive order'
                ]),
                'pickup_available' => false,
                'delivery_available' => true,
                'slug' => 'express-grocery',
                'tags' => json_encode(['grocery', 'express', 'delivery', 'food']),
                'is_active' => true,
            ]);

            VendorProductService::create([
                'vendor_store_id' => $freshMart->id,
                'name' => 'Bulk Shopping',
                'description' => 'Wholesale grocery shopping for events, parties, or monthly stocking.',
                    'category' => 'Grocery & Food',
                'price_min' => 2000.00,
                'price_max' => 20000.00,
                'duration_minutes' => 180,
                'rating' => 4.6,
                'total_reviews' => 45,
                'response_time' => 'Within 4 hours',
                'includes' => json_encode([
                    'Bulk pricing discounts',
                    'Free delivery for large orders',
                    'Quality assurance'
                ]),
                'requirements' => json_encode([
                    'Minimum order value required',
                    'Advanced booking recommended'
                ]),
                'pickup_available' => true,
                'delivery_available' => true,
                'slug' => 'bulk-shopping',
                'tags' => json_encode(['grocery', 'bulk', 'wholesale', 'events']),
                'is_active' => true,
            ]);

            // Services for Tech Hub Electronics (second store if exists)
            if ($stores->count() > 1) {
                $techHub = $stores->skip(1)->first();
                
                VendorProductService::create([
                    'vendor_store_id' => $techHub->id,
                    'name' => 'Electronics Delivery',
                    'description' => 'Safe delivery of electronics including smartphones, laptops, tablets, and accessories.',
                    'category' => 'Electronics & Technology',
                    'price_min' => 1000.00,
                    'price_max' => 100000.00,
                    'duration_minutes' => 120,
                    'rating' => 4.7,
                    'total_reviews' => 134,
                    'response_time' => 'Within 2 hours',
                    'includes' => json_encode([
                        'Secure packaging',
                        'Insurance coverage',
                        'Real-time tracking',
                        'Professional handling'
                    ]),
                    'requirements' => json_encode([
                        'Valid ID required for pickup',
                        'Signature confirmation needed'
                    ]),
                    'pickup_available' => true,
                    'delivery_available' => true,
                    'slug' => 'electronics-delivery',
                    'tags' => json_encode(['electronics', 'delivery', 'tech', 'secure']),
                    'is_active' => true,
                ]);

                VendorProductService::create([
                    'vendor_store_id' => $techHub->id,
                    'name' => 'Tech Setup Service',
                    'description' => 'Professional setup and installation of electronics at your location.',
                    'category' => 'Electronics & Technology',
                    'price_min' => 500.00,
                    'price_max' => 3000.00,
                    'duration_minutes' => 90,
                    'rating' => 4.9,
                    'total_reviews' => 76,
                    'response_time' => 'Within 3 hours',
                    'includes' => json_encode([
                        'Complete device setup',
                        'Software installation',
                        'Basic tutorial',
                        'Configuration backup'
                    ]),
                    'requirements' => json_encode([
                        'Device must be new or reset',
                        'Wi-Fi access required',
                        'User accounts ready'
                    ]),
                    'pickup_available' => false,
                    'delivery_available' => false,
                    'slug' => 'tech-setup-service',
                    'tags' => json_encode(['tech', 'setup', 'installation', 'onsite']),
                    'is_active' => true,
                ]);

                VendorProductService::create([
                    'vendor_store_id' => $techHub->id,
                    'name' => 'Device Repair',
                    'description' => 'On-site repair services for smartphones, laptops, and other devices.',
                    'category' => 'Electronics & Technology',
                    'price_min' => 800.00,
                    'price_max' => 8000.00,
                    'duration_minutes' => 150,
                    'rating' => 4.8,
                    'total_reviews' => 203,
                    'response_time' => 'Within 4 hours',
                    'includes' => json_encode([
                        'Free diagnostic',
                        'Genuine parts',
                        '30-day warranty',
                        'On-site service'
                    ]),
                    'requirements' => json_encode([
                        'Device accessible',
                        'Power source available',
                        'Backup data recommended'
                    ]),
                    'has_warranty' => true,
                    'warranty_days' => 30,
                    'pickup_available' => true,
                    'delivery_available' => true,
                    'slug' => 'device-repair',
                    'tags' => json_encode(['repair', 'device', 'onsite', 'warranty']),
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
                    'category' => 'Fashion & Lifestyle',
                    'price_min' => 800.00,
                    'price_max' => 15000.00,
                    'duration_minutes' => 60,
                    'rating' => 4.4,
                    'total_reviews' => 92,
                    'response_time' => 'Within 2 hours',
                    'includes' => json_encode([
                        'Careful handling',
                        'Easy returns',
                        'Try before you buy',
                        'Style consultation'
                    ]),
                    'requirements' => json_encode([
                        'Someone available for delivery',
                        'ID required for returns'
                    ]),
                    'pickup_available' => true,
                    'delivery_available' => true,
                    'slug' => 'fashion-delivery',
                    'tags' => json_encode(['fashion', 'delivery', 'clothing', 'returns']),
                    'is_active' => true,
                ]);

                VendorProductService::create([
                    'vendor_store_id' => $bellaFashion->id,
                    'name' => 'Personal Styling',
                    'description' => 'Personal fashion consultation and styling service at your location.',
                    'category' => 'Fashion & Lifestyle',
                    'price_min' => 1500.00,
                    'price_max' => 5000.00,
                    'duration_minutes' => 120,
                    'rating' => 4.7,
                    'total_reviews' => 31,
                    'response_time' => 'Within 24 hours',
                    'includes' => json_encode([
                        'Personal consultation',
                        'Style assessment',
                        'Color analysis',
                        'Wardrobe recommendations'
                    ]),
                    'requirements' => json_encode([
                        'Wardrobe access needed',
                        'Minimum 2 hour session'
                    ]),
                    'pickup_available' => false,
                    'delivery_available' => false,
                    'slug' => 'personal-styling',
                    'tags' => json_encode(['styling', 'fashion', 'consultation', 'personal']),
                    'is_active' => false, // Inactive service for testing
                ]);

                VendorProductService::create([
                    'vendor_store_id' => $bellaFashion->id,
                    'name' => 'Fitting Service',
                    'description' => 'Professional fitting and alteration service for perfect clothing fit.',
                    'category' => 'Fashion & Lifestyle',
                    'price_min' => 300.00,
                    'price_max' => 2000.00,
                    'duration_minutes' => 45,
                    'rating' => 4.6,
                    'total_reviews' => 67,
                    'response_time' => 'Within 3 hours',
                    'includes' => json_encode([
                        'Professional fitting',
                        'Basic alterations',
                        'Style advice'
                    ]),
                    'requirements' => json_encode([
                        'Bring garments to fit',
                        'Appointment required'
                    ]),
                    'pickup_available' => true,
                    'delivery_available' => true,
                    'slug' => 'fitting-service',
                    'tags' => json_encode(['fitting', 'alteration', 'fashion', 'tailoring']),
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
                    'category' => 'Consultation & Support',
                    'price_min' => 0.00,
                    'price_max' => 500.00,
                    'duration_minutes' => 30,
                    'rating' => 4.8,
                    'total_reviews' => 25,
                    'response_time' => 'Within 1 hour',
                    'includes' => json_encode([
                        'Expert advice',
                        'Product recommendations',
                        'Service guidance'
                    ]),
                    'requirements' => json_encode([
                        'No requirements'
                    ]),
                    'pickup_available' => false,
                    'delivery_available' => false,
                    'slug' => 'customer-consultation-' . $store->id,
                    'tags' => json_encode(['consultation', 'advice', 'support', 'free']),
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
