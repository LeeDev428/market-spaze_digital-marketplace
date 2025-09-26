<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_service_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_product_service_id')->constrained('vendor_product_services')->onDelete('cascade');
            $table->string('image_path'); // Store file path to the image
            $table->string('alt_text')->nullable(); // Alt text for accessibility
            $table->integer('sort_order')->default(0); // For ordering images
            $table->boolean('is_primary')->default(false); // Mark primary image
            $table->timestamps();
            
            // Add indexes
            $table->index('vendor_product_service_id');
            $table->index('sort_order');
            $table->index('is_primary');
            
            // Ensure max 8 images per service (handled at application level)
            // Add constraint to ensure only one primary image per service
            $table->unique(['vendor_product_service_id', 'is_primary'], 'unique_primary_per_service');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_service_images');
    }
};
