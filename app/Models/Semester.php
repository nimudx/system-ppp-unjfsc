<?php

namespace App\Models;

use App\Enums\Academic\SemesterStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'cycle',
        'status',
    ];

    protected $casts = [
        'status' => SemesterStatus::class,
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public static function getActiveSemester(): ?Semester
    {
        return self::query()->where('status', 1)->first();
    }
}
