<?php

namespace App\Domains\Company\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyInvitation extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['token_hash'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'consumed_at' => 'datetime', 'revoked_at' => 'datetime'];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function validationRequest(): BelongsTo
    {
        return $this->belongsTo(CompanyValidationRequest::class, 'company_validation_request_id');
    }
}
