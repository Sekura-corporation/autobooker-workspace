<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordRecoveryMail;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('autobooker_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userJson($user),
        ]);
    }

    public function registerStoreOwner(Request $request)
    {
        $validated = $request->validate(
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8'],
                'phone' => ['nullable', 'string', 'max:30'],
                'store' => ['required', 'array'],
                'store.name' => ['required', 'string', 'max:255'],
                'store.cnpj' => ['nullable', 'string', 'max:20', 'unique:stores,cnpj'],
                'store.phone' => ['nullable', 'string', 'max:30'],
                'store.email' => ['nullable', 'email', 'max:255'],
                'store.address' => ['nullable', 'string', 'max:255'],
                'store.city' => ['nullable', 'string', 'max:120'],
                'store.state' => ['nullable', 'string', 'max:50'],
                'store.zip_code' => ['nullable', 'string', 'max:20'],
                'store.description' => ['nullable', 'string'],
                'store.opening_hours' => ['nullable', 'string', 'max:255'],
            ],
            [
                'email.unique' => 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.',
                'store.name.required' => 'O nome da loja é obrigatório.',
                'store.cnpj.unique' => 'Já existe uma loja cadastrada com este CNPJ.',
            ]
        );

        $storeInput = $validated['store'];

        return DB::transaction(function () use ($validated, $storeInput) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'role' => 'store_owner',
            ]);

            $store = Store::create([
                'owner_id' => $user->id,
                'name' => $storeInput['name'],
                'cnpj' => $storeInput['cnpj'] ?? null,
                'phone' => $storeInput['phone'] ?? null,
                'email' => $storeInput['email'] ?? null,
                'address' => $storeInput['address'] ?? null,
                'city' => $storeInput['city'] ?? null,
                'state' => $storeInput['state'] ?? null,
                'zip_code' => $storeInput['zip_code'] ?? null,
                'description' => $storeInput['description'] ?? null,
                'opening_hours' => $storeInput['opening_hours'] ?? null,
            ]);

            $token = $user->createToken('autobooker_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Cadastro do lojista e da loja concluído com sucesso.',
                'token' => $token,
                'user' => $this->userJson($user->fresh()),
                'store' => $this->storeJson($store->fresh()),
            ], 201);
        });
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        $token = $user->createToken('autobooker_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userJson($user),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($this->userJson($request->user()));
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Logout realizado com sucesso'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['E-mail não encontrado em nossa base de dados.'],
            ]);
        }

        $code = rand(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $code, // usando token column para os 6 dígitos
                'created_at' => Carbon::now()
            ]
        );

        Mail::to($user->email)->send(new PasswordRecoveryMail($code));

        return response()->json(['message' => 'Código de recuperação enviado.'], 200);
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|numeric|digits:6',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->code)
            ->first();

        if (!$record || Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            return response()->json(['message' => 'Código inválido ou expirado.'], 400);
        }

        return response()->json(['message' => 'Código válido.'], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|numeric|digits:6',
            'password' => 'required|min:6|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->code)
            ->first();

        if (!$record || Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            return response()->json(['message' => 'Código inválido ou expirado.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Senha alterada com sucesso.'], 200);
    }

    private function userJson(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'client',
            'createdAt' => $user->created_at ? $user->created_at->toISOString() : null,
            'updatedAt' => $user->updated_at ? $user->updated_at->toISOString() : null,
        ];
    }

    private function storeJson(Store $store): array
    {
        return [
            'id' => (string) $store->id,
            'ownerId' => (string) $store->owner_id,
            'name' => $store->name,
            'cnpj' => $store->cnpj,
            'phone' => $store->phone,
            'email' => $store->email,
            'address' => $store->address,
            'city' => $store->city,
            'state' => $store->state,
            'zipCode' => $store->zip_code,
            'description' => $store->description,
            'openingHours' => $store->opening_hours,
            'planId' => $store->plan_id !== null ? (string) $store->plan_id : null,
            'status' => $store->status,
            'createdAt' => $store->created_at ? $store->created_at->toISOString() : null,
            'updatedAt' => $store->updated_at ? $store->updated_at->toISOString() : null,
        ];
    }
}
