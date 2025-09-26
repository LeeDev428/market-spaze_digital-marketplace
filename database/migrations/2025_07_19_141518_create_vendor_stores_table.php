<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('vendor_stores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('business_name');
            $table->text('description');
            $table->enum('business_type', ['products', 'services']);
            $table->text('address');
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip_code')->nullable();
            $table->json('serviceable_areas');
            $table->string('contact_phone');
            $table->string('contact_email');
            $table->text('service_description')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('vendor_image')->nullable(); // Main vendor profile image
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false); // Admin-controlled verification
            $table->boolean('setup_completed')->default(false);
            $table->string('response_time')->default('Within 24 hours');
            $table->timestamps();
            
            // Add indexes
            $table->index('user_id');
            $table->index('business_type');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('vendor_stores');
    }
};