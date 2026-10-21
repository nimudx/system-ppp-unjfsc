<?php

namespace App\Domains\Requests\Http\Controllers;

use App\Domains\Identity\Models\Assignment;
use App\Domains\Requests\Http\Requests\UpdateManagementRequestStatusRequest;
use App\Domains\Requests\Models\UserRequest;
use App\Domains\Requests\Services\RequestService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class RequestController extends Controller
{
    protected $requestService;

    public function __construct(RequestService $requestService)
    {
        $this->requestService = $requestService;
    }

    /**
     * Get the pending request for an assignment.
     */
    public function getRequestAssignment(Assignment $assignment): JsonResponse
    {
        $request = UserRequest::query()
            ->where('requestable_id', $assignment->id)
            ->where('requestable_type', (new Assignment)->getMorphClass())
            ->where('approval_status', 2) // PENDING
            ->with('senderable')
            ->first();

        if (! $request) {
            return response()->json(['data' => null], 200);
        }

        return response()->json(['data' => $request], 200);
    }

    /**
     * Update the management request status.
     *
     * @param  UpdateManagementRequestStatusRequest  $request
     */
    public function updateManagementRequestStatus(UpdateManagementRequestStatusRequest $validatedRequest, UserRequest $request): RedirectResponse
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::find($assignmentId);

        $data = $validatedRequest->validated();

        $this->requestService->managementRequestStatus($data, $request, $assignment);

        return back()->with('message', 'Solicitud actualizada exitosamente.');
    }
}
