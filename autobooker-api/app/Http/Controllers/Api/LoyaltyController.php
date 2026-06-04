<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyPoint;
use App\Models\LoyaltyReward;
use App\Models\LoyaltyRedemption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LoyaltyController extends Controller
{
    public function index(Request $request)
    {
        $points = LoyaltyPoint::with('store')
            ->where('client_id', $request->user()->id)
            ->get();

        $claims = LoyaltyRedemption::with(['store', 'reward'])
            ->where('client_id', $request->user()->id)
            ->orderByDesc('id')
            ->get()
            ->map(function ($claim) {
                return [
                    'id' => $claim->id,
                    'storeId' => $claim->store_id,
                    'storeName' => optional($claim->store)->name ?? 'Loja',
                    'rewardName' => optional($claim->reward)->name ?? 'Recompensa',
                    'pointsSpent' => $claim->points_spent,
                    'voucher' => $claim->voucher_code,
                    'date' => $claim->created_at?->format('d/m/Y'),
                    'status' => $claim->status,
                ];
            });

        return response()->json([
            'totalPoints' => $points->sum('points'),

            'stores' => $points->map(function ($p) {
                $rewards = LoyaltyReward::where('store_id', $p->store_id)
                    ->where('active', true)
                    ->orderBy('points_cost')
                    ->get()
                    ->map(function ($reward) {
                        return [
                            'id' => $reward->id,
                            'name' => $reward->name,
                            'points_cost' => $reward->points_cost,
                        ];
                    });

                return [
                    'storeId' => $p->store_id,
                    'storeName' => optional($p->store)->name ?? 'Loja',
                    'points' => $p->points,
                    'rewards' => $rewards,
                ];
            }),

            'claims' => $claims,
        ]);
    }

    public function redeem(Request $request)
    {
        $data = $request->validate([
            'reward_id' => 'required|exists:loyalty_rewards,id',
        ]);

        $user = $request->user();

        $reward = LoyaltyReward::where('id', $data['reward_id'])
            ->where('active', true)
            ->first();

        if (!$reward) {
            return response()->json([
                'success' => false,
                'message' => 'Recompensa não encontrada ou inativa.'
            ], 404);
        }

        return DB::transaction(function () use ($user, $reward) {
            $loyalty = LoyaltyPoint::where('client_id', $user->id)
                ->where('store_id', $reward->store_id)
                ->lockForUpdate()
                ->first();

            if (!$loyalty || $loyalty->points < $reward->points_cost) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pontos insuficientes para resgatar esta recompensa.'
                ], 422);
            }

            $loyalty->decrement('points', $reward->points_cost);

            $voucher = strtoupper(
                'AUT-' . now()->format('Y') . '-' . Str::random(8)
            );

            $redemption = LoyaltyRedemption::create([
                'client_id' => $user->id,
                'store_id' => $reward->store_id,
                'reward_id' => $reward->id,
                'points_spent' => $reward->points_cost,
                'voucher_code' => $voucher,
                'status' => 'pending',
            ]);

            $redemption->load(['store', 'reward']);

            return response()->json([
                'success' => true,
                'message' => 'Recompensa resgatada com sucesso.',
                'data' => [
                    'id' => $redemption->id,
                    'storeId' => $redemption->store_id,
                    'storeName' => optional($redemption->store)->name ?? 'Loja',
                    'rewardName' => optional($redemption->reward)->name ?? 'Recompensa',
                    'pointsSpent' => $redemption->points_spent,
                    'voucher' => $redemption->voucher_code,
                    'date' => $redemption->created_at?->format('d/m/Y'),
                    'status' => $redemption->status,
                ],
            ], 201);
        });
    }
}