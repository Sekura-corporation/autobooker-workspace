<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\WelcomeUserMail;

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
     * Store a newly created user and send welcome email.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role'  => ['required', 'string', 'in:admin,store_owner,client'],
        ]);

        $generatedPassword = Str::random(10);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'phone'    => $validated['phone'] ?? null,
            'role'     => $validated['role'],
            'password' => Hash::make($generatedPassword),
            'status'   => true, // Active by default
        ]);

        try {
            Mail::to($user->email)->send(new WelcomeUserMail($user, $generatedPassword));
        } catch (\Exception $e) {
            // Se o e-mail falhar, logar o erro mas continuar o fluxo (o usuário foi criado)
            \Illuminate\Support\Facades\Log::error('Erro ao enviar e-mail de boas-vindas: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Usuário cadastrado com sucesso! As credenciais foram enviadas por e-mail.',
            'data'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'created_at' => $user->created_at->format('Y-m-d'),
            ]
        ], 201);
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
