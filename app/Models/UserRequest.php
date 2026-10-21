<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserRequest extends Model
{
    protected $table = 'user_requests';

    protected $fillable = [
        'senderable_id',
        'senderable_type',

        'requestable_id',
        'requestable_type',

        'reviewed_by',

        'type',
        'reason',
        'justification',

        'payload',

        'approval_status',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payload' => 'array',
    ];

    /**
     * Get the senderable that owns the request.
     */
    public function senderable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the requestable that owns the request.
     */
    public function requestable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user that reviewed the request.
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'reviewed_by');
    }
}
