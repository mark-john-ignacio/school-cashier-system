<?php

namespace App\Services;

use App\Enums\StudentStatus;
use App\Models\Payment;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get student statistics.
     *
     * @return array{total: int, active: int}
     */
    public function getStudentStats(): array
    {
        return Cache::remember('dashboard.student_stats', 300, function () {
            return [
                'total' => Student::count(),
                'active' => Student::where('status', StudentStatus::Active)->count(),
            ];
        });
    }

    /**
     * Get payment statistics.
     *
     * @return array{today: float, todayCount: int, monthly: float, yearly: float}
     */
    public function getPaymentStats(): array
    {
        return Cache::remember('dashboard.payment_stats', 300, function () {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();
            $thisYear = Carbon::now()->startOfYear();

            return [
                'today' => (float) Payment::whereDate('payment_date', $today)->sum('amount'),
                'todayCount' => Payment::whereDate('payment_date', $today)->count(),
                'monthly' => (float) Payment::whereDate('payment_date', '>=', $thisMonth)->sum('amount'),
                'yearly' => (float) Payment::whereDate('payment_date', '>=', $thisYear)->sum('amount'),
            ];
        });
    }

    /**
     * Get last 7 days payment trend.
     *
     * @return array<int, array{date: string, amount: float, count: int}>
     */
    public function getLast7DaysTrend(): array
    {
        return Cache::remember('dashboard.last_7_days_trend', 300, function () {
            $trend = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $trend[] = [
                    'date' => $date->format('M d'),
                    'amount' => (float) Payment::whereDate('payment_date', $date)->sum('amount'),
                    'count' => Payment::whereDate('payment_date', $date)->count(),
                ];
            }
            return $trend;
        });
    }

    /**
     * Get monthly payment trend (last 6 months).
     *
     * @return array<int, array{month: string, amount: float, count: int}>
     */
    public function getMonthlyTrend(): array
    {
        return Cache::remember('dashboard.monthly_trend', 300, function () {
            $trend = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i)->startOfMonth();
                $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
                $trend[] = [
                    'month' => $month->format('M Y'),
                    'amount' => (float) Payment::whereBetween('payment_date', [$month, $monthEnd])->sum('amount'),
                    'count' => Payment::whereBetween('payment_date', [$month, $monthEnd])->count(),
                ];
            }
            return $trend;
        });
    }

    /**
     * Get payment method distribution for the current month.
     *
     * @return array<int, array{method: string, count: int, total: float}>
     */
    public function getPaymentMethodDistribution(): array
    {
        return Cache::remember('dashboard.payment_method_distribution', 300, function () {
            $thisMonth = Carbon::now()->startOfMonth();
            
            return Payment::select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
                ->whereDate('payment_date', '>=', $thisMonth)
                ->groupBy('payment_method')
                ->get()
                ->map(function ($item) {
                    // Handle Enum or String
                    $methodLabel = $item->payment_method instanceof \App\Enums\PaymentMethod 
                        ? $item->payment_method->label() 
                        : ucfirst($item->payment_method);

                    return [
                        'method' => $methodLabel,
                        'count' => $item->count,
                        'total' => (float) $item->total,
                    ];
                })
                ->values()
                ->all();
        });
    }

    /**
     * Get payment purpose distribution for the current month.
     *
     * @return array<int, array{purpose: string, count: int, total: float}>
     */
    public function getPaymentPurposeDistribution(): array
    {
        return Cache::remember('dashboard.payment_purpose_distribution', 300, function () {
            $thisMonth = Carbon::now()->startOfMonth();

            return Payment::select('payment_purpose', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
                ->whereDate('payment_date', '>=', $thisMonth)
                ->groupBy('payment_purpose')
                ->limit(5)
                ->orderByDesc('total')
                ->get()
                ->map(function ($item) {
                    return [
                        'purpose' => ucfirst(str_replace('_', ' ', $item->payment_purpose)),
                        'count' => $item->count,
                        'total' => (float) $item->total,
                    ];
                })
                ->values()
                ->all();
        });
    }

    /**
     * Get recent payments.
     *
     * @return array<int, array{id: int, receipt_number: string, student_name: string, amount: float, payment_date: string, payment_purpose: string}>
     */
    public function getRecentPayments(): array
    {
        return Cache::remember('dashboard.recent_payments', 300, function () {
            return Payment::with(['student', 'user'])
                ->latest('payment_date')
                ->latest('created_at')
                ->take(5)
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'receipt_number' => $payment->receipt_number,
                        'student_name' => $payment->student->full_name ?? 'N/A',
                        'amount' => (float) $payment->amount,
                        'payment_date' => $payment->payment_date->format('M d, Y'),
                        'payment_purpose' => ucfirst(str_replace('_', ' ', $payment->payment_purpose)),
                    ];
                })
                ->all();
        });
    }
}
