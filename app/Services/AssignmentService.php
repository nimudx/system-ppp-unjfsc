<?php

namespace App\Services;

use App\Enums\Assignment\AssignmentAccessStatus;
use App\Enums\Assignment\AssignmentApprovalStatus;
use App\Enums\Assignment\AssignmentReviewStatus;
use App\Enums\Assignment\AssignmentStatus;
use App\Models\Assignment;
use App\Models\User;
use App\Models\UserRequest;
use Illuminate\Support\Facades\DB;

class AssignmentService
{
    protected $requestService;

    public function __construct(RequestService $requestService)
    {
        $this->requestService = $requestService;
    }

    /**
     * Inicia una solicitud de gestión de asignación (Eliminar/Deshabilitar/Habilitar).
     */
    public function requestAssignmentManage(array $data, Assignment $assignment, Assignment $sender): void
    {
        DB::transaction(function () use ($data, $assignment, $sender) {
            $this->validateOwnership($assignment, $sender);

            $type = '';
            $msj = '';
            if ($data['action'] == 1) {
                $type = 'DELETE_ASSIGNMENT';
                $msj = 'Eliminar el usuario';
            } elseif ($data['action'] == 2) {
                $type = 'DISABLE_ASSIGNMENT';
                $msj = 'Deshabilitar el usuario';
            } elseif ($data['action'] == 3) {
                $type = 'ENABLE_ASSIGNMENT';
                $msj = 'Habilitar el usuario';
            }

            // Marcar que la asignación está bajo revisión
            $assignment->review_status = AssignmentReviewStatus::UNDER_REVIEW;
            $assignment->save();

            $this->requestService->createRequest(
                $sender,
                $assignment,
                $type,
                [
                    'assignment_id' => $assignment->id,
                    'access_status' => $assignment->access_status,
                ],
                $data['reason'] ?? $msj
            );
        });
    }

    /**
     * Actualiza el estado de una solicitud académica y aplica los cambios si se aprueba.
     */
    public function updateAssignmentRequestStatus(array $data, UserRequest $request, Assignment $reviewer): void
    {
        DB::transaction(function () use ($request, $data, $reviewer) {
            $approvalStatus = (int) $data['approval_status'];

            // 1. Actualizar el registro de la solicitud
            $request->update([
                'reviewed_by' => $reviewer->id,
                'justification' => $data['justification'] ?? '',
                'approval_status' => $approvalStatus,
            ]);

            $target = $request->requestable;

            // dd($target);

            // 2. Si se aprueba, aplicamos la lógica de negocio
            if ($approvalStatus == 1 && $target) {
                $this->applyAssignmentAction($request);
            }

            $target->update([
                'review_status' => AssignmentReviewStatus::NONE,
            ]);

            // 3. Si se rechaza (o cualquier otro estado final), liberamos la asignación de la revisión
            /*if ($approvalStatus == 3 && $target) {
                $target->update([
                    'review_status' => AssignmentReviewStatus::NONE,
                ]);
            }*/
        });
    }

    /**
     * Aplica la acción específica según el tipo de solicitud aprobada.
     */
    public function applyAssignmentAction(UserRequest $request): void
    {
        $target = $request->requestable;

        switch ($request->type) {
            case 'DELETE_ASSIGNMENT':
                $this->processEntityRemoval($target);
                break;
            case 'DISABLE_ASSIGNMENT':
                $target->update([
                    'access_status' => AssignmentAccessStatus::READ_ONLY,
                ]);
                break;
            case 'ENABLE_ASSIGNMENT':
                /*$target->update([
                    //'access_status' => AssignmentAccessStatus::FULL,
                ]);*/
                if ($target->approval_status == AssignmentApprovalStatus::APPROVED) {
                    $target->update([
                        'access_status' => AssignmentAccessStatus::FULL,
                    ]);
                } else {
                    $target->update([
                        'access_status' => AssignmentAccessStatus::LIMITED,
                    ]);
                }
                break;
        }
    }

    /**
     * Lógica profunda para remover o deshabilitar una asignación basándose en su historial.
     */
    public function processEntityRemoval(Assignment $assignment): void
    {
        $user = $assignment->user;
        $person = $user->person;

        // Verificar si la asignación tiene algún tipo de récord histórico
        $hasRecords = $assignment->internships()->exists() ||
            $assignment->dossiers()->exists() ||
            $assignment->documents()->exists() ||
            $assignment->teacherGroups()->exists() ||
            $assignment->supervisorGroups()->exists() ||
            $assignment->studentGroups()->exists() ||
            $assignment->placement()->exists();

        if ($hasRecords) {
            // Si tiene récords, no borramos físicamente. Deshabilitamos.
            $assignment->update([
                'status' => AssignmentStatus::INACTIVE,
                'access_status' => AssignmentAccessStatus::READ_ONLY,
            ]);

            // Opcional: Deshabilitar el usuario si ya no tiene ninguna asignación operativa
            $activeCount = $user->assignments()->where('status', AssignmentStatus::ACTIVE)->count();
            if ($activeCount === 0) {
                $user->update(['status' => 0]);
            }

            return;
        }

        // Si no tiene historial, procedemos a borrar físicamente
        $assignment->delete();

        // Si el usuario ya no tiene más asignaciones, borramos su cuenta de usuario
        if ($user->assignments()->count() === 0) {
            $user->delete();

            // Si la persona ya no tiene más usuarios (ej. ni académico ni empresa), borramos a la persona
            $otherUsersExist = User::query()->where('person_id', $person->id)->exists();
            if (! $otherUsersExist) {
                $person->delete();
            }
        }
    }

    private function validateOwnership(Assignment $assignment, Assignment $sender): void
    {
        if (in_array($sender->role_id, [1, 2])) {
            return;
        }

        if (in_array($sender->role_id, [4, 5])) {
            throw new \Exception('You do not have permission to manage this assignment.');
        }

        if ($sender->role_id === 3) {
            if ($sender->section_id !== $assignment->section_id) {
                throw new \Exception('You do not have permission to manage this assignment.');
            }
        }
    }
}
