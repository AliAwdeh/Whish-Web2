<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use App\Models\AgentCommission;
use Illuminate\Http\Request;

class AgentTransferController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role !== 'agent') {
            abort(403, 'Agent only');
        }

        $agent = $user->agent;
        if (! $agent) {
            return response()->json([
                'message' => 'No agent profile found for this user',
            ], 422);
        }

        return Transfer::where('agent_id', $agent->id)
            ->with(['beneficiary', 'user'])
            ->orderByDesc('created_at')
            ->paginate(20);
    }

    public function cashIn(Transfer $transfer)
    {
        $user = auth()->user();

        if ($user->role !== 'agent') {
            abort(403, 'Agent only');
        }

        $agent = $user->agent;
        if (! $agent || $transfer->agent_id !== $agent->id) {
            abort(403, 'This transfer does not belong to this agent');
        }

        if (! in_array($transfer->status, ['pending', 'processing'])) {
            return response()->json([
                'message' => 'Cannot cash-in this transfer in its current status',
            ], 422);
        }

        $transfer->update([
            'status' => 'processing',
        ]);

        return response()->json($transfer->load(['beneficiary', 'user', 'agent']));
    }

    public function cashOut(Transfer $transfer)
    {
        $user = auth()->user();

        if ($user->role !== 'agent') {
            abort(403, 'Agent only');
        }

        $agent = $user->agent;
        if (! $agent || $transfer->agent_id !== $agent->id) {
            abort(403, 'This transfer does not belong to this agent');
        }

        if ($transfer->status !== 'processing') {
            return response()->json([
                'message' => 'Transfer must be in processing state to cash out',
            ], 422);
        }

        $transfer->update([
            'status' => 'completed',
        ]);

        $feeAmount = $transfer->fee_amount ?? 0;
        $commissionAmount = max(0, $feeAmount * 0.5);

        AgentCommission::updateOrCreate(
            [
                'agent_id' => $agent->id,
                'transfer_id' => $transfer->id,
            ],
            [
                'amount' => $commissionAmount,
            ]
        );

        return response()->json($transfer->load(['beneficiary', 'user', 'agent']));
    }
}
