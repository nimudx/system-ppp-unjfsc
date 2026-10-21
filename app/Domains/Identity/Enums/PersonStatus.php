<?php

namespace App\Domains\Identity\Enums;

enum PersonStatus: int
{
    case INACTIVE = 0;
    case ACTIVE = 1;
}
