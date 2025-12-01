<?php

namespace App\Http\Controllers;

use App\Models\Dispute;
use Illuminate\Http\Request;

class DisputeController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return Dispute::with('transfer')->paginate(20);
        }

        return Dispute::with('transfer')
            ->where('user_id', $user->id)
            ->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'transfer_id' => 'required|exists:transfers,id',
            'type' => 'required|in:refund,dispute',
            'reason' => 'required|string',
        ]);

        $dispute = Dispute::create([
            'transfer_id' => $data['transfer_id'],
            'user_id' => auth()->id(),
            'type' => $data['type'],
            'reason' => $data['reason'],
            'status' => 'open',
        ]);

        return response()->json($dispute, 201);
    }

    public function show(Dispute $dispute)
    {
        $this->authorizeAccess($dispute);

        return $dispute->load('transfer');
    }

    public function update(Request $request, Dispute $dispute)
    {
        $user = auth()->user();
        $this->authorizeAccess($dispute);

        $data = $request->validate([
            'status' => 'sometimes|required|in:open,in_review,resolved,rejected',
            'resolution_notes' => 'nullable|string',
        ]);

        if ($user->role !== 'admin') {
            unset($data['status'], $data['resolution_notes']);
        }

        $dispute->update($data);

        return response()->json($dispute);
    }

    public function destroy(Dispute $dispute)
    {
        $this->authorizeAccess($dispute);

        $dispute->delete();

        return response()->json(null, 204);
    }

    protected function authorizeAccess(Dispute $dispute)
    {
        $user = auth()->user();

        if ($user->role === 'admin' || $dispute->user_id === $user->id) {
            return;
        }

        abort(403, 'Forbidden');
    }
}
