<?php

namespace App\Services\Auth;

use App\Models\Assignment;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Support\Collection;

class SharedDataService
{
    public function __construct(protected SyncAcademicSessionService $syncService) {}

    public function getSharedPayload(User $user): array
    {
        $type = $user->typeUser;

        // Academic context synchronization if needed
        if ($type->id === 2 || $type->id === 1) {
            $this->syncService->sync($user);
        }

        $payload = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type_id' => $type->id,
                'type' => $type->name,
                'avatar' => $this->getProfilePhoto($user),
                'profile_name' => $this->getProfileName($user),
            ],
            'profiles' => $this->getUserProfiles($user),
            'notifications' => $this->getUnreadNotifications($user),
        ];

        if ($type->id === 2 || $type->id === 1) {
            $payload['academic'] = fn () => $this->getAcademicContext($user);
        }

        return $payload;
    }

    private function getUserProfiles(User $user): array
    {
        $semester_id = session('semester_id') ?? Semester::getActiveSemester()?->id;

        return [
            'academic' => $this->getUserAssignments($user, $semester_id),
            'staff' => $this->getUserStaffs($user),
        ];
    }

    private function getProfileName(User $user): string
    {
        $profile = $user->person;

        return "{$profile->names} {$profile->surnames}";
    }

    private function getProfilePhoto(User $user): ?string
    {
        $profile = $user->person;

        return $profile->path_photo;
    }

    private function getAcademicContext(User $user): array
    {
        $semester_id = session('semester_id');

        if (! $semester_id) {
            $semester_id = Semester::getActiveSemester()->id;
        }

        return [
            'semesters' => $this->getAcademicSemesters($user),
            'assignments' => $this->getUserAssignments($user, $semester_id),
            'role_id' => $this->getSelectedRoleId($user),
            'selected_semester_id' => $semester_id,
        ];
    }

    /**
     * Get the user's assignments for the given semester.
     */
    private function getUserAssignments(User $user, int $semester_id): Collection
    {
        if (! $user || ! $semester_id) {
            return collect();
        }

        return $user->assignments()
            ->where('status', 1)
            ->where(function ($query) use ($semester_id) {
                $query->where('semester_id', $semester_id)
                    ->orWhereIn('role_id', [1, 2]);
            })
            ->with(['role', 'section.school'])
            ->get()
            ->map(fn ($asig) => [
                'id' => $asig->id,
                'role' => $asig->role->name,
                'initials' => substr($asig->role->name, 0, 2),
                'context' => $this->getAssignmentContext($asig),
                'selected' => $this->getAssignmentSelected($asig),
            ]);
    }

    private function getAssignmentContext(Assignment $asig): string
    {
        if ($asig->role_id === 1) {
            return 'Gestión de Sistema';
        }

        if ($asig->role_id === 2) {
            $faculty = $asig->section->school->faculty;

            return $faculty->name;
        }

        $school = $asig->section->school->name ?? 'N/A';
        $section = $asig->section->name ?? 'N/A';
        if (in_array($asig->role_id, [3, 4, 5])) {
            return "{$section} - {$school}";
        }

        return 'N/A';
    }

    private function getAssignmentSelected(Assignment $asig): bool
    {
        return session('assignment_id') === $asig->id;
    }

    private function getAcademicSemesters(User $user): Collection
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::find($assignmentId);

        if (! $assignment) {
            return collect();
        }

        if ($assignment->role_id === 1) {
            return Semester::all();
        }

        $semesterIds = $user->assignments()->distinct()->pluck('semester_id');

        return Semester::whereIn('id', $semesterIds)->get();
    }

    private function getSelectedRoleId(?User $user): ?int
    {
        if (! $user) {
            return null;
        }

        $assignmentId = session('assignment_id');

        if (! $assignmentId) {
            return null;
        }

        return Assignment::find($assignmentId)?->role_id;
    }

    /**
     * Get the user's staff roles.
     */
    private function getUserStaffs(User $user): Collection
    {
        return $user->staffs()
            ->with(['company', 'position'])
            ->get()
            ->map(fn ($staff) => [
                'id' => $staff->id,
                'role' => $staff->position->name ?? 'Staff',
                'initials' => substr($staff->position->name ?? 'ST', 0, 2),
                'context' => $staff->company->name ?? 'Empresa',
                'selected' => $staff->is_select,
            ]);
    }

    private function getUnreadNotifications(User $user): array
    {
        $recipients = $user->notificationRecipients()
            ->with('notification.actor.user.person')
            ->whereNull('read_at')
            ->latest()
            ->limit(10)
            ->get();

        return $recipients->map(function ($recipient) {
            $notification = $recipient->notification;
            $actorName = trim($notification->actor->user->person->names.' '.$notification->actor->user->person->surnames);

            return [
                'id' => $recipient->id,
                'notification_id' => $notification->id,
                'type' => $notification->type,
                'actor' => $actorName,
                'payload' => $notification->payload,
                'created_at' => $notification->created_at->diffForHumans(),
            ];
        })->toArray();
    }
}
