<?php

namespace App\Domains\Company\Models;

use App\Domains\Internship\Models\Placement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $fillable = [
        'name',
        'ruc',
        'razon',
        'address',
        'phone',
        'email',
        'website',
        'path_photo',
        'path_banner',
        'status',
        'account_user_id', 'representative_name', 'representative_phone', 'activated_at',
        'approved_by_assignment_id', 'approved_at',
    ];

    protected function casts(): array
    {
        return ['activated_at' => 'datetime', 'approved_at' => 'datetime'];
    }

    /**
     * Get the bosses associated with the company.
     */
    public function bosses(): HasMany
    {
        return $this->hasMany(Boss::class);
    }

    public function placements(): HasMany
    {
        return $this->hasMany(Placement::class);
    }

    public function area(): HasMany
    {
        return $this->hasMany(Area::class);
    }
}
