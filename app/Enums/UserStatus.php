<?php

namespace App\Enums;

enum UserStatus: int
{
    case PENDING = 0;
    case ACTIVE  = 1;
}
