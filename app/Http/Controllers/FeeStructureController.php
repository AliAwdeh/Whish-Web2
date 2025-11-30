<?php

namespace App\Http\Controllers;

use App\Models\FeeStructure;
use Illuminate\Http\Request;

class FeeStructureController extends Controller
{
    public function index()
    {
        return FeeStructure::with(['fromCurrency', 'toCurrency'])->get();
    }

    public function store(Request $request)
    {
        // TODO: admin-only
        $data = $request->validate([
            'from_currency_id' => 'required|exists:currencies,id',
            'to_currency_id'   => 'required|exists:currencies,id',
            'payout_method'    => 'required|in:bank_deposit,cash_pickup,mobile_wallet',
            'base_fee'         => 'required|numeric|min:0',
            'percent_fee'      => 'required|numeric|min:0',
            'is_active'        => 'boolean',
        ]);

        $fee = FeeStructure::create($data);

        return response()->json($fee, 201);
    }

    public function show(FeeStructure $feeStructure)
    {
        return $feeStructure->load(['fromCurrency', 'toCurrency']);
    }

    public function update(Request $request, FeeStructure $feeStructure)
    {
        // TODO: admin-only
        $data = $request->validate([
            'payout_method' => 'sometimes|required|in:bank_deposit,cash_pickup,mobile_wallet',
            'base_fee'      => 'sometimes|required|numeric|min:0',
            'percent_fee'   => 'sometimes|required|numeric|min:0',
            'is_active'     => 'sometimes|boolean',
        ]);

        $feeStructure->update($data);

        return response()->json($feeStructure);
    }

    public function destroy(FeeStructure $feeStructure)
    {
        // TODO: admin-only
        $feeStructure->delete();

        return response()->json(null, 204);
    }
}
