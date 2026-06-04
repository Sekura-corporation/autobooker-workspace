<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('loyalty_points', function (Blueprint $table) {
            if (!Schema::hasColumn('loyalty_points', 'client_id')) {
                $table->foreignId('client_id')
                    ->nullable()
                    ->constrained('users')
                    ->cascadeOnDelete();
            }

            if (!Schema::hasColumn('loyalty_points', 'store_id')) {
                $table->foreignId('store_id')
                    ->nullable()
                    ->constrained('stores')
                    ->cascadeOnDelete();
            }

            if (!Schema::hasColumn('loyalty_points', 'points')) {
                $table->integer('points')->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('loyalty_points', function (Blueprint $table) {
            if (Schema::hasColumn('loyalty_points', 'client_id')) {
                $table->dropConstrainedForeignId('client_id');
            }

            if (Schema::hasColumn('loyalty_points', 'store_id')) {
                $table->dropConstrainedForeignId('store_id');
            }

            if (Schema::hasColumn('loyalty_points', 'points')) {
                $table->dropColumn('points');
            }
        });
    }
};