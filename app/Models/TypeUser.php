<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeUser extends Model
{
    /**
     * @var string
     */
    protected $table = 'type_users';

    /**
     * @var string[]
     */
    protected $fillable = [
        'name',
        'status',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
