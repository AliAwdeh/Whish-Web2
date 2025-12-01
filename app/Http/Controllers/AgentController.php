<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return Agent::with('user')->paginate(20);
        }

        return Agent::with('user')
            ->where('user_id', $user->id)
            ->paginate(20);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'store_name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'working_hours' => 'nullable|array',
        ]);

        $agent = Agent::create([
            'user_id' => $user->id,
            'store_name' => $data['store_name'],
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'country' => $data['country'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'working_hours' => isset($data['working_hours']) ? json_encode($data['working_hours']) : null,
            'status' => 'pending',
        ]);

        return response()->json($agent, 201);
    }

    public function show(Agent $agent)
    {
        $user = auth()->user();

        if ($user->role === 'admin' || $agent->user_id === $user->id) {
            return $agent->load('user');
        }

        abort(403, 'Forbidden');
    }

    public function update(Request $request, Agent $agent)
    {
        $user = auth()->user();

        if ($user->role !== 'admin' && $agent->user_id !== $user->id) {
            abort(403, 'Forbidden');
        }

        $data = $request->validate([
            'store_name' => 'sometimes|required|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'working_hours' => 'nullable|array',
            'status' => 'sometimes|in:pending,approved,rejected',
        ]);

        if ($user->role !== 'admin') {
            unset($data['status']);
        }

        if (isset($data['working_hours'])) {
            $data['working_hours'] = json_encode($data['working_hours']);
        }

        $agent->update($data);

        return response()->json($agent);
    }

    public function destroy(Agent $agent)
    {
        $user = auth()->user();

        if ($user->role !== 'admin' && $agent->user_id !== $user->id) {
            abort(403, 'Forbidden');
        }

        $agent->delete();

        return response()->json(null, 204);
    }
}
