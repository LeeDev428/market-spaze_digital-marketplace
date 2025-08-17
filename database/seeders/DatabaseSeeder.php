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
        // Run all seeders in the correct order
        $this->call([
            UserRolesSeeder::class,
            VendorStoresSeeder::class,
            VendorProductServicesSeeder::class,
        ]);

        $this->command->info('All seeders completed successfully!');
        $this->command->info('Database has been populated with sample data for all user roles.');
    }
}
