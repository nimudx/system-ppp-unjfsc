<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status',
    ];

    public function schools(): HasMany
    {
        return $this->hasMany(School::class);
    }

    public function scopeForAssignmentContext(Builder $query, $assignment, $semesterId, bool $forceStrict = false): Builder
    {
        if (in_array($assignment->role_id, [4, 5])) {
            return $query;
        }

        if ($forceStrict && $assignment->role_id === 3 && $assignment->section_id) {
            return $query->where('id', $assignment->section->faculty_id)
                ->with([
                    'schools' => function ($q) use ($assignment, $semesterId) {
                        $q->where('id', $assignment->section->school_id)
                            ->with([
                                'sections' => function ($q) use ($assignment, $semesterId) {
                                    $q->where('id', $assignment->section_id)
                                        ->where('semester_id', $semesterId);
                                },
                            ]);
                    },
                ]);
        }

        if ($assignment->role_id === 2 && $assignment->section) {
            $query->where('id', $assignment->section->school->faculty_id);
        }

        return $query->with([
            'schools.sections' => function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId);
            },
        ])->where('status', 1);
    }
}
