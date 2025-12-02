<?php
 
namespace App\Http\Controllers;
 
use App\Models\Beneficiary;
use Illuminate\Http\Request;
 
class BeneficiaryController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Beneficiary::paginate(20);
    }
 
    public function store(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'recipient_user_id' => 'nullable|exists:users,id',
            'full_name' => 'required|string|max:255',
            'country' => 'required|string|max:100',
            'city' => 'nullable|string|max:100',
            'payout_method' => 'required|in:bank_deposit,cash_pickup,mobile_wallet',
            'payout_details' => 'nullable|array',
        ]);
 
        $beneficiary = Beneficiary::create([
            'user_id' => $user->id,
            'recipient_user_id' => $data['recipient_user_id'] ?? null,
            'full_name' => $data['full_name'],
            'country' => $data['country'],
            'city' => $data['city'] ?? null,
            'payout_method' => $data['payout_method'],
            'payout_details' => isset($data['payout_details']) ? json_encode($data['payout_details']) : null,
        ]);
 
        return response()->json($beneficiary, 201);
    }
 
    public function show(Beneficiary $beneficiary)
    {
        $this->authorizeOwner($beneficiary->user_id);
 
        return $beneficiary;
    }
 
    public function update(Request $request, Beneficiary $beneficiary)
    {
        $this->authorizeOwner($beneficiary->user_id);

        $data = $request->validate([
            'recipient_user_id' => 'sometimes|nullable|exists:users,id',
            'full_name' => 'sometimes|required|string|max:255',
            'country' => 'sometimes|required|string|max:100',
            'city' => 'nullable|string|max:100',
            'payout_method' => 'sometimes|required|in:bank_deposit,cash_pickup,mobile_wallet',
            'payout_details' => 'nullable|array',
        ]);
 
        if (isset($data['payout_details'])) {
            $data['payout_details'] = json_encode($data['payout_details']);
        }
 
        $beneficiary->update($data);
 
        return response()->json($beneficiary);
    }
 
    public function destroy(Beneficiary $beneficiary)
    {
        $this->authorizeOwner($beneficiary->user_id);
 
        $beneficiary->delete();
 
        return response()->json(null, 204);
    }
 
    protected function authorizeOwner($userId)
    {
        $user = auth()->user();
 
        if ($userId !== $user->id && $user->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }
}
 
