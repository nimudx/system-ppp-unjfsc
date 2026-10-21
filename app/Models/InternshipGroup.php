<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class InternshipGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'teacher_assignment_id',
        'supervisor_assignment_id',
        'section_id',
        'module_id',
        'status',
    ];

    /**
     * Get the teacher assignment associated with the internship group.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'teacher_assignment_id');
    }

    /**
     * Get the supervisor assignment associated with the internship group.
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'supervisor_assignment_id');
    }

    /**
     * Get the section associated with the internship group.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get the module associated with the internship group.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * Get the student groups associated with the internship group.
     */
    public function studentGroups(): HasMany
    {
        return $this->hasMany(StudentGroup::class, 'internship_group_id');
    }

    /**
     * Get the students associated with the internship group.
     */
    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(
            Assignment::class,
            StudentGroup::class,
            'internship_group_id',      // FK in StudentGroup
            'id',                       // PK in Assignment (Your own ID)
            'id',                       // Local key in InternshipGroup
            'student_assignment_id',     // Local Key in StudentGroup
        );
    }
}
