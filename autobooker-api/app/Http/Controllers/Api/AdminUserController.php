<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all users with pagination and optional search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->select('id', 'name', 'email', 'phone', 'role', 'status', 'created_at');

        // Busca por nome ou email
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        // Filtro de role: 'admin' | 'store_owner' | 'client'
        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        $users->getCollection()->transform(function ($user) {
            return [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'blocked'    => !$user->status,
                'created_at' => $user->created_at->format('Y-m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $users,
        ]);
    }

    /**
     * Show a single user's details.
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'created_at' => $user->created_at->format('Y-m-d'),
                'token_count'=> $user->tokens()->count(),
                'store'      => $user->storesOwned()->select('id', 'name', 'status')->first(),
            ],
        ]);
    }

    /**
     * Toggle block status for a user.
     * Blocking revokes all active Sanctum tokens.
     * Unblocking just returns a message (the user will re-login to get tokens).
     */
    public function toggleBlock(User $user, Request $request): JsonResponse
    {
        // Admins cannot block other admins
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível bloquear um administrador.',
            ], 403);
        }

        // Toggle boolean status (false means blocked)
        $user->status = !$user->status;
        $user->save();

        if (!$user->status) {
            // Block: revoke all tokens
            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => "Usuário \"{$user->name}\" bloqueado. Todos os acessos foram revogados.",
                'blocked' => true,
            ]);
        }

        // Unblock: inform success
        return response()->json([
            'success' => true,
            'message' => "Usuário \"{$user->name}\" desbloqueado com sucesso.",
            'blocked' => false,
        ]);
    }
}
