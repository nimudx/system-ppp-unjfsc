<?php

namespace App\Domains\JobBoard\Enums;

enum VacancyStatus: string
{
    case DRAFT = 'draft';
    case PENDING_REVIEW = 'pending_review';
    case OBSERVED = 'observed';
    case REJECTED = 'rejected';
    case PUBLISHED = 'published';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Borrador',
            self::PENDING_REVIEW => 'En revisión',
            self::OBSERVED => 'Observada',
            self::REJECTED => 'Rechazada',
            self::PUBLISHED => 'Publicada',
            self::CLOSED => 'Cerrada',
        };
    }
}
