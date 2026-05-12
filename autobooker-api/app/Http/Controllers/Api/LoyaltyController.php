<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LoyaltyPoint;

class LoyaltyController extends Controller
{
    public function index(Request $request)
    {
        $points = LoyaltyPoint::where('client_id', $request->user()->id)->get();

        return response()->json([
            'totalPoints' => $points->sum('points'),
            'stores' => $points->map(fn($p) => [
            'storeId' => $p->store_id,
            'storeName' => optional($p->store)->name ?? 'Loja',
            'points' => $p->points,
            ])
        ]);
    }   
}
