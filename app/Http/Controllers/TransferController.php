<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use App\Models\Dispute;
use App\Models\Notification;
use App\Models\Beneficiary;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TransferController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return Transfer::with(['beneficiary', 'user'])->paginate(20);
        }

        if ($user->role === 'agent') {
            $agentId = optional($user->agent)->id;

            if (! $agentId) {
                return response()->json([
                    'data' => [],
                    'message' => 'No agent profile linked to this user.',
                ], 422);
            }

            return Transfer::where('agent_id', $agentId)
                ->with(['beneficiary', 'user'])
                ->paginate(20);
        }

        return Transfer::where('user_id', $user->id)
            ->with(['beneficiary'])
            ->paginate(20);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'user' && $user->role !== 'admin') {
            abort(403, 'Only customers or admin can create transfers');
        }

        $data = $request->validate([
            'beneficiary_id' => 'required|exists:beneficiaries,id',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'agent_id' => 'nullable|exists:agents,id',
            'from_currency_id' => 'required|exists:currencies,id',
            'to_currency_id' => 'required|exists:currencies,id',
            'amount_from' => 'required|numeric|min:1',
            'amount_to' => 'required|numeric|min:1',
            'fee_amount' => 'required|numeric|min:0',
            'exchange_rate_used' => 'required|numeric',
            'speed' => 'required|in:instant,same_day,standard',
            'payout_method' => 'required|in:bank_deposit,cash_pickup,mobile_wallet',
            'offer_id' => 'nullable|exists:offers,id',
            'metadata' => 'nullable|array',
        ]);

        $beneficiary = Beneficiary::where('id', $data['beneficiary_id'])
            ->where('user_id', $user->id)
            ->first();

        if (! $beneficiary) {
            return response()->json(['message' => 'Invalid beneficiary for this user'], 403);
        }

        if (! empty($data['payment_method_id'])) {
            $paymentBelongsToUser = PaymentMethod::where('id', $data['payment_method_id'])
                ->where('user_id', $user->id)
                ->exists();

            if (! $paymentBelongsToUser) {
                return response()->json(['message' => 'Invalid payment method for this user'], 403);
            }
        }

        $data['user_id'] = $user->id;
        $data['reference_code'] = Str::upper(Str::random(10));

        if (isset($data['metadata'])) {
            $data['metadata'] = json_encode($data['metadata']);
        }

        $transfer = Transfer::create($data);

        Notification::create([
            'id' => (string) Str::uuid(),
            'user_id' => $transfer->user_id,
            'type' => 'transfer_created',
            'message' => 'Your transfer ' . $transfer->reference_code . ' was created and is pending.',
            'data' => [
                'transfer_id' => $transfer->id,
                'beneficiary_id' => $transfer->beneficiary_id,
                'status' => $transfer->status,
            ],
        ]);

        if ($beneficiary->recipient_user_id) {
            Notification::create([
                'id' => (string) Str::uuid(),
                'user_id' => $beneficiary->recipient_user_id,
                'type' => 'transfer_created_recipient',
                'message' => 'You have an incoming transfer ' . $transfer->reference_code . '.',
                'data' => [
                    'transfer_id' => $transfer->id,
                    'beneficiary_id' => $transfer->beneficiary_id,
                    'status' => $transfer->status,
                ],
            ]);
        }

        if ($transfer->agent_id && $transfer->agent && $transfer->agent->user_id) {
            Notification::create([
                'id' => (string) Str::uuid(),
                'user_id' => $transfer->agent->user_id,
                'type' => 'agent_new_transfer',
                'message' => 'New transfer assigned to your agency: ' . $transfer->reference_code,
                'data' => [
                    'transfer_id' => $transfer->id,
                    'beneficiary_id' => $transfer->beneficiary_id,
                    'status' => $transfer->status,
                ],
            ]);
        }

        return response()->json($transfer, 201);
    }

    public function show(Transfer $transfer)
    {
        $this->authorizeView($transfer);

        return $transfer->load(['beneficiary', 'user', 'agent']);
    }

    public function update(Request $request, Transfer $transfer)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $data = $request->validate([
            'status' => 'sometimes|required|in:pending,processing,completed,cancelled,refunded,disputed',
        ]);

        $previousStatus = $transfer->status;
        $transfer->update($data);

        if (($data['status'] ?? null) === 'completed' && $previousStatus !== 'completed') {
            $this->notifyTransferCompleted($transfer);
        }

        return response()->json($transfer);
    }

    public function destroy(Transfer $transfer)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $transfer->delete();

        return response()->json(null, 204);
    }

    public function cancel(Transfer $transfer)
    {
        $user = auth()->user();

        if ($user->role !== 'user' && $user->role !== 'admin') {
            abort(403, 'Only sender or admin can cancel this transfer');
        }

        if ($user->role === 'user' && $transfer->user_id !== $user->id) {
            abort(403, 'Forbidden');
        }

        if (! in_array($transfer->status, ['pending', 'processing'])) {
            return response()->json(['message' => 'Cannot cancel this transfer'], 422);
        }

        $transfer->update(['status' => 'cancelled']);

        return response()->json($transfer);
    }

    public function refund(Transfer $transfer)
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        if ($transfer->status !== 'completed') {
            return response()->json(['message' => 'Only completed transfers can be refunded'], 422);
        }

        $transfer->update(['status' => 'refunded']);

        return response()->json($transfer);
    }

    public function openDispute(Request $request, Transfer $transfer)
    {
        $user = auth()->user();

        if ($user->role !== 'user' || $transfer->user_id !== $user->id) {
            abort(403, 'Only the sender can open a dispute');
        }

        $data = $request->validate([
            'type' => 'required|in:refund,dispute',
            'reason' => 'required|string',
        ]);

        $dispute = Dispute::create([
            'transfer_id' => $transfer->id,
            'user_id' => $user->id,
            'type' => $data['type'],
            'reason' => $data['reason'],
            'status' => 'open',
        ]);

        $transfer->update(['status' => 'disputed']);

        return response()->json($dispute, 201);
    }

    protected function authorizeView(Transfer $transfer)
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return;
        }

        if ($user->role === 'agent' && $transfer->agent_id === optional($user->agent)->id) {
            return;
        }

        if ($user->role === 'user' && $transfer->user_id === $user->id) {
            return;
        }

        abort(403, 'Forbidden');
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
