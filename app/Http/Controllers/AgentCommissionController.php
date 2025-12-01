<?php

namespace App\Http\Controllers;

use App\Models\AgentCommission;
use Illuminate\Http\Request;

class AgentCommissionController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return AgentCommission::with(['agent', 'transfer'])->paginate(20);
        }

        if ($user->role === 'agent') {
            $agentId = optional($user->agent)->id;

            if (!$agentId) {
                return response()->json([
                    'data' => [],
                    'message' => 'No agent profile linked to this user.'
                ]);
            }

            return AgentCommission::with('transfer')
                ->where('agent_id', $agentId)
                ->paginate(20);
        }

        abort(403, 'Forbidden');
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $data = $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'transfer_id' => 'required|exists:transfers,id',
            'amount' => 'required|numeric|min:0',
        ]);

        $commission = AgentCommission::create($data);

        return response()->json($commission, 201);
    }

    public function show(AgentCommission $agentCommission)
    {
        $user = auth()->user();

        if (
            $user->role === 'admin' ||
            ($user->role === 'agent' && $agentCommission->agent_id === optional($user->agent)->id)
        ) {
            return $agentCommission->load(['agent', 'transfer']);
        }

        abort(403, 'Forbidden');
    }

    public function update(Request $request, AgentCommission $agentCommission)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $data = $request->validate([
            'amount' => 'sometimes|required|numeric|min:0',
        ]);

        $agentCommission->update($data);

        return response()->json($agentCommission);
    }

    public function destroy(AgentCommission $agentCommission)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $agentCommission->delete();

        return response()->json(null, 204);
    }
}
