<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use App\Models\User;
use App\Models\Dispute;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function summary()
    {
        $user = auth()->user();
        if ($user->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $totalTransfers = Transfer::count();
        $totalUsers     = User::where('role', 'user')->count();
        $totalAgents    = Agent::count();
        $openDisputes   = Dispute::where('status', 'open')->count();
        $totalDisputes  = Dispute::count();

        // Volume per from_currency
        $volumeByCurrency = Transfer::select('from_currency_id', DB::raw('SUM(amount_from) as total_amount'))
            ->groupBy('from_currency_id')
            ->with('fromCurrency')
            ->get();

        // Transfers grouped by status
        $transfersByStatus = Transfer::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'totals' => [
                'transfers' => $totalTransfers,
                'users'     => $totalUsers,
                'agents'    => $totalAgents,
                'disputes'  => [
                    'open'  => $openDisputes,
                    'total' => $totalDisputes,
                ],
            ],
            'volume_by_currency' => $volumeByCurrency,
            'transfers_by_status'=> $transfersByStatus,
        ]);
    }
}
