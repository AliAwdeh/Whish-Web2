<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return Notification::orderBy('created_at', 'desc')->paginate(20);
        }

        return Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function show(Notification $notification)
    {
        $this->authorizeOwner($notification->user_id);
        return $notification;
    }

    public function update(Request $request, Notification $notification)
    {
        $this->authorizeOwner($notification->user_id);

        $data = $request->validate([
            'read_at' => 'nullable|date',
        ]);

        $notification->update([
            'read_at' => $data['read_at'] ?? now(),
        ]);

        return response()->json($notification);
    }

    public function destroy(Notification $notification)
    {
        $this->authorizeOwner($notification->user_id);

        $notification->delete();

        return response()->json(null, 204);
    }

    protected function authorizeOwner($userId)
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return;
        }

        if ($userId !== $user->id) {
            abort(403, 'Forbidden');
        }
    }
}
