<?php

namespace App\Shared\Enums;

enum Role: int
{
    case ADMIN = 1;
    case SUBADMIN = 2;
    case DTITULAR = 3;
    case DSUPERVISOR = 4;
    case ESTUDIANTE = 5;
    case EMPRESA = 6;
}
