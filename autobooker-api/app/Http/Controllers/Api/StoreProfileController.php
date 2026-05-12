<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StoreProfileController extends Controller
{
    public function show(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $store
        ]);
    }

    public function update(Request $request)
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
            'cnpj' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip_code' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:1000',
            'opening_hours' => 'nullable|string|max:255',
        ]);

        $store->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Perfil da loja atualizado com sucesso.',
            'data' => $store
        ]);
    }
}