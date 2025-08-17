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
            $table->decimal('price_min', 10, 2);
            $table->decimal('price_max', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index('vendor_store_id');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('vendor_product_services');
    }
};