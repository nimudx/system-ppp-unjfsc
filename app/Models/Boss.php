<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Boss extends Model
{
    protected $fillable = [
        'company_id',
        'names',
        'dni',
        'position',
        'area',
        'email',
        'phone',
        'status',
    ];

    /**
     * Get the company that owns the boss.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
