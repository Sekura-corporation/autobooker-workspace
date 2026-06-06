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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->string('billing_cycle')->default('monthly'); // monthly, yearly
            $table->decimal('setup_fee', 10, 2)->default(0.00);
            $table->decimal('platform_commission', 5, 2)->default(0.00);
            $table->string('commission_type')->default('percentage'); // percentage, fixed
            $table->integer('store_limit')->default(1);
            $table->string('appointment_limit')->default('Ilimitado');
            $table->string('support_level')->default('Suporte padrão');
            $table->text('description')->nullable();
            $table->json('features')->nullable(); // Para guardar itens de array de vantagens do plano
            $table->json('revenue_model')->nullable(); // Modelos de ganhos da plataforma
            $table->string('status')->default('pending'); // active, pending, paused, cancelled
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
