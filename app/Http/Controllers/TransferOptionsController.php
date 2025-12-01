<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use App\Models\ExchangeRate;
use App\Models\FeeStructure;
use App\Models\Offer;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TransferOptionsController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'from_currency_id' => 'required|exists:currencies,id',
            'to_currency_id' => 'required|exists:currencies,id',
            'amount_from' => 'required|numeric|min:1',
            'payout_method' => 'required|in:bank_deposit,cash_pickup,mobile_wallet',
        ]);

        $now = Carbon::now();

        $rate = ExchangeRate::where('from_currency_id', $data['from_currency_id'])
            ->where('to_currency_id', $data['to_currency_id'])
            ->where(function ($q) use ($now) {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('valid_to')->orWhere('valid_to', '>=', $now);
            })
            ->orderByDesc('created_at')
            ->first();

        if (! $rate) {
            return response()->json([
                'message' => 'No exchange rate available for this pair',
            ], 422);
        }

        $fee = FeeStructure::where('from_currency_id', $data['from_currency_id'])
            ->where('to_currency_id', $data['to_currency_id'])
            ->where('payout_method', $data['payout_method'])
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->first();

        if (! $fee) {
            return response()->json([
                'message' => 'No fee structure configured for this route',
            ], 422);
        }

        $amountFrom = $data['amount_from'];
        $feeAmount = $fee->base_fee + ($amountFrom * ($fee->percent_fee / 100));
        $amountTo = $amountFrom * $rate->rate;

        $now = Carbon::now();

        $offer = Offer::where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->orderByDesc('created_at')
            ->first();

        $discount = 0;
        $feeAfterDiscount = $feeAmount;

        if ($offer && $offer->discount_percent !== null) {
            $discount = $feeAmount * ($offer->discount_percent / 100);
            $feeAfterDiscount = max(0, $feeAmount - $discount);
        }

        $totalToPay = $amountFrom + $feeAfterDiscount;

        $fromCurrency = Currency::find($data['from_currency_id']);
        $toCurrency = Currency::find($data['to_currency_id']);

        return response()->json([
            'from_currency' => $fromCurrency,
            'to_currency' => $toCurrency,
            'input' => [
                'amount_from' => $amountFrom,
                'payout_method' => $data['payout_method'],
            ],
            'exchange_rate' => [
                'rate' => $rate->rate,
                'rate_id' => $rate->id,
                'amount_to' => round($amountTo, 2),
            ],
            'fees' => [
                'base_fee' => $fee->base_fee,
                'percent_fee' => $fee->percent_fee,
                'fee_before_offer' => round($feeAmount, 2),
                'discount' => round($discount, 2),
                'fee_after_offer' => round($feeAfterDiscount, 2),
            ],
            'total_to_pay' => round($totalToPay, 2),
            'offer' => $offer,
        ]);
    }
}
