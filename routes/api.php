<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\BeneficiaryController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\TransferStatusLogController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\DisputeController;
use App\Http\Controllers\AgentCommissionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TransferOptionsController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AgentTransferController;

//authentication

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/auth/github', [AuthController::class, 'githubLogin']);

//protected routes

Route::middleware('auth:api')->group(function () {

    // Auth info
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Users (CRUD) – only admin should use this in controllers / policies
    Route::apiResource('users', UserController::class);

    // Agents
    Route::apiResource('agents', AgentController::class);

    // Payment methods
    Route::apiResource('payment-methods', PaymentMethodController::class);

    // Beneficiaries
    Route::apiResource('beneficiaries', BeneficiaryController::class);

    // Currencies
    Route::apiResource('currencies', CurrencyController::class);

    // Exchange rates
    Route::apiResource('exchange-rates', ExchangeRateController::class);

    // Fee structures
    Route::apiResource('fee-structures', FeeStructureController::class);

    // Offers
    Route::apiResource('offers', OfferController::class);

    // Transfers
    Route::apiResource('transfers', TransferController::class);

    // Extra transfer actions (status changes, refunds, disputes, etc.)
    Route::post('/transfers/{transfer}/cancel',  [TransferController::class, 'cancel']);
    Route::post('/transfers/{transfer}/refund',  [TransferController::class, 'refund']);
    Route::post('/transfers/{transfer}/dispute', [TransferController::class, 'openDispute']);

    // Transfer status logs (mostly read)
    Route::apiResource('transfer-status-logs', TransferStatusLogController::class)
        ->only(['index', 'show', 'store']); // update/destroy optional

    // Reviews
    Route::apiResource('reviews', ReviewController::class);

    // Disputes
    Route::apiResource('disputes', DisputeController::class);

    // Agent commissions
    Route::apiResource('agent-commissions', AgentCommissionController::class);

    // Notifications
    Route::apiResource('notifications', NotificationController::class)->only(['index', 'show', 'update', 'destroy']);

    // Transfer quote / search
    Route::get('/transfer-options', [TransferOptionsController::class, 'index']);

    // Admin reports
    Route::get('/admin/reports/summary', [AdminReportController::class, 'summary']);

    // Agent-specific transfer actions
    Route::get('/agent/transfers', [AgentTransferController::class, 'index']);
    Route::post('/agent/transfers/{transfer}/cash-in',  [AgentTransferController::class, 'cashIn']);
    Route::post('/agent/transfers/{transfer}/cash-out', [AgentTransferController::class, 'cashOut']);

});
