<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockItem;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreStockController extends Controller
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

        $items = StockItem::where('store_id', $store->id)
            ->orderBy('name')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'type' => $item->type,
                    'quantity' => $item->quantity,
                    'min_quantity' => $item->min_quantity,
                    'sale_price' => $item->sale_price,
                    'status' => $item->quantity <= $item->min_quantity ? 'repor' : 'ok',
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function storeItem(Request $request)
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
            'type' => 'required|in:supply,product',
            'quantity' => 'required|integer|min:0',
            'min_quantity' => 'required|integer|min:0',
            'sale_price' => 'nullable|numeric|min:0',
        ]);

        $item = StockItem::create([
            'store_id' => $store->id,
            'name' => $data['name'],
            'type' => $data['type'],
            'quantity' => $data['quantity'],
            'min_quantity' => $data['min_quantity'],
            'sale_price' => $data['sale_price'] ?? null,
        ]);

        if ($item->quantity > 0) {
            StockMovement::create([
                'stock_item_id' => $item->id,
                'type' => 'entry',
                'quantity' => $item->quantity,
                'reason' => 'Estoque inicial',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Produto cadastrado com sucesso.',
            'data' => $item,
        ], 201);
    }

    public function movement(Request $request, StockItem $item)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store || $item->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validate([
            'type' => 'required|in:entry,exit',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($item, $data) {
            if ($data['type'] === 'exit' && $item->quantity < $data['quantity']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estoque insuficiente.'
                ], 422);
            }

            if ($data['type'] === 'entry') {
                $item->increment('quantity', $data['quantity']);
            } else {
                $item->decrement('quantity', $data['quantity']);
            }

            $movement = StockMovement::create([
                'stock_item_id' => $item->id,
                'type' => $data['type'],
                'quantity' => $data['quantity'],
                'reason' => $data['reason'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Movimentação registrada com sucesso.',
                'data' => $movement,
            ]);
        });
    }

    public function history(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $movements = StockMovement::query()
            ->join('stock_items', 'stock_movements.stock_item_id', '=', 'stock_items.id')
            ->where('stock_items.store_id', $store->id)
            ->select(
                'stock_movements.id',
                'stock_items.name as item_name',
                'stock_movements.type',
                'stock_movements.quantity',
                'stock_movements.reason',
                'stock_movements.created_at'
            )
            ->orderByDesc('stock_movements.id')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $movements,
        ]);
    }

    public function destroy(Request $request, StockItem $item)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store || $item->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado.'
            ], 403);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item excluído com sucesso.'
        ]);
    }
}