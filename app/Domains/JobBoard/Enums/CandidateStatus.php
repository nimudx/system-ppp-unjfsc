<?php

namespace App\Domains\JobBoard\Enums;

enum CandidateStatus: string
{
    case PROPOSED = 'proposed';
    case CONTACTED = 'contacted';
    case HIRED = 'hired';
    case DISCARDED = 'discarded';

    public function label(): string
    {
        return match ($this) {
            self::PROPOSED => 'Propuesto',
            self::CONTACTED => 'Contactado',
            self::HIRED => 'Contratado',
            self::DISCARDED => 'Descartado',
        };
    }
}
