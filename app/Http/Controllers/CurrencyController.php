<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function index()
    {
        return Currency::all();
    }

    public function store(Request $request)
    {
        // TODO: admin-only
        $data = $request->validate([
            'code'      => 'required|string|size:3|unique:currencies,code',
            'name'      => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        $currency = Currency::create($data);

        return response()->json($currency, 201);
    }

    public function show(Currency $currency)
    {
        return $currency;
    }

    public function update(Request $request, Currency $currency)
    {
        // TODO: admin-only
        $data = $request->validate([
            'name'      => 'sometimes|required|string|max:100',
            'is_active' => 'sometimes|boolean',
        ]);

        $currency->update($data);

        return response()->json($currency);
    }

    public function destroy(Currency $currency)
    {
        // TODO: admin-only
        $currency->delete();
        return response()->json(null, 204);
    }
}
