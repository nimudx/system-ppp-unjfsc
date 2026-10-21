<?php

namespace App\Domains\Notifications\Http\Controllers;

use App\Domains\Notifications\Services\NotificationService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(protected NotificationService $notificationService) {}

    public function index(Request $request)
    {
        $notifications = $this->notificationService->getNotifications($request->user()->id);

        return inertia('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $this->notificationService->markAsRead($id, $request->user()->id);

        return back();
    }

    public function markAllAsRead(Request $request)
    {
        $this->notificationService->markAllAsRead($request->user()->id);

        return back();
    }

    public function destroy(Request $request, $id)
    {
        $this->notificationService->deleteNotification($id, $request->user()->id);

        return back();
    }
}
