<?php

namespace App\Domains\Internship\Support;

use Carbon\Carbon;

/**
 * Reglas legales de duración de las prácticas pre-profesionales.
 *
 * La práctica debe cubrir como mínimo 320 horas. La jornada máxima es de
 * 6 horas diarias, por lo que el rango de fechas debe contener al menos
 * 54 días hábiles (lunes a viernes). Si la jornada real es de 4 horas,
 * el estudiante necesitará 80 días hábiles.
 */
final class PracticeDuration
{
    public const MINIMUM_HOURS = 320;

    public const MAX_HOURS_PER_DAY = 6;

    /** Horas diarias que se usan para validar el mínimo legal. */
    public const PLANNING_HOURS_PER_DAY = 6;

    /**
     * Días hábiles (lunes a viernes) entre dos fechas, incluyendo ambas.
     */
    public static function businessDays(?string $start, ?string $end): int
    {
        [$from, $to] = self::range($start, $end);

        if (! $from || ! $to) {
            return 0;
        }

        $days = 0;

        for ($date = $from->copy(); $date->lte($to); $date->addDay()) {
            if ($date->isWeekday()) {
                $days++;
            }
        }

        return $days;
    }

    /**
     * Días hábiles mínimos para cubrir las 320 horas con 6 horas diarias.
     */
    public static function minimumBusinessDays(): int
    {
        return (int) ceil(self::MINIMUM_HOURS / self::MAX_HOURS_PER_DAY);
    }

    /**
     * Horas estimadas del rango usando la jornada máxima permitida.
     */
    public static function estimatedHours(int $businessDays): int
    {
        return $businessDays * self::PLANNING_HOURS_PER_DAY;
    }

    /**
     * Fecha de término mínima para un inicio dado (inclusive).
     */
    public static function minimumEndDate(?string $start): ?string
    {
        $from = self::parse($start);

        if (! $from) {
            return null;
        }

        $required = self::minimumBusinessDays();
        $counted = 0;

        for ($date = $from->copy(); ; $date->addDay()) {
            if ($date->isWeekday()) {
                $counted++;
            }

            if ($counted >= $required) {
                return $date->toDateString();
            }
        }
    }

    /**
     * @return array{0: ?Carbon, 1: ?Carbon}
     */
    private static function range(?string $start, ?string $end): array
    {
        $from = self::parse($start);
        $to = self::parse($end);

        if (! $from || ! $to || $to->lt($from)) {
            return [null, null];
        }

        return [$from, $to];
    }

    private static function parse(?string $value): ?Carbon
    {
        if (! $value) {
            return null;
        }

        try {
            return Carbon::parse($value)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }
}
