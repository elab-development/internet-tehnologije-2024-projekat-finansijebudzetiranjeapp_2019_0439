<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('account_id')
              ->constrained()
              ->onDelete('cascade');           // briše sve transakcije kad se briše nalog
        $table->foreignId('category_id')
              ->constrained()
              ->onDelete('restrict');          // ne možeš obrisati kategoriju dok postoje trans.
        $table->decimal('amount', 15, 2);     // iznos (+ za income, – za expense)
        $table->text('description')->nullable();
        $table->date('transaction_date');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
