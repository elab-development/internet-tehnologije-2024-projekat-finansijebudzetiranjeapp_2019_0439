<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Dodaj kolone potrebne za praćenje statistika
        Schema::table('accounts', function (Blueprint $table) {
            $table->decimal('monthly_budget', 15, 2)->default(0)->after('balance');
            $table->decimal('last_month_balance', 15, 2)->default(0)->after('monthly_budget');
        });

        // 2. Tabela za audit log transakcija
        Schema::create('transaction_audit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->string('action'); // INSERT, UPDATE, DELETE
            $table->decimal('old_amount', 15, 2)->nullable();
            $table->decimal('new_amount', 15, 2)->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // 3. Stored procedure za kompleksne statistike
        DB::unprepared('
            CREATE PROCEDURE GetUserFinancialSummary(IN userId INT)
            BEGIN
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    COUNT(DISTINCT a.id) as total_accounts,
                    SUM(a.balance) as total_balance,
                    COUNT(DISTINCT t.id) as total_transactions,
                    
                    -- Mesečni income/expense za poslednje 6 meseci
                    (SELECT COALESCE(SUM(t2.amount), 0) 
                     FROM transactions t2 
                     JOIN accounts a2 ON t2.account_id = a2.id 
                     JOIN categories c2 ON t2.category_id = c2.id 
                     WHERE a2.user_id = userId 
                     AND c2.type = "income" 
                     AND t2.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                    ) as income_last_6_months,
                    
                    (SELECT COALESCE(SUM(ABS(t3.amount)), 0) 
                     FROM transactions t3 
                     JOIN accounts a3 ON t3.account_id = a3.id 
                     JOIN categories c3 ON t3.category_id = c3.id 
                     WHERE a3.user_id = userId 
                     AND c3.type = "expense" 
                     AND t3.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                    ) as expenses_last_6_months,
                    
                    -- Top 3 kategorije po troškovima
                    (SELECT GROUP_CONCAT(
                        CONCAT(c4.name, ":", ROUND(SUM(ABS(t4.amount)), 2)) 
                        ORDER BY SUM(ABS(t4.amount)) DESC 
                        SEPARATOR "|"
                    )
                     FROM transactions t4 
                     JOIN accounts a4 ON t4.account_id = a4.id 
                     JOIN categories c4 ON t4.category_id = c4.id 
                     WHERE a4.user_id = userId 
                     AND c4.type = "expense" 
                     AND t4.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
                     GROUP BY c4.id 
                     LIMIT 3
                    ) as top_expense_categories
                    
                FROM users u
                LEFT JOIN accounts a ON u.id = a.user_id
                LEFT JOIN transactions t ON a.id = t.account_id
                WHERE u.id = userId
                GROUP BY u.id, u.name, u.email;
            END
        ');

        // 4. Trigger za automatsko ažuriranje balansa i audit log
        DB::unprepared('
            CREATE TRIGGER transaction_after_insert 
            AFTER INSERT ON transactions
            FOR EACH ROW
            BEGIN
                DECLARE category_type VARCHAR(10);
                
                -- Dobij tip kategorije
                SELECT type INTO category_type 
                FROM categories 
                WHERE id = NEW.category_id;
                
                -- Ažuriraj balans računa
                IF category_type = "income" THEN
                    UPDATE accounts 
                    SET balance = balance + NEW.amount 
                    WHERE id = NEW.account_id;
                ELSE
                    UPDATE accounts 
                    SET balance = balance - ABS(NEW.amount) 
                    WHERE id = NEW.account_id;
                END IF;
                
                -- Dodaj u audit log
                INSERT INTO transaction_audit (transaction_id, action, new_amount, changed_by, created_at, updated_at)
                VALUES (NEW.id, "INSERT", NEW.amount, NULL, NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER transaction_after_update 
            AFTER UPDATE ON transactions
            FOR EACH ROW
            BEGIN
                DECLARE old_category_type VARCHAR(10);
                DECLARE new_category_type VARCHAR(10);
                
                -- Dobij tipove kategorija
                SELECT type INTO old_category_type FROM categories WHERE id = OLD.category_id;
                SELECT type INTO new_category_type FROM categories WHERE id = NEW.category_id;
                
                -- Vrati stari iznos
                IF old_category_type = "income" THEN
                    UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
                ELSE
                    UPDATE accounts SET balance = balance + ABS(OLD.amount) WHERE id = OLD.account_id;
                END IF;
                
                -- Primeni novi iznos
                IF new_category_type = "income" THEN
                    UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
                ELSE
                    UPDATE accounts SET balance = balance - ABS(NEW.amount) WHERE id = NEW.account_id;
                END IF;
                
                -- Audit log
                INSERT INTO transaction_audit (transaction_id, action, old_amount, new_amount, changed_by, created_at, updated_at)
                VALUES (NEW.id, "UPDATE", OLD.amount, NEW.amount, NULL, NOW(), NOW());
            END
        ');

        DB::unprepared('
            CREATE TRIGGER transaction_after_delete 
            AFTER DELETE ON transactions
            FOR EACH ROW
            BEGIN
                DECLARE category_type VARCHAR(10);
                
                SELECT type INTO category_type FROM categories WHERE id = OLD.category_id;
                
                -- Vrati iznos u balans
                IF category_type = "income" THEN
                    UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
                ELSE
                    UPDATE accounts SET balance = balance + ABS(OLD.amount) WHERE id = OLD.account_id;
                END IF;
                
                -- Audit log
                INSERT INTO transaction_audit (transaction_id, action, old_amount, changed_by, created_at, updated_at)
                VALUES (OLD.id, "DELETE", OLD.amount, NULL, NOW(), NOW());
            END
        ');
    }

    public function down(): void
    {
        // Drop triggers
        DB::unprepared('DROP TRIGGER IF EXISTS transaction_after_insert');
        DB::unprepared('DROP TRIGGER IF EXISTS transaction_after_update');
        DB::unprepared('DROP TRIGGER IF EXISTS transaction_after_delete');
        
        // Drop procedure
        DB::unprepared('DROP PROCEDURE IF EXISTS GetUserFinancialSummary');
        
        // Drop tables and columns
        Schema::dropIfExists('transaction_audit');
        
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn(['monthly_budget', 'last_month_balance']);
        });
    }
};