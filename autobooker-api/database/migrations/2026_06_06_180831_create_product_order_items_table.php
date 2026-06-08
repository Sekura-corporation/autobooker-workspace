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
        Schema::create('product_order_items', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('product_order_id')
                ->constrained('product_orders')
                ->cascadeOnDelete();
        
            $table->foreignId('product_id')
                ->constrained('stock_items')
                ->cascadeOnDelete();
        
            $table->integer('quantity');
        
            $table->decimal('unit_price', 10, 2);
        
            $table->decimal('total_price', 10, 2);
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_order_items');
    }
};
