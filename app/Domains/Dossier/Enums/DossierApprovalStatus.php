<?php

namespace App\Domains\Dossier\Enums;

enum DossierApprovalStatus: int
{
    case REJECTED = 0;
    case COMPLETED = 1;
    case PENDING = 2;
}
