<?php

namespace App\Http\Controllers;

use App\Models\TransferStatusLog;
use App\Models\Transfer;
use Illuminate\Http\Request;

class TransferStatusLogController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = TransferStatusLog::with('transfer');

        if ($transferId = $request->query('transfer_id')) {
            $query->where('transfer_id', $transferId);
        }

        if ($user->role === 'admin') {
            return $query->orderBy('created_at', 'asc')->get();
        }

        if ($user->role === 'agent') {
            $agentId = optional($user->agent)->id;

            if (! $agentId) {
                return response()->json([
                    'data' => [],
                    'message' => 'No agent profile linked to this user.',
                ], 422);
            }

            $query->whereHas('transfer', function ($q) use ($agentId) {
                $q->where('agent_id', $agentId);
            });

            return $query->orderBy('created_at', 'asc')->get();
        }

        $query->whereHas('transfer', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        });

        return $query->orderBy('created_at', 'asc')->get();
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'transfer_id' => 'required|exists:transfers,id',
            'status' => 'required|in:pending,processing,completed,cancelled,refunded,disputed',
            'message' => 'nullable|string',
        ]);

        if ($user->role === 'admin') {
            $log = TransferStatusLog::create($data);

            return response()->json($log, 201);
        }

        if ($user->role === 'agent') {
            $agentId = optional($user->agent)->id;

            if (! $agentId) {
                abort(403, 'No agent profile linked to this user');
            }

            $transfer = Transfer::where('id', $data['transfer_id'])
                ->where('agent_id', $agentId)
                ->first();

            if (! $transfer) {
                abort(403, 'This transfer does not belong to this agent');
            }

            $log = TransferStatusLog::create($data);

            return response()->json($log, 201);
        }

        abort(403, 'Forbidden');
    }

    public function show(TransferStatusLog $transferStatusLog)
    {
        $this->authorizeView($transferStatusLog);

        return $transferStatusLog;
    }

    protected function authorizeView(TransferStatusLog $transferStatusLog)
    {
        $user = auth()->user();
        $transfer = $transferStatusLog->transfer;

        if ($user->role === 'admin') {
            return;
        }

        if ($user->role === 'agent' && $transfer && $transfer->agent_id === optional($user->agent)->id) {
            return;
        }

        if ($user->role === 'user' && $transfer && $transfer->user_id === $user->id) {
            return;
        }

        abort(403, 'Forbidden');
    }
}
