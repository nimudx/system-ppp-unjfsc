<?php

namespace App\Models;

use App\Enums\Assignment\AssignmentAccessStatus;
use App\Enums\Assignment\AssignmentApprovalStatus;
use App\Enums\Assignment\AssignmentReviewStatus;
use App\Enums\Assignment\AssignmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role_id',
        'semester_id',
        'section_id',
        'access_status',
        'approval_status',
        'review_status',
        'status',
        'is_select',
    ];

    protected $casts = [
        'access_status' => AssignmentAccessStatus::class,
        'approval_status' => AssignmentApprovalStatus::class,
        'review_status' => AssignmentReviewStatus::class,
        'status' => AssignmentStatus::class,
        'is_select' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function dossiers(): HasMany
    {
        return $this->hasMany(Dossier::class, 'assignment_id');
    }

    public function teacherGroups(): HasMany
    {
        return $this->hasMany(InternshipGroup::class, 'teacher_assignment_id');
    }

    public function supervisorGroups(): HasMany
    {
        return $this->hasMany(InternshipGroup::class, 'supervisor_assignment_id');
    }

    public function studentGroups(): HasMany
    {
        return $this->hasMany(StudentGroup::class, 'student_assignment_id');
    }

    public function internships(): HasMany
    {
        return $this->hasMany(Internship::class, 'assignment_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'uploaded_by');
    }

    public function placement(): HasOne
    {
        return $this->hasOne(Placement::class, 'assignment_id');
    }

    public function internship(): HasOne
    {
        return $this->hasOne(Internship::class, 'assignment_id');
    }

    /**
     * Helper methods for access control
     */
    public function isBlocked(): bool
    {
        return $this->status === AssignmentStatus::INACTIVE
            || $this->access_status === AssignmentAccessStatus::BLOCKED;
    }

    public function isReadOnly(): bool
    {
        return $this->access_status === AssignmentAccessStatus::READ_ONLY;
    }

    public function isLimited(): bool
    {
        return $this->access_status === AssignmentAccessStatus::LIMITED;
    }

    public function isApproved(): bool
    {
        return $this->approval_status === AssignmentApprovalStatus::APPROVED;
    }

    /**
     * Get the requests associated with the assignment.
     */
    public function requests(): MorphMany
    {
        return $this->morphMany(UserRequest::class, 'requestable');
    }
}
