<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('transactions', function (Blueprint $table) {
        $table->string('type')->nullable()->after('amount');
    });

    // Popunjavanje postojeće kolone type na osnovu kategorije
    DB::statement("
        UPDATE transactions t
        JOIN categories c ON t.category_id = c.id
        SET t.type = c.type
    ");
}

public function down()
{
    Schema::table('transactions', function (Blueprint $table) {
        $table->dropColumn('type');
    });
}
};
