<?php

namespace App\Services;

use App\Exceptions\RequestUnsupportedTypeException;
use App\Models\Assignment;
use App\Models\UserRequest;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class RequestService
{
    /**
     * @@param array $payload
     */
    public function createRequest(Model $sender, Model $target, string $type, array $payload, string $reason): UserRequest
    {
        return UserRequest::query()->create([
            'senderable_id' => $sender->id,
            'senderable_type' => $sender->getMorphClass(),
            'requestable_id' => $target->id,
            'requestable_type' => $target->getMorphClass(),
            'type' => $type,
            'payload' => $payload,
            'reason' => $reason,
        ]);
    }

    /**
     * @@param array $data
     */
    public function managementRequestStatus(array $data, UserRequest $request, Assignment $reviewer): void
    {
        DB::transaction(function () use ($request, $data, $reviewer) {
            $request->update([
                'reviewed_by' => $reviewer->id,
                'justification' => $data['justification'],
                'approval_status' => $data['approval_status'],
            ]);

            if ($data['approval_status'] == 1) {
                $this->applyRequestAction($request);
            }

            if ($data['approval_status'] == 3) { // REJECTED
                $request->requestable->update(['application_status' => 0]);
            }

            return $request;
        });
    }

    private function applyRequestAction(UserRequest $request): void
    {
        $target = $request->requestable;
        $payload = $request->payload;

        switch ($request->type) {
            case 'CHANGE_INTERNSHIP_TYPE':
                $target->update([
                    'internship_type' => $payload['new_type'],
                    'application_status' => 0,
                ]);
                break;

            case 'CHANGE_INTERNSHIP_GRADE':
                $target->update([
                    'grade' => $payload['new_grade'],
                    'application_status' => 0,
                ]);
                break;
            case 'DELETE_ASSIGNMENT':
                app(AssignmentService::class)->processEntityRemoval($target);
                break;
            case 'DISABLE_ASSIGNMENT':
                $target->update(['access_status' => 3, 'review_status' => 0]);
                break;
            case 'ENABLE_ASSIGNMENT':
                $target->update(['access_status' => 1, 'review_status' => 0]);
                break;
            default:
                throw new RequestUnsupportedTypeException;
        }
    }
}
