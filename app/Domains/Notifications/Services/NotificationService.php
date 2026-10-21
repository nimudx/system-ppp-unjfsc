<?php

namespace App\Domains\Notifications\Services;

use App\Domains\Identity\Models\Assignment;
use App\Domains\Notifications\Models\Notification;
use App\Domains\Notifications\Models\NotificationRecipient;
use App\Shared\Enums\Role;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class NotificationService
{
    /*
        DEMO OF A PAYLOAD
        {
            "action": {
                "route": "academic.dossiers.validation",
                "params": {
                "dossier": 123
                }
            },
            "meta": {
                "message": "subió un documento"
            }
        }
    */
    public function getNotifications(int $userId): Collection
    {
        return NotificationRecipient::where('user_id', $userId)
            ->with(['notification.actor.user.person'])
            ->get()
            ->unique('notification_id') // Evita duplicados si es necesario
            ->map(function ($recipient) {
                $notification = $recipient->notification;

                // Verificamos que la notificación exista para evitar errores
                if (! $notification) {
                    return null;
                }

                $actorName = trim($notification->actor->user->person->names.' '.$notification->actor->user->person->surnames);

                return [
                    'id' => $recipient->id,
                    'type' => $notification->type,
                    'actor' => $actorName,
                    'role' => $notification->payload['meta']['role'] ?? '',
                    'title' => $notification->payload['meta']['title'] ?? '',
                    'document' => $notification->payload['meta']['document'] ?? '',
                    'status' => $notification->payload['meta']['status'] ?? null,
                    'comment' => $notification->payload['meta']['comment'] ?? null,
                    'entity' => $notification->payload['meta']['entity'] ?? null,
                    'action' => $notification->payload['action'] ?? '',
                    'read_at' => $recipient->read_at,
                    'seen_at' => $recipient->seen_at,
                    'created_at' => $notification->created_at,
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * @param  Closure(Model, Model): Collection|null  $resolver
     */
    public function notify(string $type, Model $actor, Model $subject, array $payload = [], ?Closure $resolver = null): Notification
    {
        try {
            $notification = Notification::create([
                'type' => $type,
                'actor_type' => $actor->getMorphClass(),
                'actor_id' => $actor->getKey(),
                'subject_type' => $subject->getMorphClass(),
                'subject_id' => $subject->getKey(),
                'payload' => $this->buildPayload($type, $actor, $subject, $payload),
            ]);

            $recipients = $resolver ? $resolver($subject, $actor) : $this->defaultRecipients($type, $subject);
            $this->storeRecipients($notification, $recipients);

            return $notification;
        } catch (\Throwable $e) {
            logger()->error('NotificationService error', [
                'type' => $type,
                'actor' => $actor->getKey(),
                'subject' => $subject->getKey(),
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function buildPayload(string $type, Model $actor, Model $subject, array $payload): array
    {
        $action = $payload['action'] ?? $this->resolveAction($type, $actor, $subject);

        unset($payload['action']);

        return [
            'action' => $action,
            ...$payload,
        ];
    }

    protected function resolveAction(string $type, Model $actor, Model $subject): array
    {
        return match ($type) {
            'DOSSIER_UPLOAD' => [
                'route' => 'academic.dossiers.submission',
                'params' => [
                    'a' => $actor->id,
                ],
            ],
            'DOSSIER_VALIDATION' => [
                'route' => 'academic.dossiers.show',
                'params' => ['dossier' => $subject->id],
            ],
            'PLACEMENT_REGISTER' => [
                'route' => 'internship.validation',
                'params' => ['i' => $actor->id],
            ],
            'PLACEMENT_UPDATE' => [
                'route' => 'internship.validation',
                'params' => ['i' => $actor->id],
            ],
            'PLACEMENT_FINALIZED' => [
                'route' => 'internship.submission',
                'params' => [],
            ],
            default => [
                'route' => 'dashboard',
                'params' => [],
            ],
        };
    }

    protected function defaultRecipients(string $type, Model $subject): Collection
    {
        if (! method_exists($subject, 'assignment')) {
            return collect();
        }

        $subject->loadMissing('assignment');

        return match ($type) {
            'DOSSIER_UPLOAD' => $this->resolveAcademicRoles($subject->assignment->section_id, [Role::ADMIN, Role::SUBADMIN, Role::DTITULAR]),
            'DOSSIER_VALIDATION' => collect([
                $subject->assignment->user,
            ]),
            'PLACEMENT_FINALIZED' => collect([
                $subject->assignment->user,
            ]),
            default => collect(),
        };
    }

    public function resolveAcademicRoles(int $sectionId, array $roles): Collection
    {
        $roleValues = array_map(fn ($role) => $role instanceof \BackedEnum ? $role->value : $role, $roles);
        $cacheKey = "section_roles_{$sectionId}_".implode('_', $roleValues);

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($sectionId, $roleValues) {
            return Assignment::query()
                ->where('section_id', $sectionId)
                ->whereIn('role_id', $roleValues)
                ->with('user')
                ->get()
                ->pluck('user')
                ->filter()
                ->unique('id')
                ->values();
        });
    }

    protected function storeRecipients(Notification $notification, $users): void
    {
        if (! $users || $users->isEmpty()) {
            return;
        }

        $data = $users->map(fn ($user) => [
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        NotificationRecipient::upsert(
            $data,
            ['notification_id', 'user_id']
        );
    }

    public function markAsRead(int $recipientId, int $userId): void
    {
        NotificationRecipient::where('id', $recipientId)
            ->where('user_id', $userId)
            ->update(['read_at' => now()]);
    }

    public function markAllAsRead(int $userId): void
    {
        NotificationRecipient::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function deleteNotification(int $recipientId, int $userId): void
    {
        NotificationRecipient::where('id', $recipientId)
            ->where('user_id', $userId)
            ->delete();
    }
}
