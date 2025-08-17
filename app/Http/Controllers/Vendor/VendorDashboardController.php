<?php

namespace App\Http\Controllers\Vendor;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class VendorDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('vendor/Dashboard');
    }
}