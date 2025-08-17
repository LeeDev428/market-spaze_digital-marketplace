<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_number')->unique(); // Professional booking reference
            
            // Customer Information
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->string('customer_address')->nullable();
            $table->string('customer_city')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            
            // Booking Details
            $table->foreignId('vendor_store_id')->constrained('vendor_stores')->onDelete('cascade');
            $table->foreignId('service_id')->nullable()->constrained('vendor_product_services')->onDelete('set null');
            $table->foreignId('rider_id')->nullable()->constrained('riders')->onDelete('set null');
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->time('estimated_end_time')->nullable();
            $table->integer('duration_minutes')->default(60);
            
            // Professional Features
            $table->decimal('service_price', 10, 2)->nullable();
            $table->decimal('additional_charges', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('PHP');
            
            // Booking Requirements
            $table->json('requirements')->nullable(); // Special requirements or preparations
            $table->text('customer_notes')->nullable();
            $table->text('internal_notes')->nullable(); // For vendor use only
            
            // Status Management
            $table->enum('status', [
                'pending', 'confirmed', 'in_progress', 'completed', 
                'cancelled', 'no_show', 'rescheduled'
            ])->default('pending');
            $table->string('cancellation_reason')->nullable();
            $table->text('cancellation_details')->nullable();
            
            // Professional Tracking
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('rescheduled_at')->nullable();
            
            // Communication
            $table->boolean('sms_notifications')->default(true);
            $table->boolean('email_notifications')->default(true);
            $table->timestamp('reminder_sent_at')->nullable();
            $table->json('notification_log')->nullable();
            
            // Rating & Feedback
            $table->integer('customer_rating')->nullable();
            $table->text('customer_feedback')->nullable();
            $table->timestamp('feedback_submitted_at')->nullable();
            
            // Payment Integration
            $table->string('payment_status')->default('pending'); // pending, paid, refunded, failed
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();
            $table->timestamp('payment_completed_at')->nullable();
            
            // Location & Weather
            $table->boolean('is_home_service')->default(false);
            $table->text('service_address')->nullable();
            $table->string('weather_conditions')->nullable();
            
            $table->timestamps();
            $table->softDeletes(); // Professional deletion tracking

            // Enhanced Indexes
            $table->index('appointment_number');
            $table->index('appointment_date');
            $table->index('appointment_time');
            $table->index('status');
            $table->index('vendor_store_id');
            $table->index('service_id');
            $table->index('payment_status');
            $table->index(['appointment_date', 'appointment_time']);
            $table->index(['vendor_store_id', 'appointment_date']);
            
            // Professional constraints
            $table->unique(['vendor_store_id', 'appointment_date', 'appointment_time'], 'unique_appointment_slot');
        });
    }

    public function down()
    {
        Schema::dropIfExists('appointments');
    }
};