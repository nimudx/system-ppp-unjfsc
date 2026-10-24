<?php

namespace App\Domains\Company\Enums;

enum CompanyRequestState: string
{
    case PENDING_REVIEW = 'pending_review';
    case OBSERVED = 'observed';
    case REJECTED = 'rejected';
    case AWAITING_COMPANY = 'awaiting_company';
    case ACCEPTED = 'accepted';
    case DECLINED = 'declined';
}
