<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('vendor_product_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_store_id')->constrained('vendor_stores')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->string('category'); // Service category (Electronics & Technology, etc.)
            $table->decimal('price_min', 10, 2);
            $table->decimal('price_max', 10, 2);
            $table->integer('duration_minutes')->nullable(); // Service duration in minutes
            $table->decimal('discount_percentage', 5, 2)->nullable(); // Discount percentage (0-100)
            $table->boolean('is_popular')->default(false); // Popular choice badge
            $table->boolean('is_guaranteed')->default(true); // Guaranteed service
            $table->boolean('is_professional')->default(true); // Professional service
            $table->decimal('rating', 3, 2)->nullable(); // Average rating (0-5)
            $table->integer('total_reviews')->default(0); // Total number of reviews
            $table->string('response_time')->nullable(); // e.g., "Within 2 hours"
            
            // What's Included (JSON array of included features)
            $table->json('includes')->nullable(); // ["Free diagnostic", "Original parts", etc.]
            
            // Requirements (JSON array of requirements)
            $table->json('requirements')->nullable(); // ["Device must be accessible", etc.]
            
            // Additional service features
            $table->boolean('has_warranty')->default(false); // Has warranty
            $table->integer('warranty_days')->nullable(); // Warranty period in days
            $table->boolean('pickup_available')->default(false); // Pickup service available
            $table->boolean('delivery_available')->default(false); // Delivery service available
            $table->boolean('emergency_service')->default(false); // 24/7 emergency service
            $table->text('special_instructions')->nullable(); // Special instructions for service
            
            // SEO and metadata
            $table->string('slug')->unique()->nullable(); // URL slug for service
            $table->json('tags')->nullable(); // Service tags for filtering
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index('vendor_store_id');
            $table->index('is_active');
            $table->index('category');
            $table->index('is_popular');
            $table->index('rating');
            $table->index('slug');
        });
    }

    public function down()
    {
        Schema::dropIfExists('vendor_product_services');
    }
};