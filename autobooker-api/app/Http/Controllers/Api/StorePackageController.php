<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PackageModel;
use Illuminate\Http\Request;

class StorePackageController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $packages = PackageModel::where('store_id', $store->id)
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $packages,
        ]);
    }

    public function store(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sessions' => 'required|integer|min:1',
            'validity_days' => 'required|integer|min:1',
        ]);

        $package = PackageModel::create([
            'store_id' => $store->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'sessions' => $data['sessions'],
            'validity_days' => $data['validity_days'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pacote criado com sucesso.',
            'data' => $package,
        ], 201);
    }

    public function update(Request $request, PackageModel $package)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store || $package->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sessions' => 'required|integer|min:1',
            'validity_days' => 'required|integer|min:1',
        ]);

        $package->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Pacote atualizado com sucesso.',
            'data' => $package,
        ]);
    }

    public function destroy(Request $request, PackageModel $package)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store || $package->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado.'
            ], 403);
        }

        $package->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pacote excluído com sucesso.',
        ]);
    }
}