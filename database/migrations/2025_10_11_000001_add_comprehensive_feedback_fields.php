<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add comprehensive feedback fields to existing tables
     * This enhances your current tables without breaking existing data
     */
    public function up()
    {
        // ================================================
        // 1. ENHANCE ORDER_ITEMS TABLE
        // ================================================
        // Allow customers to rate individual products in their order
        Schema::table('order_items', function (Blueprint $table) {
            // Product-specific ratings
            $table->integer('product_rating')->nullable()->after('subtotal')
                ->comment('Customer rating for this specific product (1-5)');
            
            $table->text('product_feedback')->nullable()->after('product_rating')
                ->comment('Customer feedback for this specific product');
            
            $table->json('product_review_images')->nullable()->after('product_feedback')
                ->comment('Photos of the received product');
            
            $table->boolean('verified_purchase')->default(true)->after('product_review_images')
                ->comment('Verified purchase through platform');
            
            $table->timestamp('reviewed_at')->nullable()->after('verified_purchase')
                ->comment('When the product was reviewed');
            
            // Quality checks
            $table->boolean('as_described')->nullable()->after('reviewed_at')
                ->comment('Product matched description?');
            
            $table->boolean('would_recommend')->nullable()->after('as_described')
                ->comment('Would recommend this product?');
            
            // Add index for querying reviewed items
            $table->index('product_rating');
            $table->index('reviewed_at');
        });
        
        // ================================================
        // 2. ENHANCE DELIVERIES TABLE  
        // ================================================
        // Separate and detailed feedback for rider performance
        Schema::table('deliveries', function (Blueprint $table) {
            // Rename existing columns for clarity
            $table->renameColumn('customer_rating', 'delivery_overall_rating');
            $table->renameColumn('customer_feedback', 'delivery_overall_feedback');
            
            // Add detailed rider-specific ratings
            $table->integer('rider_rating')->nullable()->after('delivery_overall_feedback')
                ->comment('Specific rating for rider performance (1-5)');
            
            $table->text('rider_feedback')->nullable()->after('rider_rating')
                ->comment('Specific feedback about the rider');
            
            $table->integer('rider_professionalism_rating')->nullable()->after('rider_feedback')
                ->comment('How professional was the rider? (1-5)');
            
            $table->integer('rider_timeliness_rating')->nullable()->after('rider_professionalism_rating')
                ->comment('Was delivery on time? (1-5)');
            
            $table->integer('rider_communication_rating')->nullable()->after('rider_timeliness_rating')
                ->comment('Rider communication quality (1-5)');
            
            $table->integer('rider_care_rating')->nullable()->after('rider_communication_rating')
                ->comment('How carefully did rider handle items? (1-5)');
            
            $table->boolean('rider_followed_instructions')->nullable()->after('rider_care_rating')
                ->comment('Did rider follow special delivery instructions?');
            
            $table->boolean('rider_was_polite')->nullable()->after('rider_followed_instructions')
                ->comment('Was the rider courteous and polite?');
            
            $table->boolean('would_use_rider_again')->nullable()->after('rider_was_polite')
                ->comment('Would customer want this rider again?');
            
            $table->timestamp('rider_feedback_submitted_at')->nullable()->after('would_use_rider_again')
                ->comment('When rider feedback was submitted');
            
            $table->json('delivery_issues')->nullable()->after('rider_feedback_submitted_at')
                ->comment('Array of any issues during delivery');
            
            // Add indexes
            $table->index('rider_rating');
            $table->index('rider_feedback_submitted_at');
        });
        
        // ================================================
        // 3. ENHANCE APPOINTMENTS TABLE
        // ================================================
        // Add more detailed service feedback
        Schema::table('appointments', function (Blueprint $table) {
            // Rename for clarity
            $table->renameColumn('customer_rating', 'service_overall_rating');
            $table->renameColumn('customer_feedback', 'service_overall_feedback');
            
            // Add detailed service ratings
            $table->integer('service_quality_rating')->nullable()->after('service_overall_feedback')
                ->comment('Quality of service provided (1-5)');
            
            $table->integer('vendor_professionalism_rating')->nullable()->after('service_quality_rating')
                ->comment('Vendor professionalism (1-5)');
            
            $table->integer('value_for_money_rating')->nullable()->after('vendor_professionalism_rating')
                ->comment('Value for money (1-5)');
            
            $table->integer('vendor_communication_rating')->nullable()->after('value_for_money_rating')
                ->comment('Communication quality (1-5)');
            
            $table->boolean('would_recommend_vendor')->nullable()->after('vendor_communication_rating')
                ->comment('Would recommend this vendor?');
            
            $table->boolean('would_book_again')->nullable()->after('would_recommend_vendor')
                ->comment('Would book this service again?');
            
            $table->json('review_images')->nullable()->after('would_book_again')
                ->comment('Photos of completed service/work');
            
            $table->string('review_title')->nullable()->after('review_images')
                ->comment('Headline for the review');
            
            // Add indexes
            $table->index('service_overall_rating');
        });
        
        // ================================================
        // 4. ENHANCE RIDERS TABLE
        // ================================================
        // Add more metrics for rider performance tracking
        Schema::table('riders', function (Blueprint $table) {
            // Detailed rating breakdown
            $table->decimal('professionalism_rating', 3, 2)->default(5.00)->after('rating')
                ->comment('Average professionalism rating');
            
            $table->decimal('timeliness_rating', 3, 2)->default(5.00)->after('professionalism_rating')
                ->comment('Average on-time delivery rating');
            
            $table->decimal('communication_rating', 3, 2)->default(5.00)->after('timeliness_rating')
                ->comment('Average communication rating');
            
            $table->decimal('care_rating', 3, 2)->default(5.00)->after('communication_rating')
                ->comment('Average item care rating');
            
            $table->integer('total_reviews')->default(0)->after('care_rating')
                ->comment('Total number of reviews received');
            
            $table->integer('five_star_count')->default(0)->after('total_reviews')
                ->comment('Number of 5-star ratings');
            
            $table->integer('four_star_count')->default(0)->after('five_star_count')
                ->comment('Number of 4-star ratings');
            
            $table->integer('three_star_count')->default(0)->after('four_star_count')
                ->comment('Number of 3-star ratings');
            
            $table->integer('two_star_count')->default(0)->after('three_star_count')
                ->comment('Number of 2-star ratings');
            
            $table->integer('one_star_count')->default(0)->after('two_star_count')
                ->comment('Number of 1-star ratings');
            
            $table->decimal('acceptance_rate', 5, 2)->default(100.00)->after('one_star_count')
                ->comment('Percentage of accepted deliveries');
            
            $table->decimal('completion_rate', 5, 2)->default(100.00)->after('acceptance_rate')
                ->comment('Percentage of completed deliveries');
            
            $table->integer('cancelled_deliveries')->default(0)->after('completion_rate')
                ->comment('Number of cancelled deliveries');
            
            // Add indexes
            $table->index('professionalism_rating');
            $table->index('total_reviews');
        });
        
        // ================================================
        // 5. ENHANCE VENDOR_PRODUCT_SERVICES TABLE
        // ================================================
        // Add rating breakdown for better insights
        Schema::table('vendor_product_services', function (Blueprint $table) {
            // Rating distribution
            $table->integer('five_star_count')->default(0)->after('total_reviews')
                ->comment('Number of 5-star reviews');
            
            $table->integer('four_star_count')->default(0)->after('five_star_count')
                ->comment('Number of 4-star reviews');
            
            $table->integer('three_star_count')->default(0)->after('four_star_count')
                ->comment('Number of 3-star reviews');
            
            $table->integer('two_star_count')->default(0)->after('three_star_count')
                ->comment('Number of 2-star reviews');
            
            $table->integer('one_star_count')->default(0)->after('two_star_count')
                ->comment('Number of 1-star reviews');
            
            // Detailed ratings
            $table->decimal('quality_rating', 3, 2)->nullable()->after('one_star_count')
                ->comment('Average quality rating');
            
            $table->decimal('value_rating', 3, 2)->nullable()->after('quality_rating')
                ->comment('Average value for money rating');
            
            $table->decimal('professionalism_rating', 3, 2)->nullable()->after('value_rating')
                ->comment('Average professionalism rating');
            
            $table->integer('recommendation_percentage')->default(0)->after('professionalism_rating')
                ->comment('Percentage of customers who would recommend');
            
            // Add indexes
            $table->index('five_star_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // Drop columns in reverse order
        
        Schema::table('vendor_product_services', function (Blueprint $table) {
            $table->dropColumn([
                'five_star_count',
                'four_star_count',
                'three_star_count',
                'two_star_count',
                'one_star_count',
                'quality_rating',
                'value_rating',
                'professionalism_rating',
                'recommendation_percentage',
            ]);
        });
        
        Schema::table('riders', function (Blueprint $table) {
            $table->dropColumn([
                'professionalism_rating',
                'timeliness_rating',
                'communication_rating',
                'care_rating',
                'total_reviews',
                'five_star_count',
                'four_star_count',
                'three_star_count',
                'two_star_count',
                'one_star_count',
                'acceptance_rate',
                'completion_rate',
                'cancelled_deliveries',
            ]);
        });
        
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'service_quality_rating',
                'vendor_professionalism_rating',
                'value_for_money_rating',
                'vendor_communication_rating',
                'would_recommend_vendor',
                'would_book_again',
                'review_images',
                'review_title',
            ]);
            
            $table->renameColumn('service_overall_rating', 'customer_rating');
            $table->renameColumn('service_overall_feedback', 'customer_feedback');
        });
        
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumn([
                'rider_rating',
                'rider_feedback',
                'rider_professionalism_rating',
                'rider_timeliness_rating',
                'rider_communication_rating',
                'rider_care_rating',
                'rider_followed_instructions',
                'rider_was_polite',
                'would_use_rider_again',
                'rider_feedback_submitted_at',
                'delivery_issues',
            ]);
            
            $table->renameColumn('delivery_overall_rating', 'customer_rating');
            $table->renameColumn('delivery_overall_feedback', 'customer_feedback');
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'product_rating',
                'product_feedback',
                'product_review_images',
                'verified_purchase',
                'reviewed_at',
                'as_described',
                'would_recommend',
            ]);
        });
    }
};
