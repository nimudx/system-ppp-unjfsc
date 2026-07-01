<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountActivation extends Model
{
    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at'    => 'datetime',
        ];
    }

    /**
     * Verifica si el token aún es válido (no expirado y no usado).
     */
    public function isValid(): bool
    {
        return is_null($this->used_at)
            && $this->expires_at->isFuture();
    }

    /**
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
