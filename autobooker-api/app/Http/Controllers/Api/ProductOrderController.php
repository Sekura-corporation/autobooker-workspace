<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductOrder;
use App\Models\ProductOrderItem;
use App\Models\StockItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductOrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:stock_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'total_price' => 'required|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($request, $data) {
            $order = ProductOrder::create([
                'client_id' => $request->user()->id,
                'store_id' => $data['store_id'],
                'total_price' => $data['total_price'],
                'status' => 'completed',
            ]);

            foreach ($data['items'] as $item) {
                $product = StockItem::where('id', $item['product_id'])
                    ->where('store_id', $data['store_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($product->quantity < $item['quantity']) {
                    abort(422, "Estoque insuficiente para {$product->name}.");
                }

                ProductOrderItem::create([
                    'product_order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->sale_price,
                    'total_price' => $product->sale_price * $item['quantity'],
                ]);

                $product->decrement('quantity', $item['quantity']);
            }

            return $order->load('items');
        });

        return response()->json([
            'success' => true,
            'message' => 'Pedido criado com sucesso.',
            'data' => $order,
        ], 201);
    }
    
    public function index(Request $request)
    {
        $orders = ProductOrder::with(['store', 'items.product'])
            ->where('client_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }
}
