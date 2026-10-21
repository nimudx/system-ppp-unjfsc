<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'faculty_id',
        'status',
    ];

    /**
     * @@return BelongsTo
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }
}
