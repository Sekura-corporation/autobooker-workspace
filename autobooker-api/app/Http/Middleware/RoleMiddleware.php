<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle($request, Closure $next, ...$roles)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Não autenticado',
            ], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success'=>false,
                'message'=>'Acesso negado'
        ],403);
        }

        return $next($request);
    }
}
    