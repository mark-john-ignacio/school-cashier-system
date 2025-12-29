<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Record a new payment for a student.
     *
     * Creates a payment record with an auto-generated receipt number,
     * associates it with the student and the cashier who processed it.
     *
     * @param  Student  $student  The student making the payment
     * @param  User  $cashier  The user (cashier) processing the payment
     * @param array{
     *     amount: float|string,
     *     payment_date: string,
     *     payment_purpose: string,
     *     payment_method?: string,
     *     notes?: string|null
     * } $data Payment details
     * @return Payment The newly created payment record
     *
     * @throws \Illuminate\Database\QueryException If database operation fails
     */
    public function recordPayment(Student $student, User $cashier, array $data): Payment
    {
        return DB::transaction(function () use ($student, $cashier, $data) {
            return Payment::create([
                'student_id' => $student->id,
                'user_id' => $cashier->id,
                'amount' => $data['amount'],
                'payment_date' => $data['payment_date'],
                'payment_purpose' => $data['payment_purpose'],
                'payment_method' => $data['payment_method'] ?? 'cash',
                'notes' => $data['notes'] ?? null,
            ]);
        });
    }

    /**
     * Get today's payment summary statistics.
     *
     * Returns aggregate data for all payments made today including
     * total amount collected and number of transactions.
     *
     * @return array{
     *     total: float,
     *     count: int,
     *     date: string
     * }
     */
    public function getTodaySummary(): array
    {
        $today = Carbon::today();

        $result = Payment::query()
            ->whereDate('payment_date', $today)
            ->selectRaw('COALESCE(SUM(amount), 0) as total, COUNT(*) as count')
            ->first();

        return [
            'total' => (float) ($result->total ?? 0),
            'count' => (int) ($result->count ?? 0),
            'date' => $today->toDateString(),
        ];
    }

    /**
     * Get monthly payment summary statistics.
     *
     * Returns aggregate data for all payments in the current month
     * including total amount, transaction count, and breakdown by payment method.
     *
     * @param  Carbon|null  $month  The month to get summary for (defaults to current month)
     * @return array{
     *     total: float,
     *     count: int,
     *     month: string,
     *     year: int,
     *     by_method: array<string, array{total: float, count: int}>,
     *     by_purpose: array<string, array{total: float, count: int}>
     * }
     */
    public function getMonthlySummary(?Carbon $month = null): array
    {
        $month = $month ?? Carbon::now();
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        // Get overall totals
        $totals = Payment::query()
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('COALESCE(SUM(amount), 0) as total, COUNT(*) as count')
            ->first();

        // Get breakdown by payment method
        $byMethod = Payment::query()
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->select('payment_method')
            ->selectRaw('SUM(amount) as total, COUNT(*) as count')
            ->groupBy('payment_method')
            ->get()
            ->mapWithKeys(fn ($row) => [
                $row->payment_method => [
                    'total' => (float) $row->total,
                    'count' => (int) $row->count,
                ],
            ])
            ->toArray();

        // Get breakdown by payment purpose
        $byPurpose = Payment::query()
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->select('payment_purpose')
            ->selectRaw('SUM(amount) as total, COUNT(*) as count')
            ->groupBy('payment_purpose')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->mapWithKeys(fn ($row) => [
                $row->payment_purpose => [
                    'total' => (float) $row->total,
                    'count' => (int) $row->count,
                ],
            ])
            ->toArray();

        return [
            'total' => (float) ($totals->total ?? 0),
            'count' => (int) ($totals->count ?? 0),
            'month' => $month->format('F'),
            'year' => (int) $month->year,
            'by_method' => $byMethod,
            'by_purpose' => $byPurpose,
        ];
    }

    /**
     * Generate a unique receipt number.
     *
     * Receipt numbers follow the format: RCP-YYYYMMDD-NNNN
     * - RCP: Receipt prefix
     * - YYYYMMDD: Current date
     * - NNNN: 4-digit sequence number that resets daily
     *
     * This method delegates to the Payment model's static method
     * to maintain consistency with the model's boot logic.
     *
     * @return string Unique receipt number (e.g., "RCP-20251229-0001")
     */
    public function generateReceiptNumber(): string
    {
        return Payment::generateReceiptNumber();
    }

    /**
     * Get all payments for a specific student.
     *
     * Returns payments ordered by payment date (most recent first),
     * with the cashier relationship eager loaded.
     *
     * @param  Student  $student  The student to get payments for
     * @param  int|null  $limit  Maximum number of payments to return (null for all)
     * @return Collection<int, Payment>
     */
    public function getPaymentsByStudent(Student $student, ?int $limit = null): Collection
    {
        $query = Payment::query()
            ->where('student_id', $student->id)
            ->with('user:id,name')
            ->orderByDesc('payment_date')
            ->orderByDesc('created_at');

        if ($limit !== null) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Get payments within a date range.
     *
     * @param  Carbon  $startDate  Start of the date range
     * @param  Carbon  $endDate  End of the date range
     * @return Collection<int, Payment>
     */
    public function getPaymentsByDateRange(Carbon $startDate, Carbon $endDate): Collection
    {
        return Payment::query()
            ->dateRange($startDate, $endDate)
            ->with(['student', 'user:id,name'])
            ->orderByDesc('payment_date')
            ->get();
    }

    /**
     * Get payments processed by a specific cashier.
     *
     * @param  User  $cashier  The cashier user
     * @param  Carbon|null  $date  Optional date filter (defaults to all time)
     * @return Collection<int, Payment>
     */
    public function getPaymentsByCashier(User $cashier, ?Carbon $date = null): Collection
    {
        $query = Payment::query()
            ->byCashier($cashier->id)
            ->with('student')
            ->orderByDesc('payment_date');

        if ($date !== null) {
            $query->whereDate('payment_date', $date);
        }

        return $query->get();
    }

    /**
     * Get yearly payment summary.
     *
     * @param  int|null  $year  The year to summarize (defaults to current year)
     * @return array{
     *     total: float,
     *     count: int,
     *     year: int
     * }
     */
    public function getYearlySummary(?int $year = null): array
    {
        $year = $year ?? Carbon::now()->year;
        $startOfYear = Carbon::createFromDate($year, 1, 1)->startOfYear();
        $endOfYear = Carbon::createFromDate($year, 12, 31)->endOfYear();

        $result = Payment::query()
            ->whereBetween('payment_date', [$startOfYear, $endOfYear])
            ->selectRaw('COALESCE(SUM(amount), 0) as total, COUNT(*) as count')
            ->first();

        return [
            'total' => (float) ($result->total ?? 0),
            'count' => (int) ($result->count ?? 0),
            'year' => $year,
        ];
    }

    /**
     * Get payment trend for the last N days.
     *
     * @param  int  $days  Number of days to include (default 7)
     * @return array<int, array{date: string, amount: float, count: int}>
     */
    public function getDailyTrend(int $days = 7): array
    {
        $trend = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayData = Payment::query()
                ->whereDate('payment_date', $date)
                ->selectRaw('COALESCE(SUM(amount), 0) as amount, COUNT(*) as count')
                ->first();

            $trend[] = [
                'date' => $date->format('M d'),
                'amount' => (float) ($dayData->amount ?? 0),
                'count' => (int) ($dayData->count ?? 0),
            ];
        }

        return $trend;
    }

    /**
     * Get recent payments with related data.
     *
     * @param  int  $limit  Number of payments to return
     * @return Collection<int, Payment>
     */
    public function getRecentPayments(int $limit = 5): Collection
    {
        return Payment::query()
            ->with(['student', 'user:id,name'])
            ->latest('payment_date')
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Void a payment (soft delete with audit trail).
     *
     * @param  Payment  $payment  The payment to void
     * @return bool True if successfully voided
     */
    public function voidPayment(Payment $payment): bool
    {
        return $payment->delete();
    }

    /**
     * Mark a payment's receipt as printed.
     *
     * @param  Payment  $payment  The payment to mark as printed
     */
    public function markReceiptPrinted(Payment $payment): void
    {
        $payment->markAsPrinted();
    }

    /**
     * Calculate total outstanding balance for a student.
     *
     * @param  Student  $student  The student to calculate balance for
     * @return float The outstanding balance (positive = owes, negative = overpaid)
     */
    public function calculateStudentBalance(Student $student): float
    {
        return $student->balance;
    }

    /**
     * Get payment method distribution for a date range.
     *
     * @param  Carbon  $startDate  Start of date range
     * @param  Carbon  $endDate  End of date range
     * @return array<int, array{method: string, count: int, total: float}>
     */
    public function getPaymentMethodDistribution(Carbon $startDate, Carbon $endDate): array
    {
        return Payment::query()
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->select('payment_method')
            ->selectRaw('COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'method' => ucfirst($row->payment_method),
                'count' => (int) $row->count,
                'total' => (float) $row->total,
            ])
            ->toArray();
    }
}
