<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileAvatarController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $user = $request->user();
        $file = $request->file('avatar');
        $extension = $file->getClientOriginalExtension();
        $filename = $user->id . '_' . time() . '.' . $extension;
        $path = 'avatars/' . $filename;

        Storage::disk('public')->makeDirectory('avatars');

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $stored = $file->storeAs('avatars', $filename, 'public');

        if (!$stored || !Storage::disk('public')->exists($path)) {
            return response()->json([
                'message' => 'Não foi possível salvar a imagem. Tente novamente.',
            ], 500);
        }

        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Foto de perfil atualizada com sucesso.',
            'user' => $user->fresh()->toApiArray(),
        ]);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return response()->json([
            'message' => 'Foto de perfil removida com sucesso.',
            'user' => $user->fresh()->toApiArray(),
        ]);
    }
}
