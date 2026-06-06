<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Total de lojas
        $totalStores     = Store::count();
        $activeStores    = Store::where('status', 'active')->count();
        $pendingStores   = Store::where('status', 'pending')->count();

        // Total de usuários (clientes = role diferente de admin e store_owner)
        $totalUsers      = User::count();
        $storeOwners     = User::where('role', 'store_owner')->count();
        $clients         = User::where('role', 'client')->count();

        // Faturamento mensal estimado: soma dos preços dos planos das lojas ativas
        $monthlyRevenue = Store::where('stores.status', 'active')
            ->join('plans', 'stores.plan_id', '=', 'plans.id')
            ->sum('plans.price');

        // Agendamentos totais no banco (se existir a tabela)
        $totalAppointments = 0;
        if (DB::getSchemaBuilder()->hasTable('appointments')) {
            $totalAppointments = DB::table('appointments')->count();
        }

        // Lojas pendentes de homologação (status = false) com dados do owner
        $pendingStoresList = Store::where('status', 'pending')
            ->with('owner:id,name,email')
            ->select('id', 'name', 'cnpj', 'phone', 'email', 'address', 'city', 'state', 'created_at', 'owner_id', 'plan_id')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($store) {
                return [
                    'id'         => $store->id,
                    'name'       => $store->name,
                    'cnpj'       => $store->cnpj,
                    'phone'      => $store->phone,
                    'email'      => $store->email,
                    'address'    => trim(($store->address ?? '') . ' ' . ($store->city ?? '') . ' ' . ($store->state ?? '')),
                    'owner'      => $store->owner?->name ?? 'Sem responsável',
                    'owner_email'=> $store->owner?->email ?? '',
                    'created_at' => $store->created_at?->format('Y-m-d'),
                    'status'     => 'pending',
                ];
            });

        // Lojas recentemente aprovadas (últimas 5 ativas)
        $recentlyApproved = Store::where('status', 'active')
            ->with('owner:id,name')
            ->select('id', 'name', 'updated_at', 'owner_id')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'owner'       => $s->owner?->name ?? '',
                'approved_at' => $s->updated_at?->format('Y-m-d'),
            ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total_stores'       => $totalStores,
                    'active_stores'      => $activeStores,
                    'pending_stores'     => $pendingStores,
                    'total_users'        => $totalUsers,
                    'store_owners'       => $storeOwners,
                    'clients'            => $clients,
                    'monthly_revenue'    => (float) $monthlyRevenue,
                    'total_appointments' => $totalAppointments,
                ],
                'pending_stores'    => $pendingStoresList,
                'recently_approved' => $recentlyApproved,
            ],
        ]);
    }
}
