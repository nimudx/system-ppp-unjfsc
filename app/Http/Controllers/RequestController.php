<?php

namespace App\Http\Controllers;

use App\Http\Requests\Request\UpdateManagementRequestStatusRequest;
use App\Models\Assignment;
use App\Models\UserRequest;
use App\Services\RequestService;
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
            ->where('requestable_type', Assignment::class)
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
