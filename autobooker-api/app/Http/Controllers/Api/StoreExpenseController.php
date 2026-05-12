<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class StoreExpenseController extends Controller
{
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
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'nullable|string|max:100',
            'expense_date' => 'nullable|date',
        ]);

        $expense = Expense::create([
            'store_id' => $store->id,
            'description' => $data['description'],
            'amount' => $data['amount'],
            'category' => $data['category'] ?? null,
            'expense_date' => $data['expense_date'] ?? now()->toDateString(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Despesa registrada com sucesso.',
            'data' => $expense
        ], 201);
    }
}