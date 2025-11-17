<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('branding', fn () => [
            'name' => config('app.name', 'Dei Gratia School Inc.'),
            'logo' => config('app.logo'),
        ]);
    }
}
