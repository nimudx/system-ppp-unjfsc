<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
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
