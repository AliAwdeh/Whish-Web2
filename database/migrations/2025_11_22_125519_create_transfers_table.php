<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // sender
            $table->foreignId('beneficiary_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->onDelete('set null');
            $table->foreignId('agent_id')->nullable()->constrained('agents')->onDelete('set null'); // if cash pickup via agent

            $table->foreignId('from_currency_id')->constrained('currencies')->onDelete('cascade');
            $table->foreignId('to_currency_id')->constrained('currencies')->onDelete('cascade');

            $table->decimal('amount_from', 18, 2);
            $table->decimal('amount_to', 18, 2);
            $table->decimal('fee_amount', 18, 2)->default(0);
            $table->decimal('exchange_rate_used', 18, 8);

            $table->enum('speed', ['instant', 'same_day', 'standard'])->default('standard');
            $table->enum('payout_method', ['bank_deposit', 'cash_pickup', 'mobile_wallet']);
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled', 'refunded', 'disputed'])->default('pending');

            $table->string('reference_code')->unique();
            $table->dateTime('expected_completion_at')->nullable();

            $table->foreignId('offer_id')->nullable()->constrained('offers')->onDelete('set null');

            $table->json('metadata')->nullable(); // raw response from payment gateway, etc.

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
