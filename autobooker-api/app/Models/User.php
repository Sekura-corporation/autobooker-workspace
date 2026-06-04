<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'avatar',
        'status'
    ];

    protected $hidden = [
        'password',
        'remember_token'
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function storesOwned(): HasMany
    {
        return $this->hasMany(Store::class, 'owner_id');
    }

    public function isStoreOwner(): bool
    {
        return $this->role === 'store_owner';
    }

    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function toApiArray(): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->resolveAvatarUrl(),
            'role' => $this->role ?? 'client',
            'createdAt' => $this->created_at ? $this->created_at->toISOString() : null,
            'updatedAt' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }

    public function resolveAvatarUrl(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        if (
            !str_starts_with($this->avatar, 'http://')
            && !str_starts_with($this->avatar, 'https://')
            && !Storage::disk('public')->exists($this->avatar)
        ) {
            $this->forceFill(['avatar' => null])->saveQuietly();

            return null;
        }

        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
            return $this->avatar;
        }

        return Storage::disk('public')->url($this->avatar);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'client_id');
    }
}

