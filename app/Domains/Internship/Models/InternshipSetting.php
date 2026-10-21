<?php

namespace App\Domains\Internship\Models;

use App\Domains\Academic\Models\Section;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternshipSetting extends Model
{
    protected $fillable = [
        'section_id',
        'workflow_schema',
        'is_active',
        'status',
    ];

    protected $casts = [
        'workflow_schema' => 'array',
        'is_active' => 'boolean',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }
}
