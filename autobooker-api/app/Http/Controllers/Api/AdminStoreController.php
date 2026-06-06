<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Store::with('owner:id,name,email', 'plan:id,name,price');

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('cnpj', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $stores = $query->orderBy('created_at', 'desc')->paginate(15);

        $mapped = $stores->map(function ($store) {
            return [
                'id' => $store->id,
                'name' => $store->name,
                'cnpj' => $store->cnpj,
                'owner' => $store->owner?->name ?? 'Sem responsável',
                'owner_email' => $store->owner?->email ?? '',
                'status' => $store->status,
                'address' => trim(($store->address ?? '') . ' ' . ($store->city ?? '') . ' ' . ($store->state ?? '')),
                'phone' => $store->phone,
                'email' => $store->email,
                'plan' => $store->plan?->name ?? 'Nenhum',
                'plan_price' => $store->plan?->price ?? '0.00',
                'logo_url' => $store->logo_url,
                'created_at' => $store->created_at?->format('Y-m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $mapped,
            'meta' => [
                'current_page' => $stores->currentPage(),
                'last_page' => $stores->lastPage(),
                'per_page' => $stores->perPage(),
                'total' => $stores->total(),
            ]
        ]);
    }

    public function show(Store $store): JsonResponse
    {
        $store->load('owner:id,name,email,phone', 'plan:id,name,price');
        $store->loadCount('services');

        // Conta agendamentos da loja, receita e clientes únicos baseados em agendamentos
        $appointmentsCount = 0;
        $activeClients = 0;
        $monthlyRevenue = 0.0;

        if (DB::getSchemaBuilder()->hasTable('appointments')) {
            $appointmentsCount = DB::table('appointments')->where('store_id', $store->id)->count();
            
            $activeClients = DB::table('appointments')
                ->where('store_id', $store->id)
                ->distinct('client_id')
                ->count('client_id');
                
            $monthlyRevenue = DB::table('appointments')
                ->where('store_id', $store->id)
                ->whereIn('status', ['completed', 'paid', 'in_progress', 'pending'])
                ->sum('price');
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $store->id,
                'name' => $store->name,
                'cnpj' => $store->cnpj,
                'owner' => $store->owner?->name ?? 'Sem responsável',
                'owner_email' => $store->owner?->email ?? '',
                'owner_phone' => $store->owner?->phone ?? '',
                'status' => $store->status,
                'created_at' => $store->created_at?->toISOString(),
                'updated_at' => $store->updated_at?->toISOString(),
                'address' => $store->address ?? '',
                'city' => $store->city ?? '',
                'state' => $store->state ?? '',
                'zip_code' => $store->zip_code ?? '',
                'phone' => $store->phone ?? '',
                'email' => $store->email ?? '',
                'logo_url' => $store->logo_url,
                'banner_url' => $store->banner_url,
                'description' => $store->description ?? '',
                'plan' => $store->plan?->name ?? 'Nenhum plano',
                'plan_id' => $store->plan_id,
                'plan_price' => $store->plan?->price ?? '0.00',
                'total_appointments' => $appointmentsCount,
                'active_clients' => $activeClients,
                'active_services' => $store->services_count,
                'services' => $store->services()->pluck('name')->toArray(),
                'operational_status' => $store->status === 'active' ? 'Operando' : ($store->status === 'rejected' ? 'Recusada' : 'Pendente'),
                'approved_at' => $store->status === 'active' ? $store->updated_at?->toISOString() : null,
                'rating' => 5,
                'team_size' => 1,
                'monthly_revenue' => 'R$ ' . number_format((float) $monthlyRevenue, 2, ',', '.'),
                'recent_notes' => [],
                'last_activities' => [],
                'partners' => []
            ]
        ]);
    }

    public function approve(Store $store): JsonResponse
    {
        if ($store->status === 'active') {
            return response()->json(['success' => false, 'message' => 'Loja já está aprovada.'], 400);
        }

        $store->status = 'active';
        $store->save();

        return response()->json([
            'success' => true,
            'message' => 'Loja aprovada com sucesso.',
            'data' => [
                'id' => $store->id,
                'name' => $store->name,
                'status' => 'active'
            ]
        ]);
    }

    public function reject(Store $store): JsonResponse
    {
        if ($store->status === 'active') {
            return response()->json(['success' => false, 'message' => 'Não é possível rejeitar uma loja já ativa.'], 400);
        }

        $store->status = 'rejected';
        $store->save();

        return response()->json([
            'success' => true,
            'message' => 'Loja rejeitada com sucesso.',
            'data' => [
                'id' => $store->id,
                'name' => $store->name,
                'status' => 'rejected'
            ]
        ]);
    }
}
