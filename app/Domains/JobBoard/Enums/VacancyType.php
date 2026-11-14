<?php

namespace App\Domains\JobBoard\Enums;

enum VacancyType: string
{
    case PRACTICAS = 'practicas';
    case EMPLEO = 'empleo';

    public function label(): string
    {
        return match ($this) {
            self::PRACTICAS => 'Prácticas',
            self::EMPLEO => 'Empleo',
        };
    }
}
