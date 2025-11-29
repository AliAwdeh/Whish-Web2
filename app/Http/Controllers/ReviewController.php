<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        return Review::with('transfer')->where('user_id', auth()->id())->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'transfer_id' => 'required|exists:transfers,id',
            'rating'      => 'required|integer|min:1|max:5',
            'comment'     => 'nullable|string',
        ]);

        $review = Review::updateOrCreate(
            [
                'user_id'     => auth()->id(),
                'transfer_id' => $data['transfer_id'],
            ],
            [
                'rating'  => $data['rating'],
                'comment' => $data['comment'] ?? null,
            ]
        );

        return response()->json($review, 201);
    }

    public function show(Review $review)
    {
        $this->authorizeOwner($review->user_id);
        return $review;
    }

    public function update(Request $request, Review $review)
    {
        $this->authorizeOwner($review->user_id);

        $data = $request->validate([
            'rating'  => 'sometimes|required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review->update($data);

        return response()->json($review);
    }

    public function destroy(Review $review)
    {
        $this->authorizeOwner($review->user_id);
        $review->delete();

        return response()->json(null, 204);
    }

    protected function authorizeOwner($userId)
    {
        if ($userId !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }
}
