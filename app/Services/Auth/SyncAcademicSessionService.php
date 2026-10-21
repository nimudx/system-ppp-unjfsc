<?php

namespace App\Services\Auth;

use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Semester;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SyncAcademicSessionService
{
    public function sync(User $user): void
    {
        /** @var Assignment|null $assignment */
        $assignment = $user->assignments()
            ->where('status', 1)
            ->where('is_select', 1)
            ->first();

        if (! $assignment) {
            /** @var Assignment|null $assignment */
            $assignment = $user->assignments()->latest()->first();
            if ($assignment) {
                $assignment->update(['is_select' => 1]);
            }
        }

        if (! $assignment) {
            return;
        }

        session(['assignment_id' => $assignment->id]);

        if (in_array($assignment->role_id, [Role::ADMIN, Role::SUBADMIN])) {
            if (! session()->has('semester_id')) {
                session(['semester_id' => Semester::getActiveSemester()?->id]);
            }

            return;
        }

        session(['semester_id' => $assignment->semester_id]);
    }

    public function syncSemester(User $user, Semester $semester): void
    {
        DB::transaction(function () use ($user, $semester) {
            $currentAssignmentId = session('assignment_id');
            $current = Assignment::find($currentAssignmentId);

            if (in_array($current->role_id, [1, 2])) {
                // actualizamos el semester del current assignment
                $current->semester_id = $semester->id;
                $current->save();
                session(['semester_id' => $semester->id]);

                return;
            }

            $newAssignment = $user->assignments()
                ->where('semester_id', $semester->id)
                ->where('status', 1)
                ->first();
            if (! $newAssignment) {
                throw new \Exception('No hay asignaciones disponibles para este semestre');
            }

            $this->syncAssignment($user, $newAssignment);
        });
    }

    public function syncAssignment(User $user, Assignment $assignment): void
    {
        DB::transaction(function () use ($user, $assignment) {
            if ($assignment->user_id !== $user->id) {
                throw new \Exception('No puedes seleccionar esta asignación');
            }

            /** @var Assignment|null $oldAssignment */
            $oldAssignment = $user->assignments()->where('is_select', 1)->first();
            if ($oldAssignment) {
                $oldAssignment->update([
                    'is_select' => 0,
                ]);
            }

            $assignment->update([
                'is_select' => 1,
            ]);

            // Ensure all staff selections are deactivated
            $user->staffs()->where('is_select', 1)->update(['is_select' => 0]);

            // Update user type if not already admin
            if ($user->type_user_id !== 1) {
                $user->update(['type_user_id' => in_array($assignment->role_id, [Role::ADMIN, Role::SUBADMIN]) ? 1 : 2]);
            }

            session(['assignment_id' => $assignment->id]);
            session(['semester_id' => $assignment->semester_id]);
        });
    }

    public function syncStaff(User $user, Staff $staff): void
    {
        DB::transaction(function () use ($user, $staff) {
            // Deactivate all assignments
            $user->assignments()->where('is_select', 1)->update(['is_select' => 0]);

            // Deactivate other staff roles
            $user->staffs()->where('is_select', 1)->update(['is_select' => 0]);

            // Activate current staff role
            $staff->update(['is_select' => 1]);

            // Update user type to Staff/Company (3)
            if ($user->type_user_id !== 1) {
                $user->update(['type_user_id' => 3]);
            }

            session()->forget(['assignment_id', 'semester_id']);
        });
    }
}
