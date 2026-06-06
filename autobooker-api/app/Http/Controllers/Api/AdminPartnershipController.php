<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partnership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPartnershipController extends Controller
{
    /**
     * List all partnerships.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Partnership::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('store_name', 'ilike', "%{$search}%")
                  ->orWhere('partner_name', 'ilike', "%{$search}%")
                  ->orWhere('contact_email', 'ilike', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $partnerships = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $partnerships,
        ]);
    }

    /**
     * Show a single partnership.
     */
    public function show(Partnership $partnership): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $partnership,
        ]);
    }

    /**
     * Create a new partnership.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'store_name'      => 'required|string|max:255',
            'partner_name'    => 'required|string|max:255',
            'partner_type'    => 'required|string|max:100',
            'region'          => 'nullable|string|max:200',
            'contact_name'    => 'required|string|max:255',
            'contact_email'   => 'required|email|max:255',
            'contact_phone'   => 'nullable|string|max:30',
            'discount_percent'=> 'nullable|integer|min:0|max:100',
            'status'          => 'required|in:active,pending,paused,cancelled',
            'start_date'      => 'nullable|date',
            'benefits'        => 'nullable|array',
            'benefits.*'      => 'string',
            'notes'           => 'nullable|string|max:2000',
        ]);

        $partnership = Partnership::create($data);

        return response()->json([
            'success' => true,
            'message' => "Parceria com \"{$partnership->partner_name}\" criada com sucesso.",
            'data'    => $partnership,
        ], 201);
    }

    /**
     * Update an existing partnership.
     */
    public function update(Request $request, Partnership $partnership): JsonResponse
    {
        $data = $request->validate([
            'store_name'      => 'sometimes|required|string|max:255',
            'partner_name'    => 'sometimes|required|string|max:255',
            'partner_type'    => 'sometimes|required|string|max:100',
            'region'          => 'nullable|string|max:200',
            'contact_name'    => 'sometimes|required|string|max:255',
            'contact_email'   => 'sometimes|required|email|max:255',
            'contact_phone'   => 'nullable|string|max:30',
            'discount_percent'=> 'nullable|integer|min:0|max:100',
            'status'          => 'sometimes|required|in:active,pending,paused,cancelled',
            'start_date'      => 'nullable|date',
            'benefits'        => 'nullable|array',
            'benefits.*'      => 'string',
            'notes'           => 'nullable|string|max:2000',
        ]);

        $partnership->update($data);

        return response()->json([
            'success' => true,
            'message' => "Parceria com \"{$partnership->partner_name}\" atualizada.",
            'data'    => $partnership->fresh(),
        ]);
    }

    /**
     * Delete a partnership.
     */
    public function destroy(Partnership $partnership): JsonResponse
    {
        $name = $partnership->partner_name;
        $partnership->delete();

        return response()->json([
            'success' => true,
            'message' => "Parceria com \"{$name}\" excluída com sucesso.",
        ]);
    }
}
