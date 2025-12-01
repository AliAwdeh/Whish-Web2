<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('agent_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agents')->onDelete('cascade');
            $table->foreignId('transfer_id')->constrained('transfers')->onDelete('cascade');
            $table->decimal('amount', 18, 2);
            $table->timestamps();

            $table->unique(['agent_id', 'transfer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_commissions');
    }
};
