<?php

namespace App\Domains\Company\Models;

use App\Domains\Company\Enums\CompanyRequestState;
use App\Domains\Identity\Models\Assignment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyValidationRequest extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['ruc_document_path'];

    protected function casts(): array
    {
        return ['state' => CompanyRequestState::class, 'company_data' => 'array', 'is_new_company' => 'boolean', 'declared_at' => 'datetime', 'reviewed_at' => 'datetime', 'company_decided_at' => 'datetime', 'last_invited_at' => 'datetime'];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(CompanyValidationEvent::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(CompanyInvitation::class);
    }
}
