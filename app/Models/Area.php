<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Area extends Model
{
    protected $fillable = [
        'name',
        'description',
        'company_id',
        'status',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function placements()
    {
        return $this->hasMany(Placement::class);
    }
}
