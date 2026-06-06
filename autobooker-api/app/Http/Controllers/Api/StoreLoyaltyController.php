<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyReward;
use App\Models\LoyaltySetting;
use Illuminate\Http\Request;
use App\Models\Store;

class StoreLoyaltyController extends Controller
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

        $setting = LoyaltySetting::firstOrCreate(
            ['store_id' => $store->id],
            [
                'spent_value' => 1,
                'points_value' => 1,
            ]
        );

        $rewards = LoyaltyReward::where('store_id', $store->id)
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'rule' => [
                    'spent_value' => $setting->spent_value,
                    'points_value' => $setting->points_value,
                ],
                'rewards' => $rewards,
            ]
        ]);
    }

    public function updateRule(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $data = $request->validate([
            'spent_value' => 'required|integer|min:1',
            'points_value' => 'required|integer|min:1',
        ]);

        $setting = LoyaltySetting::updateOrCreate(
            ['store_id' => $store->id],
            [
                'spent_value' => $data['spent_value'],
                'points_value' => $data['points_value'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Regra de conversão atualizada com sucesso.',
            'data' => $setting,
        ]);
    }

    public function storeReward(Request $request)
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
            'points_cost' => 'required|integer|min:1',
        ]);

        $reward = LoyaltyReward::create([
            'store_id' => $store->id,
            'name' => $data['name'],
            'points_cost' => $data['points_cost'],
            'active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Recompensa criada com sucesso.',
            'data' => $reward,
        ], 201);
    }

    public function updateReward(Request $request, LoyaltyReward $reward)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store || $reward->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'points_cost' => 'required|integer|min:1',
        ]);

        $reward->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Recompensa atualizada com sucesso.',
            'data' => $reward,
        ]);
    }

    public function toggleReward(Request $request, LoyaltyReward $reward)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store || $reward->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado.'
            ], 403);
        }

        $reward->update([
            'active' => !$reward->active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status da recompensa atualizado.',
            'data' => $reward,
        ]);
    }

    public function publicShow($storeId)
    {
        $store = Store::find($storeId);

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $setting = LoyaltySetting::firstOrCreate(
            ['store_id' => $store->id],
            [
                'spent_value' => 1,
                'points_value' => 1,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'rule' => [
                    'spent_value' => $setting->spent_value,
                    'points_value' => $setting->points_value,
                ],
            ],
        ]);
    }
}