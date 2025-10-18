<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_id',
        'user_id',
        'receipt_number',
        'amount',
        'payment_date',
        'payment_purpose',
        'payment_method',
        'notes',
        'printed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'date',
            'printed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     * 
     * Automatically generates a unique receipt number when creating a new payment.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (!$payment->receipt_number) {
                $payment->receipt_number = static::generateReceiptNumber();
            }
        });
    }

    /**
     * Generate a unique receipt number.
     * 
     * Receipt numbers follow the format: RCP-YYYYMMDD-NNNN
     * - RCP: Receipt prefix
     * - YYYYMMDD: Current date (e.g., 20251018)
     * - NNNN: 4-digit sequence number that resets daily
     * 
     * The sequence number increments throughout the day, starting from 0001.
     * Includes soft-deleted records to prevent duplicate numbers in case of
     * accidental deletions and restorations.
     * 
     * @return string Unique receipt number (e.g., "RCP-20251018-0001")
     * 
     * @example
     * RCP-20251018-0001 // First receipt of October 18, 2025
     * RCP-20251018-0002 // Second receipt of the same day
     * RCP-20251019-0001 // First receipt of October 19, 2025 (sequence resets)
     */
    public static function generateReceiptNumber(): string
    {
        $date = now()->format('Ymd');
        $today = now()->toDateString();

        // Find the last receipt created today (including soft-deleted records)
        // This prevents duplicate receipt numbers if a payment is deleted and restored
        $lastReceipt = static::withTrashed()
            ->whereDate('created_at', $today)
            ->orderByDesc('receipt_number')
            ->first();

        // Extract the sequence number from the last receipt, or start at 1
        // Receipt format: RCP-20251018-0001, so we take the last 4 digits
        $sequence = $lastReceipt ? (int) substr($lastReceipt->receipt_number, -4) + 1 : 1;

        // Generate the candidate receipt number
        $candidate = sprintf('RCP-%s-%04d', $date, $sequence);

        // Handle edge case: Ensure uniqueness (protects against race conditions or manual inserts)
        // In high-concurrency scenarios, two requests might get the same sequence number
        while (static::withTrashed()->where('receipt_number', $candidate)->exists()) {
            $sequence++;
            $candidate = sprintf('RCP-%s-%04d', $date, $sequence);
        }

        return $candidate;
    }

    /**
     * Get the student that owns the payment.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class)->withTrashed();
    }

    /**
     * Get the cashier who processed the payment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark receipt as printed
     */
    public function markAsPrinted(): void
    {
        $this->update(['printed_at' => now()]);
    }

    /**
     * Check if receipt has been printed
     */
    public function isPrinted(): bool
    {
        return !is_null($this->printed_at);
    }

    /**
     * Scope a query to filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by cashier
     */
    public function scopeByCashier($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to filter by payment purpose
     */
    public function scopePurpose($query, $purpose)
    {
        return $query->where('payment_purpose', $purpose);
    }

    /**
     * Scope a query to get today's payments
     */
    public function scopeToday($query)
    {
        return $query->whereDate('payment_date', now()->toDateString());
    }
}
