<?php

namespace App\Http\Middleware;

use App\Models\Semester;
use App\Services\Auth\SharedDataService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    public function __construct(protected SharedDataService $sharedDataService) {}

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $authData = $user
            ? $this->sharedDataService->getSharedPayload($user)
            : ['user' => null];

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => $authData,
            'role' => fn () => $user && isset($authData['academic'])
                ? session('assignment_id') ? \App\Models\Assignment::find(session('assignment_id'))?->role_id : null
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => session('success'),
                'message' => session('message'),
                'error' => session('error'),
            ],
            'academic' => [
                'historicMode' => fn () => $this->isHistoricMode($request),
                'accessStatus' => fn () => $this->getCurrentAccessStatus(),
                'currentSemester' => fn () => $this->getCurrentSemester(),
                'selectedAssignmentId' => session('assignment_id'),
                'sessionToken' => $user ? md5(session()->getId()) : null,
            ],
        ];
    }

    private function isHistoricMode(Request $request): bool
    {
        $assignmentId = session('assignment_id');
        if (! $assignmentId) {
            return false;
        }

        $assignment = \App\Models\Assignment::find($assignmentId);
        if (! $assignment) {
            return false;
        }

        // Si es Admin, nunca es historico para él (puede gestionar todo)
        if ($assignment->role_id === \App\Enums\Role::ADMIN->value) {
            return false;
        }

        return $assignment->semester && $assignment->semester->status->value === 0;
    }

    private function getCurrentAccessStatus(): int
    {
        $assignmentId = session('assignment_id');
        if (! $assignmentId) {
            return 1;
        }

        $assignment = \App\Models\Assignment::find($assignmentId);
        if (! $assignment) {
            return 1;
        }

        // Los administradores y subadmins siempre tienen acceso completo (1)
        if (in_array($assignment->role_id, [1, 2])) {
            return 1;
        }

        return $assignment->access_status->value;
    }

    private function getCurrentSemester(): ?array
    {
        $semesterId = session('semester_id');
        if (! $semesterId) {
            return null;
        }

        $semester = Semester::find($semesterId);
        if (! $semester) {
            return null;
        }

        return [
            'id' => $semester->id,
            'code' => $semester->code,
            'status' => $semester->status->value,
        ];
    }
}
