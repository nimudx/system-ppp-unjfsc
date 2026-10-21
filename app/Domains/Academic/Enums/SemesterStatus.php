<?php

namespace App\Domains\Academic\Enums;

enum SemesterStatus: int
{
    case INACTIVE = 0;
    case ACTIVE = 1;
}
