<?php

namespace App\Domains\Identity\Enums;

enum AssignmentApprovalStatus: int
{
    case REJECTED = 0;
    case APPROVED = 1;
    case PENDING = 2;
}
