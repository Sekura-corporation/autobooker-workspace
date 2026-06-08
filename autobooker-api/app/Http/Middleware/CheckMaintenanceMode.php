<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Pega a config do banco, com cache simples para não onerar o BD a cada requisição
        $maintenanceMode = Cache::remember('maintenance_mode', 60, function () {
            return Setting::where('key', 'maintenance_mode')->value('value') ?? 'off';
        });

        if ($maintenanceMode === 'off') {
            return $next($request);
        }

        // Se a rota for de login, deixamos passar para permitir autenticação
        if ($request->is('api/auth/login')) {
            return $next($request);
        }

        // O middleware roda antes do auth:sanctum na rota, então $request->user() costuma ser nulo aqui.
        // Vamos forçar a leitura do token do Sanctum:
        $user = $request->user();
        if (!$user && $token = $request->bearerToken()) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken && $accessToken->tokenable) {
                $user = $accessToken->tokenable;
            }
        }

        // O Admin NUNCA é bloqueado pela manutenção
        if ($user && $user->role === 'admin') {
            return $next($request);
        }

        // Se o modo for restricted ou full, e não for admin, bloqueia o acesso
        if ($maintenanceMode === 'restricted' || $maintenanceMode === 'full') {
            return response()->json([
                'success' => false,
                'message' => 'O sistema encontra-se em manutenção temporária. Voltaremos em breve!',
                'maintenance' => true,
            ], 503);
        }

        return $next($request);
    }
}
