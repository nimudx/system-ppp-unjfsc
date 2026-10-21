<?php

namespace App\Services\Academic;

use App\Exceptions\Group\GroupHasStudentsException;
use App\Exceptions\Group\SupervisorAlreadyAssignedToGroupInSectionException;
use App\Models\Assignment;
use App\Models\InternshipGroup;
use App\Models\Section;
use App\Models\StudentGroup;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InternshipGroupService
{
    private $supervisionService;

    public function __construct(SupervisionService $supervisionService)
    {
        $this->supervisionService = $supervisionService;
    }

    /**
     * Get all internship groups with necessary relations for the listing view.
     */
    public function getInternshipGroups(): array
    {
        return InternshipGroup::with([
            'teacher.user.person',
            'supervisor.user.person',
            'section.school.faculty',
            'module',
        ])
            ->latest()
            ->get()
            ->map(fn ($group) => [
                'id' => $group->id,
                'name' => $group->name,
                'module' => $group->module ? [
                    'id' => $group->module->id,
                    'name' => $group->module->name,
                ] : null,
                'teacher' => [
                    'id' => $group->teacher->id,
                    'user' => [
                        'email' => $group->teacher->user->email,
                        'person' => [
                            'names' => $group->teacher->user->person->names,
                            'surnames' => $group->teacher->user->person->surnames,
                        ],
                    ],
                ],
                'supervisor' => [
                    'id' => $group->supervisor->id,
                    'user' => [
                        'email' => $group->supervisor->user->email,
                        'person' => [
                            'names' => $group->supervisor->user->person->names,
                            'surnames' => $group->supervisor->user->person->surnames,
                        ],
                    ],
                ],
                'section' => [
                    'id' => $group->section->id,
                    'name' => $group->section->name,
                    'school' => [
                        'name' => $group->section->school->name,
                        'faculty' => [
                            'name' => $group->section->school->faculty->name,
                        ],
                    ],
                ],
            ])->toArray();
    }

    /**
     * Get students currently assigned to a specific group.
     */
    public function getGroupStudents(InternshipGroup $group): array
    {
        return $group->students()
            ->with(['user.person'])
            ->get()
            ->map(fn ($st) => [
                'id' => $st->id,
                'user' => [
                    'email' => $st->user->email,
                    'person' => [
                        'names' => $st->user->person->names,
                        'surnames' => $st->user->person->surnames,
                    ],
                ],
            ])->toArray();
    }

    /**
     * Get dependencies (teachers, supervisors) for a section.
     */
    public function getSectionDependencies(Section $section): array
    {
        $teachers = Assignment::where('section_id', $section->id)
            ->where('role_id', 3) // Docente Titular
            // ->where('access_status', 1)
            ->with(['user.person'])
            ->get();

        $supervisors = Assignment::where('section_id', $section->id)
            ->where('role_id', 4) // Docente Supervisor
            // ->where('access_status', 1)
            ->with(['user.person'])
            ->get();

        return [
            'teachers' => $teachers,
            'supervisors' => $supervisors,
            'suggested_name' => 'Grupo - '.($section->name ?? ''),
        ];
    }

    /**
     * Get available students for a section.
     */
    public function getAvailableStudents(Section $section, int $semesterId): array
    {
        return Assignment::where('section_id', $section->id)
            ->where('semester_id', $semesterId)
            ->where('role_id', 5) // Role 5: Student
            // ->where('access_status', 1)
            ->whereDoesntHave('studentGroups')
            ->with(['user.person'])
            ->get()
            ->map(fn ($st) => [
                'id' => $st->id,
                'user' => [
                    'email' => $st->user->email,
                    'person' => [
                        'names' => $st->user->person->names,
                        'surnames' => $st->user->person->surnames,
                    ],
                ],
            ])->toArray();
    }

    /**
     * Get all students and their assigned groups.
     */
    public function getStudentsAndGroups(): Collection
    {
        return Assignment::query()->where('role_id', 5) // Role 5: Student
            ->where('access_status', 1)
            ->with(['user.person', 'section.school', 'studentGroups.internshipGroup'])
            ->get();
    }

    /**
     * Get internship groups scoped to a specific section (for Docente/Supervisor).
     */
    public function getInternshipGroupsBySection(int $sectionId): array
    {
        return InternshipGroup::query()->with([
            'teacher.user.person',
            'supervisor.user.person',
            'section.school.faculty',
            'module',
        ])
            ->where('section_id', $sectionId)
            ->latest()
            ->get()
            ->map(fn ($group) => $this->formatGroupData($group))->toArray();
    }

    // funciona para mapear los datos de los docentes y supervisores, sección y módulo
    public function formatGroupData(InternshipGroup $group): array
    {
        return [
            'id' => $group->id,
            'name' => $group->name,
            'module' => $group->module ? ['id' => $group->module->id, 'name' => $group->module->name] : null,
            'teacher' => $group->teacher ? [
                'id' => $group->teacher->id,
                'user' => [
                    'email' => $group->teacher->user->email,
                    'person' => [
                        'names' => $group->teacher->user->person->names ?? '',
                        'surnames' => $group->teacher->user->person->surnames ?? '',
                    ],
                ],
            ] : null,
            'supervisor' => $group->supervisor ? [
                'id' => $group->supervisor->id,
                'user' => [
                    'email' => $group->supervisor->user->email,
                    'person' => [
                        'names' => $group->supervisor->user->person->names ?? '',
                        'surnames' => $group->supervisor->user->person->surnames ?? '',
                    ],
                ],
            ] : null,
            'section' => [
                'id' => $group->section->id,
                'name' => $group->section->name,
                'school' => [
                    'name' => $group->section->school->name,
                    'faculty' => ['name' => $group->section->school->faculty->name],
                ],
            ],
        ];
    }

    /**
     * Get students and their groups scoped to a specific section.
     */
    public function getStudentsAndGroupsBySection(int $sectionId): Collection
    {
        return Assignment::query()->where('role_id', 5)
            ->where('access_status', 1)
            ->where('section_id', $sectionId)
            ->with(['user.person', 'section.school', 'studentGroups.internshipGroup'])
            ->get();
    }

    /**
     * Create a new internship group.
     *
     * @param  array  $data  The data for the new internship group.
     * @return InternshipGroup The created internship group.
     */
    public function createGroup(array $data): InternshipGroup
    {
        return DB::transaction(function () use ($data) {
            $teacher = Assignment::query()->findOrFail($data['teacher_assignment_id']);
            $supervisor = Assignment::query()->findOrFail($data['supervisor_assignment_id']);

            $alreadyAssigned = InternshipGroup::query()
                ->where('supervisor_assignment_id', $supervisor->id)
                ->where('status', 1)
                ->exists();

            if ($alreadyAssigned) {
                throw new SupervisorAlreadyAssignedToGroupInSectionException;
            }

            $group = InternshipGroup::query()->create([
                'name' => $data['name'],
                'teacher_assignment_id' => $teacher->id,
                'supervisor_assignment_id' => $supervisor->id,
                'section_id' => $data['section_id'],
                'module_id' => 1,
                'status' => 1,
            ]);

            if (isset($data['student_ids']) && is_array($data['student_ids'])) {
                $this->attachStudents($group->id, $data['student_ids']);
            }

            return $group;
        });
    }

    public function updateGroup(int $groupId, array $data): InternshipGroup
    {
        return DB::transaction(function () use ($groupId, $data) {
            $group = InternshipGroup::query()->findOrFail($groupId);

            if (isset($data['supervisor_id'])) {
                $supervisor = Assignment::query()->findOrFail($data['supervisor_id']);

                $alreadyAssigned = InternshipGroup::query()
                    ->where('supervisor_assignment_id', $supervisor->id)
                    ->where('status', 1)
                    ->where('id', '!=', $groupId)
                    ->exists();

                if ($alreadyAssigned) {
                    throw new SupervisorAlreadyAssignedToGroupInSectionException;
                }

                $group->supervisor_assignment_id = $supervisor->id;
            }

            if (isset($data['name'])) {
                $group->name = $data['name'];
            }

            $group->save();

            return $group;
        });
    }

    public function deleteGroup(int $groupId): void
    {
        DB::transaction(function () use ($groupId) {
            $group = InternshipGroup::query()->findOrFail($groupId);

            if ($group->studentGroups()->exists()) {
                throw new GroupHasStudentsException;
            }

            $group->delete();
        });
    }

    /**
     * Asigna estudiantes a un grupo de prácticas.
     *
     * @return void
     */
    public function attachStudents(int $groupId, array $studentIds): array
    {
        try {
            $group = InternshipGroup::query()->findOrFail($groupId);

            $processed = DB::transaction(function () use ($group, $studentIds) {
                $count = 0;
                foreach ($studentIds as $assignmentId) {
                    $assignment = Assignment::query()->findOrFail($assignmentId);

                    /*if ($assignment->access_status != 1)
                     continue;*/

                    StudentGroup::query()->updateOrCreate(
                        [
                            'internship_group_id' => $group->id,
                            'student_assignment_id' => $assignment->id,
                        ],
                        [
                            'status' => 1,
                        ]
                    );
                    $this->supervisionService->initializeStudentProgress($assignment->id);

                    $count++;
                }

                return $count;
            });

            $this->supervisionService->syncGroupModule($group->id);

            return [
                'success' => true,
                'message' => "Se han asignado {$processed} estudiantes al grupo correctamente.",
                'data' => $group->load('students.user.person'),
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al asignar estudiante: '.$e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Desasigna estudiantes de un grupo de prácticas.
     *
     * @param  int  $groupId  El ID del grupo de prácticas.
     * @param  array  $studentIds  Los IDs de los estudiantes a desasignar.
     * @return array Un array con el resultado de la operación.
     */
    public function detachStudents(int $groupId, array $studentIds): array
    {
        try {
            $deleted = StudentGroup::query()->where('internship_group_id', $groupId)
                ->whereIn('student_assignment_id', $studentIds)
                ->delete();

            $this->supervisionService->syncGroupModule($groupId);

            return [
                'success' => true,
                'message' => "Se han retirado {$deleted} estudiantes del grupo",
                'data' => InternshipGroup::query()->find($groupId)->load('students.user.person'),
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al desasignar estudiantes: '.$e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Mueve estudiantes de un grupo a otro.
     */
    public function moveStudents(int $currentGroupId, int $targetGroupId, array $studentIds): array
    {
        try {
            return DB::transaction(function () use ($currentGroupId, $targetGroupId, $studentIds) {
                StudentGroup::query()->where('internship_group_id', $currentGroupId)
                    ->whereIn('student_assignment_id', $studentIds)
                    ->delete();

                $this->supervisionService->syncGroupModule($currentGroupId);

                $result = $this->attachStudents($targetGroupId, $studentIds);

                return [
                    'success' => true,
                    'message' => 'Se han movido '.count($studentIds).' estudiantes exitosamente.',
                    'data' => [
                        'from_group_id' => $currentGroupId,
                        'to_group' => $result['data'],
                    ],
                ];
            });
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al mover estudiantes: '.$e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Get group students with placement details.
     */
    public function getGroupStudentsWithPlacement(int $groupId): array
    {
        $group = InternshipGroup::findOrFail($groupId);

        return $group->students()
            ->with([
                'user.person',
                'placement.company',
                'placement.area',
                'internship',
            ])
            ->get()
            ->map(fn ($student) => [
                'id' => $student->id,
                'user' => [
                    'email' => $student->user->email,
                    'person' => [
                        'names' => $student->user->person->names,
                        'surnames' => $student->user->person->surnames,
                    ],
                ],
                'placement' => $student->placement ? [
                    'id' => $student->placement->id,
                    'company_name' => $student->placement->company->name ?? '---',
                    'area_name' => $student->placement->area->name ?? '---',
                    'boss_name' => $student->placement->boss_name ?? '---',
                    'boss_position' => $student->placement->boss_position ?? '---',
                    'boss_phone' => $student->placement->boss_phone ?? '---',
                    'boss_email' => $student->placement->boss_email ?? '---',
                    'position' => $student->placement->position ?? '---',
                    'start_date' => $student->placement->start_date ?? '---',
                    'end_date' => $student->placement->end_date ?? '---',
                    'internship_type' => $student->placement->internship_type ?? '---',
                    'approval_status' => $student->placement->approval_status ?? 0,
                    'validation_status' => $student->placement->validation_status ?? 0,
                ] : null,
                'internship' => $student->internship ? [
                    'id' => $student->internship->id,
                    'status' => $student->internship->status ?? 0,
                ] : null,
            ])->toArray();
    }
}
