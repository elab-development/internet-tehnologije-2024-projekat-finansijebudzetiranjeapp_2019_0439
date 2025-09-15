<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Account;
use App\Models\Transaction;

class FinancialSeeder extends Seeder
{
    public function run()
    {
        // 1) Uzmi ili kreiraj korisnika ID=1
        $user = User::first() ?: User::create([
            'name'     => 'Seed User',
            'email'    => 'seed@example.com',
            'password' => bcrypt('secret123'),
        ]);

        // 2) Kreiraj 5 kategorija
        $user->categories()->createMany([
          ['name'=>'Groceries',     'type'=>'expense'],
          ['name'=>'Utilities',     'type'=>'expense'],
          ['name'=>'Entertainment', 'type'=>'expense'],
          ['name'=>'Salary',        'type'=>'income'],
          ['name'=>'Investment',    'type'=>'income'],
        ]);

        // 3) Za korisnika kreiraj 3 računa i po 20 transakcija
        $cats = $user->categories;
        for ($i = 1; $i <= 3; $i++) {
            $account = $user->accounts()->create([
                'name'    => "Account {$i}",
                'balance' => rand(100, 1000),
            ]);
            for ($j = 1; $j <= 20; $j++) {
                $cat = $cats->random();
                $account->transactions()->create([
                    'category_id'     => $cat->id,
                    'amount'          => rand(10, 500),
                    'transaction_date'=> now()->subDays(rand(0, 30))->toDateString(),
                ]);
            }
        }
    }
}
