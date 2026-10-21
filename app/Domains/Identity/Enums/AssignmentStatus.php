<?php

namespace App\Domains\Identity\Enums;

enum AssignmentStatus: int
{
    case INACTIVE = 0;
    case ACTIVE = 1;
}
