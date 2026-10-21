<?php

namespace App\Domains\Company\Models;

use App\Domains\Identity\Models\User;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $table = 'staffs';

    protected $fillable = [
        'company_id',
        'user_id',
        'position_id',
        'email',
        'phone',
        'status',
        'is_select',
    ];

    protected $casts = [
        'is_select' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }
}
