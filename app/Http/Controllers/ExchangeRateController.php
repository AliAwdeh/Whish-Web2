<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use Illuminate\Http\Request;

class ExchangeRateController extends Controller
{
    public function index()
    {
        return ExchangeRate::with(['fromCurrency', 'toCurrency'])->get();
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $data = $request->validate([
            'from_currency_id' => 'required|exists:currencies,id',
            'to_currency_id' => 'required|exists:currencies,id',
            'rate' => 'required|numeric',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after:valid_from',
        ]);

        $rate = ExchangeRate::create($data);

        return response()->json($rate, 201);
    }

    public function show(ExchangeRate $exchangeRate)
    {
        return $exchangeRate->load(['fromCurrency', 'toCurrency']);
    }

    public function update(Request $request, ExchangeRate $exchangeRate)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $data = $request->validate([
            'rate' => 'sometimes|required|numeric',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date|after:valid_from',
        ]);

        $exchangeRate->update($data);

        return response()->json($exchangeRate);
    }

    public function destroy(ExchangeRate $exchangeRate)
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $exchangeRate->delete();

        return response()->json(null, 204);
    }
}
