<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class StoreProfileController extends Controller
{
    public function show(Request $request)
    {
        $store = $request->user()->storesOwned()->with('plan:id,name,price')->first();

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
            'opening_hours' => 'nullable|string|max:5000',
            'logo_url' => 'nullable|string|max:500',
            'banner_url' => 'nullable|string|max:500',
        ]);

        $store->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Perfil da loja atualizado com sucesso.',
            'data' => $store
        ]);
    }

    public function uploadImages(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $request->validate([
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('logo')) {
            if ($store->logo_url) {
                $oldPath = str_replace(asset('storage/'), '', $store->logo_url);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('logo')->store('stores/logos', 'public');
            $store->logo_url = asset('storage/' . $path);
        }

        if ($request->hasFile('banner')) {
            if ($store->banner_url) {
                $oldPath = str_replace(asset('storage/'), '', $store->banner_url);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('banner')->store('stores/banners', 'public');
            $store->banner_url = asset('storage/' . $path);
        }

        $store->save();

        return response()->json([
            'success' => true,
            'message' => 'Imagens atualizadas com sucesso.',
            'data' => $store
        ]);
    }

    /**
     * Subscribe the store owner's store to a plan (simulated checkout).
     */
    public function subscribeToPlan(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.',
            ], 404);
        }

        $data = $request->validate([
            'plan_id'          => 'required|integer|exists:plans,id',
            'payment_method'   => 'required|in:pix_simulado,cartao_simulado',
        ]);

        $plan = Plan::where('id', $data['plan_id'])
            ->where('status', 'active')
            ->first();

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'O plano selecionado não está disponível.',
            ], 422);
        }

        $store->update(['plan_id' => $plan->id]);

        return response()->json([
            'success' => true,
            'message' => "Plano \"{$plan->name}\" ativado com sucesso via " . ($data['payment_method'] === 'pix_simulado' ? 'PIX simulado' : 'Cartão simulado') . '.',
            'data'    => $store->fresh()->load('plan'),
        ]);
    }
}