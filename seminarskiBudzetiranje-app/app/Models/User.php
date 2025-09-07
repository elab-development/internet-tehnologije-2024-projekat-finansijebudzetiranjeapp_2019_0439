<?php

// ...
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    // postojeća svojstva i metode...

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    // (opciono) direktan pristup transakcijama:
    public function transactions(): HasMany
    {
        return $this->hasManyThrough(
            Transaction::class,
            Account::class,
            'user_id',      // foreign key na accounts
            'account_id',   // foreign key na transactions
            'id',           // lokalni key na users
            'id'            // lokalni key na accounts
        );
    }
}