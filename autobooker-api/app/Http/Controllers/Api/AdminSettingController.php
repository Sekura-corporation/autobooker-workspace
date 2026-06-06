<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    /**
     * Return all system settings as a key-value object.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'data'    => $settings,
        ]);
    }

    /**
     * Update settings in bulk.
     * Expects: { "key1": "value1", "key2": "value2", ... }
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            '*' => 'nullable|string|max:2000',
        ]);

        // Prevent updating unexpected or dangerous keys
        $allowedKeys = [
            'tax_rate',
            'platform_commission_default',
            'maintenance_mode',
            'support_email',
            'support_phone',
            'max_stores_free_trial',
            'free_trial_days',
            'gateway_mode',
            'default_plan_id',
            'brand_name',
            'contact_cep',
        ];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedKeys)) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }
        }

        // Return the full updated settings list
        $settings = Setting::all()->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'message' => 'Configurações atualizadas com sucesso.',
            'data'    => $settings,
        ]);
    }

    /**
     * Get a single setting by key.
     */
    public function show(string $key): JsonResponse
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => "Configuração \"{$key}\" não encontrada.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'key'   => $setting->key,
                'value' => $setting->value,
            ],
        ]);
    }
}
