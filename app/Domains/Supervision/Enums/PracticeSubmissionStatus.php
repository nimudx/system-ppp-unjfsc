<?php

namespace App\Domains\Supervision\Enums;

enum PracticeSubmissionStatus: int
{
    case APPROVED = 1;
    case PENDING = 2;
    case OBSERVED = 3;

    public function label(): string
    {
        return match ($this) {
            self::APPROVED => 'Aprobado',
            self::PENDING => 'Pendiente de evaluación',
            self::OBSERVED => 'Observado',
        };
    }
}
