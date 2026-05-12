<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;

class StoreServiceController extends Controller
{
    public function index(Request $request)
    {
        $storeIds = $this->ownerStoreIds($request->user());

        $query = Service::query()->whereIn('store_id', $storeIds);

        if ($request->has('active')) {
            $query->where('status', $request->boolean('active'));
        }

        if ($search = $request->string('search')->toString()) {
            $query->where('name', 'ilike', "%{$search}%");
        }

        $limit = (int) ($request->input('limit', 100));
        $services = $query->orderByDesc('id')->limit(max(1, min($limit, 200)))->get();

        return response()->json($services->map(fn (Service $s) => $this->serviceJson($s)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration' => ['required', 'integer', 'min:1'],
            'category' => ['nullable', 'string', 'max:120'],
            'active' => ['nullable', 'boolean'],
        ]);

        $store = $this->ownerPrimaryStore($request->user());

        $service = Service::create([
            'store_id' => $store->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'duration_minutes' => $validated['duration'],
            'category' => $validated['category'] ?? null,
            'status' => array_key_exists('active', $validated) ? (bool) $validated['active'] : true,
        ]);

        return response()->json($this->serviceJson($service->fresh()), 201);
    }

    public function update(Request $request, Service $service)
    {
        $storeIds = $this->ownerStoreIds($request->user());

        if (! in_array($service->store_id, $storeIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'duration' => ['sometimes', 'required', 'integer', 'min:1'],
            'category' => ['sometimes', 'nullable', 'string', 'max:120'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $service->fill([
            ...array_key_exists('name', $validated) ? ['name' => $validated['name']] : [],
            ...array_key_exists('description', $validated) ? ['description' => $validated['description']] : [],
            ...array_key_exists('price', $validated) ? ['price' => $validated['price']] : [],
            ...array_key_exists('duration', $validated) ? ['duration_minutes' => $validated['duration']] : [],
            ...array_key_exists('category', $validated) ? ['category' => $validated['category']] : [],
            ...array_key_exists('active', $validated) ? ['status' => (bool) $validated['active']] : [],
        ]);

        $service->save();

        return response()->json($this->serviceJson($service->fresh()));
    }

    public function destroy(Request $request, Service $service)
    {
        $storeIds = $this->ownerStoreIds($request->user());

        if (! in_array($service->store_id, $storeIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado',
            ], 403);
        }

        // Por segurança operacional (agendamentos/histórico), desativamos ao invés de deletar.
        $service->update(['status' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Serviço desativado com sucesso.',
        ]);
    }

    private function ownerStoreIds(?User $user): array
    {
        $ids = $user?->storesOwned()->pluck('id')->all() ?? [];

        if (count($ids) === 0) {
            abort(response()->json([
                'success' => false,
                'message' => 'Nenhuma loja vinculada a este usuário.',
            ], 422));
        }

        return $ids;
    }

    private function ownerPrimaryStore(User $user): Store
    {
        $store = $user->storesOwned()->orderBy('id')->first();

        if (! $store) {
            abort(response()->json([
                'success' => false,
                'message' => 'Nenhuma loja vinculada a este usuário.',
            ], 422));
        }

        return $store;
    }

    private function serviceJson(Service $service): array
    {
        return [
            'id' => (string) $service->id,
            'storeId' => (string) $service->store_id,
            'name' => $service->name,
            'description' => $service->description,
            'price' => (float) $service->price,
            'duration' => (int) $service->duration_minutes,
            'category' => $service->category,
            'active' => (bool) $service->status,
            'createdAt' => optional($service->created_at)->toISOString(),
            'updatedAt' => optional($service->updated_at)->toISOString(),
        ];
    }
}

