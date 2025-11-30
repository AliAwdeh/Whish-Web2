<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function index()
    {
        return Offer::all();
    }

    public function store(Request $request)
    {
        // TODO: admin-only
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'discount_percent' => 'nullable|numeric|min:0',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date|after:starts_at',
            'is_active'        => 'boolean',
            'conditions'       => 'nullable|array',
        ]);

        if (isset($data['conditions'])) {
            $data['conditions'] = json_encode($data['conditions']);
        }

        $offer = Offer::create($data);

        return response()->json($offer, 201);
    }

    public function show(Offer $offer)
    {
        return $offer;
    }

    public function update(Request $request, Offer $offer)
    {
        // TODO: admin-only
        $data = $request->validate([
            'title'            => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string',
            'discount_percent' => 'nullable|numeric|min:0',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date|after:starts_at',
            'is_active'        => 'sometimes|boolean',
            'conditions'       => 'nullable|array',
        ]);

        if (isset($data['conditions'])) {
            $data['conditions'] = json_encode($data['conditions']);
        }

        $offer->update($data);

        return response()->json($offer);
    }

    public function destroy(Offer $offer)
    {
        // TODO: admin-only
        $offer->delete();

        return response()->json(null, 204);
    }
}
