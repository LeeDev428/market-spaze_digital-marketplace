<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create a comprehensive reviews system for products, services, riders, and vendors
     */
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            
            // WHO is reviewing
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Customer who is reviewing
            
            // WHAT is being reviewed (Polymorphic - can review anything)
            $table->morphs('reviewable'); // reviewable_type, reviewable_id
            // Examples:
            // - reviewable_type = 'App\Models\VendorProductService' (for service reviews)
            // - reviewable_type = 'App\Models\OrderItem' (for product reviews)
            // - reviewable_type = 'App\Models\Rider' (for rider reviews)
            // - reviewable_type = 'App\Models\VendorStore' (for overall store reviews)
            
            // Related entities for context
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('order_item_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('delivery_id')->nullable()->constrained()->onDelete('cascade');
            
            // RATINGS (Multiple dimensions)
            $table->integer('overall_rating')->comment('Overall rating 1-5'); // Main rating
            $table->integer('quality_rating')->nullable()->comment('Product/Service quality 1-5');
            $table->integer('value_rating')->nullable()->comment('Value for money 1-5');
            $table->integer('timeliness_rating')->nullable()->comment('On-time delivery/service 1-5');
            $table->integer('communication_rating')->nullable()->comment('Communication quality 1-5');
            $table->integer('professionalism_rating')->nullable()->comment('Professionalism 1-5');
            
            // FEEDBACK Content
            $table->string('title')->nullable()->comment('Review headline');
            $table->text('comment')->comment('Detailed review text');
            $table->json('pros')->nullable()->comment('List of positive points');
            $table->json('cons')->nullable()->comment('List of negative points');
            
            // IMAGES/MEDIA
            $table->json('images')->nullable()->comment('Array of image URLs uploaded with review');
            $table->json('videos')->nullable()->comment('Array of video URLs (future use)');
            
            // VERIFICATION & TRUST
            $table->boolean('verified_purchase')->default(false)->comment('Purchased through platform');
            $table->boolean('is_anonymous')->default(false)->comment('Hide reviewer name');
            
            // ENGAGEMENT
            $table->integer('helpful_count')->default(0)->comment('How many found this helpful');
            $table->integer('unhelpful_count')->default(0)->comment('How many found this unhelpful');
            $table->integer('report_count')->default(0)->comment('Times reported as inappropriate');
            
            // VENDOR RESPONSE
            $table->text('vendor_response')->nullable()->comment('Vendor reply to review');
            $table->timestamp('vendor_responded_at')->nullable();
            $table->foreignId('vendor_responded_by')->nullable()->constrained('users')->onDelete('set null');
            
            // MODERATION
            $table->enum('status', ['pending', 'approved', 'rejected', 'flagged'])->default('approved');
            $table->text('moderation_notes')->nullable()->comment('Admin notes on review');
            $table->foreignId('moderated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('moderated_at')->nullable();
            
            // METADATA
            $table->string('source')->default('web')->comment('web, mobile_app, email');
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            
            $table->timestamps();
            $table->softDeletes(); // Allow soft deletion but keep for analytics
            
            // INDEXES for performance
            // Note: morphs() already creates index for reviewable_type and reviewable_id
            $table->index('user_id'); // Find all reviews by a user
            $table->index('overall_rating'); // Filter by rating
            $table->index('verified_purchase'); // Filter verified reviews
            $table->index('status'); // Filter by moderation status
            $table->index('created_at'); // Sort by date
            $table->index(['order_id', 'order_item_id']); // Find reviews for specific order items
            $table->index('appointment_id'); // Find reviews for appointments
            $table->index('delivery_id'); // Find reviews for deliveries
        });
        
        // Pivot table for users who found reviews helpful/unhelpful
        Schema::create('review_helpfulness', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('vote', ['helpful', 'unhelpful']);
            $table->timestamps();
            
            // Unique constraint - one vote per user per review
            $table->unique(['review_id', 'user_id']);
        });
        
        // Table for review reports (when users flag inappropriate content)
        Schema::create('review_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained()->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade');
            $table->enum('reason', [
                'spam',
                'offensive',
                'fake',
                'irrelevant',
                'personal_info',
                'copyright',
                'other'
            ]);
            $table->text('details')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'resolved', 'dismissed'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('review_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('review_reports');
        Schema::dropIfExists('review_helpfulness');
        Schema::dropIfExists('reviews');
    }
};
