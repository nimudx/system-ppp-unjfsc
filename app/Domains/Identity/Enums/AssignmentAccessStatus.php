<?php

namespace App\Domains\Identity\Enums;

enum AssignmentAccessStatus: int
{
    case BLOCKED = 0;
    case FULL = 1;
    case LIMITED = 2;
    case READ_ONLY = 3;
}
