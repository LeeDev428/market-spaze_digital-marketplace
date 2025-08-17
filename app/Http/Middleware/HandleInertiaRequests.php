<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Check if we're in a rider context
        $rider = Auth::guard('rider')->user();
        $user = $request->user();

        // Build auth object based on context
        $auth = [];
        if ($rider) {
            // For rider context, use rider as both user and rider
            $auth = [
                'user' => [
                    'id' => $rider->id,
                    'name' => $rider->name,
                    'email' => $rider->email,
                ],
                'rider' => [
                    'id' => $rider->id,
                    'rider_id' => $rider->rider_id,
                    'vehicle_type' => $rider->vehicle_type,
                    'license_plate' => $rider->license_number,
                    'phone_number' => $rider->phone,
                    'status' => $rider->status,
                    'rating' => $rider->rating,
                    'total_deliveries' => $rider->total_deliveries,
                    'earnings_today' => 0, // This will be calculated in controllers
                    'earnings_total' => 0, // This will be calculated in controllers
                    'is_online' => $rider->is_online ?? false,
                ],
            ];
        } else {
            // For regular user context
            $auth = [
                'user' => $user,
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => $auth,
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
