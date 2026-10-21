<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentType extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'status',
    ];

    /**
     * Get all documents of this type.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'document_type_roles')
            ->wherePivot('status', 1);
    }
}
