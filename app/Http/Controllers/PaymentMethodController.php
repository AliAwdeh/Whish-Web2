<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function index()
    {
        return PaymentMethod::where('user_id', auth()->id())->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'          => 'required|in:bank_account,card,wallet',
            'provider_name' => 'nullable|string|max:255',
            'masked_number' => 'nullable|string|max:50',
            'currency'      => 'required|string|size:3',
            'details'       => 'nullable|array',
        ]);

        $data['user_id'] = auth()->id();
        if (isset($data['details'])) {
            $data['details'] = json_encode($data['details']);
        }

        $paymentMethod = PaymentMethod::create($data);

        return response()->json($paymentMethod, 201);
    }

    public function show(PaymentMethod $paymentMethod)
    {
        $this->authorizeOwner($paymentMethod->user_id);
        return $paymentMethod;
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $this->authorizeOwner($paymentMethod->user_id);

        $data = $request->validate([
            'type'          => 'sometimes|required|in:bank_account,card,wallet',
            'provider_name' => 'nullable|string|max:255',
            'masked_number' => 'nullable|string|max:50',
            'currency'      => 'sometimes|required|string|size:3',
            'details'       => 'nullable|array',
            'is_verified'   => 'sometimes|boolean',
        ]);

        if (isset($data['details'])) {
            $data['details'] = json_encode($data['details']);
        }

        $paymentMethod->update($data);

        return response()->json($paymentMethod);
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        $this->authorizeOwner($paymentMethod->user_id);

        $paymentMethod->delete();
        return response()->json(null, 204);
    }

    

    protected function authorizeOwner($userId)
    {
        if ($userId !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }
}
