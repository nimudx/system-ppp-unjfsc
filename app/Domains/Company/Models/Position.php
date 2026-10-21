<?php

namespace App\Domains\Company\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $fillable = ['name', 'status'];
}
