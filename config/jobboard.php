<?php

return [
    /*
     * Días durante los que una vacante se considera "Nueva" para un usuario
     * que todavía no abrió su detalle.
     */
    'new_days' => (int) env('JOB_BOARD_NEW_DAYS', 14),

    /*
     * Última fecha en la que se muestra la etiqueta "Nuevo" en el menú.
     * Formato YYYY-MM-DD.
     */
    'menu_badge_until' => env('JOB_BOARD_MENU_BADGE_UNTIL', '2026-12-31'),

    /*
     * Lanzamiento del módulo experimental de la bolsa laboral. La etiqueta
     * "Nuevo · Experimental" se oculta automáticamente después de estos días.
     */
    'experimental_started_at' => env('JOB_BOARD_EXPERIMENTAL_STARTED_AT', '2026-11-14'),
    'experimental_days' => (int) env('JOB_BOARD_EXPERIMENTAL_DAYS', 21),
];
