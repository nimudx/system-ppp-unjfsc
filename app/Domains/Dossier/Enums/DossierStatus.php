<?php

namespace App\Domains\Dossier\Enums;

enum DossierStatus: int
{
    case INACTIVE = 0;
    case ACTIVE = 1;
}
