<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_assignment_id',
        'internship_group_id',
        'status',
    ];

    /**
     * Get the teacher assignment associated with the internship group.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'student_assignment_id');
    }

    /**
     * Get the internship group associated with the student group.
     */
    public function internshipGroup(): BelongsTo
    {
        return $this->belongsTo(InternshipGroup::class, 'internship_group_id');
    }
}
