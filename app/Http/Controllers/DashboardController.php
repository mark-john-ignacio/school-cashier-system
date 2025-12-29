<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $dashboardService)
    {
    }

    /**
     * Display the dashboard with statistics
     */
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'statistics' => [
                'students' => $this->dashboardService->getStudentStats(),
                'payments' => $this->dashboardService->getPaymentStats(),
                'last7Days' => $this->dashboardService->getLast7DaysTrend(),
                'monthlyTrend' => $this->dashboardService->getMonthlyTrend(),
                'paymentMethods' => $this->dashboardService->getPaymentMethodDistribution(),
                'paymentPurposes' => $this->dashboardService->getPaymentPurposeDistribution(),
                'recentPayments' => $this->dashboardService->getRecentPayments(),
            ],
        ]);
    }
}
