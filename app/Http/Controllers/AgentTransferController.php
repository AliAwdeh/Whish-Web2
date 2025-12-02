<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use App\Models\AgentCommission;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

        $this->notifyTransferCompleted($transfer);

        return response()->json($transfer->load(['beneficiary', 'user', 'agent']));
    }

    protected function notifyTransferCompleted(Transfer $transfer): void
    {
        $transfer->loadMissing([
            'beneficiary',
            'user',
        ]);

        $reference = $transfer->reference_code ?? $transfer->id;
        $notificationData = [
            'transfer_id' => $transfer->id,
            'beneficiary_id' => $transfer->beneficiary_id,
            'status' => $transfer->status,
            'reference_code' => $reference,
        ];

        Notification::create([
            'id' => (string) Str::uuid(),
            'user_id' => $transfer->user_id,
            'type' => 'transfer_completed_sender',
            'message' => 'Your transfer ' . $reference . ' has been completed.',
            'data' => $notificationData,
        ]);

        $recipientUserId = optional($transfer->beneficiary)->recipient_user_id;
        if ($recipientUserId) {
            Notification::create([
                'id' => (string) Str::uuid(),
                'user_id' => $recipientUserId,
                'type' => 'transfer_completed_recipient',
                'message' => 'You received transfer ' . $reference . '.',
                'data' => $notificationData,
            ]);
        }
    }
}
