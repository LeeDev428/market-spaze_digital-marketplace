<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductServiceImage;
use App\Models\VendorProductService;

class ProductServiceImagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first service (Professional Electronics Repair)
        $service = VendorProductService::where('name', 'Professional Electronics Repair')->first();
        
        if ($service) {
            // Create sample images for the electronics repair service
            $images = [
                [
                    'vendor_product_service_id' => $service->id,
                    'image_path' => '/img/services/electronics-repair-1.jpg',
                    'alt_text' => 'Professional electronics repair workspace',
                    'sort_order' => 1,
                    'is_primary' => true
                ],
                [
                    'vendor_product_service_id' => $service->id,
                    'image_path' => '/img/services/electronics-repair-2.jpg',
                    'alt_text' => 'Smartphone repair in progress',
                    'sort_order' => 2,
                    'is_primary' => false
                ],
                [
                    'vendor_product_service_id' => $service->id,
                    'image_path' => '/img/services/electronics-repair-3.jpg',
                    'alt_text' => 'Laptop diagnostic and repair',
                    'sort_order' => 3,
                    'is_primary' => false
                ],
                [
                    'vendor_product_service_id' => $service->id,
                    'image_path' => '/img/services/electronics-repair-4.jpg',
                    'alt_text' => 'Quality testing of repaired devices',
                    'sort_order' => 4,
                    'is_primary' => false
                ]
            ];

            foreach ($images as $imageData) {
                ProductServiceImage::create($imageData);
            }

            $this->command->info('Created sample images for Professional Electronics Repair service');
        } else {
            $this->command->warn('Professional Electronics Repair service not found. Please run VendorProductServicesSeeder first.');
        }
    }
}
