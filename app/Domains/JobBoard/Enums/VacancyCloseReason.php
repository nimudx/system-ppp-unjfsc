<?php

namespace App\Domains\JobBoard\Enums;

enum VacancyCloseReason: string
{
    case FILLED = 'filled';
    case EXPIRED = 'expired';
    case WITHDRAWN = 'withdrawn';

    public function label(): string
    {
        return match ($this) {
            self::FILLED => 'Cubierta',
            self::EXPIRED => 'Vencida',
            self::WITHDRAWN => 'Retirada',
        };
    }
}
