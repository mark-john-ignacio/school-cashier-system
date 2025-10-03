<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@school.test',
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create cashier user
        User::factory()->create([
            'name' => 'Cashier User',
            'email' => 'cashier@school.test',
            'role' => 'cashier',
            'is_active' => true,
        ]);

        // Seed fee structures first
        $this->call([
            FeeStructureSeeder::class,
            StudentSeeder::class,
        ]);
    }
}
