<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsUsers;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InternshipSettingSeeder extends Seeder
{
    use SeedsUsers;

    /**
     * Workflow de prácticas para la sección de Ingeniería de Sistemas (2026-I).
     * Requiere: SectionSeeder y DocumentTypeSeeder.
     */
    public function run(): void
    {
        $section = $this->systemsSection();

        // required_docs se indexa por internship_type del Placement. No sé con certeza si
        // tu app guarda 'desarrollo' (default de la migración) o 'development', así que
        // cubro ambas variantes de desarrollo y de convalidación.
        $planDocs = [['code' => 'plan_practicas', 'name' => 'Plan de prácticas']];
        $reportDocs = [['code' => 'informe_practicas', 'name' => 'Informe de prácticas']];

        $forAllTypes = fn (array $docs) => [
            'desarrollo' => $docs,
            'development' => $docs,
            'validacion' => $docs,
            'validation' => $docs,
        ];

        $schema = [
            [
                'step' => 1,
                'name' => 'Plan de prácticas',
                'is_evaluation' => false,
                'required_docs' => $forAllTypes($planDocs),
            ],
            [
                'step' => 2,
                'name' => 'Informe de prácticas',
                'is_evaluation' => false,
                'required_docs' => $forAllTypes($reportDocs),
            ],
            [
                'step' => 3,
                'name' => 'Evaluación',
                'is_evaluation' => true,
                'required_docs' => [],
            ],
        ];

        $now = now();

        DB::table('internship_settings')->upsert([[
            'section_id' => $section->id,
            'workflow_schema' => json_encode($schema, JSON_UNESCAPED_UNICODE),
            'is_active' => true,
            'status' => 2, // 1: Draft, 2: Active, 3: Completed
            'created_at' => $now,
            'updated_at' => $now,
        ]], ['section_id'], ['workflow_schema', 'is_active', 'status', 'updated_at']);
    }
}
