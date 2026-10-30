<?php

namespace App\Domains\Supervision\Enums;

enum PracticeSubmissionType: string
{
    case PLAN = 'plan';
    case REPORT = 'report';

    public function documentTypeCode(): string
    {
        return match ($this) {
            self::PLAN => 'plan_practicas',
            self::REPORT => 'informe_practicas',
        };
    }

    public function title(): string
    {
        return match ($this) {
            self::PLAN => 'Plan de prácticas',
            self::REPORT => 'Informe de prácticas',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::PLAN => 'Documento con las actividades, objetivos y cronograma de prácticas.',
            self::REPORT => 'Informe de las actividades realizadas durante el periodo de prácticas.',
        };
    }
}
