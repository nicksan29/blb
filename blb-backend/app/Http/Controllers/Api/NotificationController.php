<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        $query = \App\Models\Notification::query();
        
        if ($isAdmin) {
            // Admins see all global (null) and admin specific, plus their own
            $query->where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            });
        } else {
            // DBVs see notifications where user_id is null (global) or user_id is their own, BUT NOT for_admin
            $query->where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            })->where('for_admin', false);
        }

        $notifications = $query->orderBy('created_at', 'desc')->take(20)->get();

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $notification = \App\Models\Notification::findOrFail($id);

        if ($notification->user_id == $user->id || ($notification->user_id == null && $user->role == 'admin')) {
            $notification->is_read = true;
            $notification->save();
        }

        return response()->json(['message' => 'Notification marked as read']);
    }
}
