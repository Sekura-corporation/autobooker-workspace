<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPlanController extends Controller
{
    /**
     * List all plans.
     */
    public function index(): JsonResponse
    {
        $plans = Plan::orderBy('price')->get();

        return response()->json([
            'success' => true,
            'data'    => $plans,
        ]);
    }

    /**
     * Show a single plan.
     */
    public function show(Plan $plan): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $plan,
        ]);
    }

    /**
     * Create a new plan.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                => 'required|string|max:100',
            'price'               => 'required|numeric|min:0',
            'billing_cycle'       => 'required|in:monthly,yearly',
            'setup_fee'           => 'nullable|numeric|min:0',
            'platform_commission' => 'nullable|numeric|min:0|max:100',
            'commission_type'     => 'nullable|in:percentage,fixed',
            'store_limit'         => 'nullable|integer|min:1',
            'appointment_limit'   => 'nullable|string|max:50',
            'support_level'       => 'nullable|string|max:100',
            'description'         => 'nullable|string|max:2000',
            'features'            => 'nullable|array',
            'features.*'          => 'string',
            'revenue_model'       => 'nullable|array',
            'status'              => 'required|in:active,paused,pending',
            'is_featured'         => 'boolean',
        ]);

        $plan = Plan::create($data);

        return response()->json([
            'success' => true,
            'message' => "Plano \"{$plan->name}\" criado com sucesso.",
            'data'    => $plan,
        ], 201);
    }

    /**
     * Update an existing plan.
     */
    public function update(Request $request, Plan $plan): JsonResponse
    {
        $data = $request->validate([
            'name'                => 'sometimes|required|string|max:100',
            'price'               => 'sometimes|required|numeric|min:0',
            'billing_cycle'       => 'sometimes|required|in:monthly,yearly',
            'setup_fee'           => 'nullable|numeric|min:0',
            'platform_commission' => 'nullable|numeric|min:0|max:100',
            'commission_type'     => 'nullable|in:percentage,fixed',
            'store_limit'         => 'nullable|integer|min:1',
            'appointment_limit'   => 'nullable|string|max:50',
            'support_level'       => 'nullable|string|max:100',
            'description'         => 'nullable|string|max:2000',
            'features'            => 'nullable|array',
            'features.*'          => 'string',
            'revenue_model'       => 'nullable|array',
            'status'              => 'sometimes|required|in:active,paused,pending',
            'is_featured'         => 'boolean',
        ]);

        $plan->update($data);

        return response()->json([
            'success' => true,
            'message' => "Plano \"{$plan->name}\" atualizado com sucesso.",
            'data'    => $plan->fresh(),
        ]);
    }

    /**
     * Delete a plan.
     */
    public function destroy(Plan $plan): JsonResponse
    {
        // Prevent deleting a plan that has stores actively using it
        $storeCount = \App\Models\Store::where('plan_id', $plan->id)->count();

        if ($storeCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Este plano está vinculado a {$storeCount} loja(s) e não pode ser excluído. Migre as lojas primeiro.",
            ], 422);
        }

        $name = $plan->name;
        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => "Plano \"{$name}\" excluído com sucesso.",
        ]);
    }
}
