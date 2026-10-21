<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'person_id',
        'name',
        'email',
        'password',
        'type_user_id',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Alias for authenticable to maintain compatibility with 'person' naming.
     */
    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function company(): MorphTo
    {
        return $this->morphTo('authenticable');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function activeAssignment(): HasOne
    {
        return $this->hasOne(Assignment::class)->latestOfMany();
    }

    public function typeUser(): BelongsTo
    {
        return $this->belongsTo(TypeUser::class);
    }

    public function staffs(): HasMany
    {
        return $this->hasMany(Staff::class, 'user_id', 'id');
    }

    public function notificationRecipients(): HasMany
    {
        return $this->hasMany(NotificationRecipient::class);
    }
}
