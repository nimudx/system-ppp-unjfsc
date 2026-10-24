<?php

namespace App\Domains\Company\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyValidationEvent extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['snapshot' => 'array'];
    }
}
