<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Plan;
use App\Models\Partnership;
use App\Models\Setting;
use App\Models\Store;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Criar Usuários
        // Admin
        $admin = User::create([
            'name' => 'Admin AutoBooker',
            'email' => 'admin@autobooker.com',
            'password' => Hash::make('123456'),
            'role' => 'admin',
            'status' => true,
        ]);

        // Lojista
        $lojista = User::create([
            'name' => 'Loja Premium',
            'email' => 'loja@autobooker.com',
            'password' => Hash::make('123456'),
            'role' => 'store_owner',
            'status' => true,
        ]);

        // Cliente
        $cliente = User::create([
            'name' => 'João Silva',
            'email' => 'cliente@autobooker.com',
            'password' => Hash::make('123456'),
            'role' => 'client',
            'status' => true,
        ]);

        // 2. Criar Loja padrão para o lojista
        $store = Store::create([
            'owner_id' => $lojista->id,
            'name' => 'Loja Premium',
            'cnpj' => '12.345.678/0001-90',
            'phone' => '(11) 98888-2233',
            'email' => 'premium@autoestetica.com.br',
            'address' => 'Av. Principal, 456',
            'city' => 'São Paulo',
            'state' => 'SP',
            'zip_code' => '01234-567',
            'description' => 'Estética Automotiva de Alto Nível.',
            'opening_hours' => 'Segunda a Sábado, das 8h às 18h',
            'status' => 'active',
        ]);

        // 3. Criar Planos Comerciais
        $planBasico = Plan::create([
            'name' => 'Básico+',
            'price' => 49.90,
            'billing_cycle' => 'monthly',
            'setup_fee' => 0.00,
            'platform_commission' => 0.00,
            'commission_type' => 'percentage',
            'store_limit' => 1,
            'appointment_limit' => 'Ilimitado',
            'support_level' => 'Suporte padrão',
            'description' => 'O essencial para começar.',
            'features' => ['Agendamentos', 'Clientes', 'Estoque', 'Relatórios'],
            'revenue_model' => ['Assinatura recorrente'],
            'status' => 'active',
            'is_featured' => false,
        ]);

        $planComfort = Plan::create([
            'name' => 'Comfort+',
            'price' => 149.90,
            'billing_cycle' => 'monthly',
            'setup_fee' => 0.00,
            'platform_commission' => 5.00,
            'commission_type' => 'percentage',
            'store_limit' => 5,
            'appointment_limit' => 'Ilimitado',
            'support_level' => 'Suporte prioritário',
            'description' => 'Custo-benefício ideal.',
            'features' => ['Tudo do Básico+', 'Fidelidade', 'Relatórios Pro', 'Suporte'],
            'revenue_model' => ['Assinatura recorrente', 'Comissão sobre parceiros'],
            'status' => 'active',
            'is_featured' => true,
        ]);

        $planPremium = Plan::create([
            'name' => 'Premium+',
            'price' => 299.90,
            'billing_cycle' => 'monthly',
            'setup_fee' => 0.00,
            'platform_commission' => 8.00,
            'commission_type' => 'percentage',
            'store_limit' => 20,
            'appointment_limit' => 'Ilimitado',
            'support_level' => 'Suporte premium',
            'description' => 'Poder total e escala.',
            'features' => ['Tudo do Comfort+', 'Multi-filiais', 'WhatsApp', 'Consultoria'],
            'revenue_model' => ['Assinatura recorrente', 'Comissão sobre parceiros'],
            'status' => 'active',
            'is_featured' => false,
        ]);

        // Associar o plano Comfort+ (padrão) para a loja criada
        $store->update(['plan_id' => $planComfort->id]);

        // 4. Criar Parcerias de teste
        Partnership::create([
            'store_name' => 'Loja Premium',
            'partner_name' => 'Fiat Auto',
            'partner_type' => 'Concessionária',
            'region' => 'São Paulo - Capital',
            'contact_name' => 'Carla Menezes',
            'contact_email' => 'carla.menezes@fiatauto.com',
            'contact_phone' => '(11) 98888-1122',
            'discount_percent' => 15,
            'status' => 'active',
            'start_date' => '2026-02-10',
            'benefits' => ['Desconto em higienização', 'Cupom cruzado', 'Fila prioritária'],
            'notes' => 'Parceria ativa com foco em clientes premium da concessionária.',
        ]);

        Partnership::create([
            'store_name' => 'Loja Premium',
            'partner_name' => 'BMW Motors',
            'partner_type' => 'Concessionária',
            'region' => 'Campinas - SP',
            'contact_name' => 'Marcos Lima',
            'contact_email' => 'marcos.lima@bmwmotors.com',
            'contact_phone' => '(19) 97777-4455',
            'discount_percent' => 12,
            'status' => 'active',
            'start_date' => '2026-04-01',
            'benefits' => ['Lavagem pós-entrega', 'Desconto em vitrificação'],
            'notes' => 'Apoio em entrega técnica e indicação de serviços premium.',
        ]);

        // 5. Criar Configurações Globais
        Setting::create(['key' => 'tax_rate', 'value' => '5.5']);
        Setting::create(['key' => 'transfer_days', 'value' => '14']);
        Setting::create(['key' => 'gateway_key', 'value' => 'sk_live_********************************']);
        Setting::create(['key' => 'maintenance_mode', 'value' => 'off']);
        Setting::create(['key' => 'system_email', 'value' => 'noreply@autoestetica.com.br']);
        Setting::create(['key' => 'session_timeout', 'value' => '120']);
        Setting::create(['key' => 'terms_url', 'value' => 'https://autoestetica.com/termos-de-uso']);
        Setting::create(['key' => 'privacy_url', 'value' => 'https://autoestetica.com/privacidade']);

        // 6. Criar Serviços para a loja
        $servicoLavagem = Service::create([
            'store_id' => $store->id,
            'name' => 'Lavagem Completa',
            'description' => 'Lavagem externa e interna do veículo',
            'price' => 150.00,
            'duration_minutes' => 60,
            'status' => true,
        ]);

        $servicoPolimento = Service::create([
            'store_id' => $store->id,
            'name' => 'Polimento Protetor',
            'description' => 'Polimento com proteção cerâmica',
            'price' => 250.00,
            'duration_minutes' => 90,
            'status' => true,
        ]);

        $servicoVitrificacao = Service::create([
            'store_id' => $store->id,
            'name' => 'Vitrificação Premium',
            'description' => 'Vitrificação de pintura com produto premium',
            'price' => 450.00,
            'duration_minutes' => 120,
            'status' => true,
        ]);

        // 7. Criar Agendamentos de teste para este mês (com status completed)
        // Primeiro criar um veículo para o cliente
        $vehicle = Vehicle::create([
            'client_id' => $cliente->id,
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'color' => 'Prata',
            'year' => 2023,
            'plate' => 'ABC1234',
        ]);

        $currentDate = now();
        $startOfMonth = $currentDate->copy()->startOfMonth();
        
        // Agendamentos para os últimos 7 dias
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfMonth->copy()->addDays($currentDate->day - 7 + $i);
            
            // 2-4 agendamentos por dia
            for ($j = 0; $j < rand(2, 4); $j++) {
                $service = collect([$servicoLavagem, $servicoPolimento, $servicoVitrificacao])->random();
                
                Appointment::create([
                    'store_id' => $store->id,
                    'client_id' => $cliente->id,
                    'service_id' => $service->id,
                    'vehicle_id' => $vehicle->id,
                    'appointment_date' => $date->format('Y-m-d'),
                    'appointment_time' => sprintf('%02d:00:00', rand(9, 17)),
                    'status' => 'completed',
                    'price' => $service->price,
                    'notes' => 'Agendamento de teste',
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
        }
    }
}
