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
        // User::factory(10)->create();

        // User::factory()->create([
        //     'full_name' => 'Admin',
        //     'email' => 'admin@gmail.com',
        //     'password' => bcrypt('12345678'),
        // ]);

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'email_verified_at' => now(),
            'password' => bcrypt('12345678'),
            'role' => 'ADMIN',
            'status' => 'Active',
        ]);

        $manager = User::create([
            'name' => 'Manager',
            'email' => 'manager@gmail.com',
            'email_verified_at' => now(),
            'password' => bcrypt('12345678'),
            'role' => 'MANAGER',
            'status' => 'Active',
        ]);
    }
}
