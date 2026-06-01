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
        Schema::table('stock_items', function (Blueprint $table) {

            $table->foreignId('store_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('category_id')
                ->nullable()
                ->constrained('stock_categories')
                ->nullOnDelete();

            $table->string('name');

            $table->enum('type', [
                'supply',
                'product'
            ])->default('supply');

            $table->integer('quantity')->default(0);
            $table->integer('min_quantity')->default(0);

            $table->decimal('sale_price', 10, 2)
                ->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_items', function (Blueprint $table) {
            //
        });
    }
};
