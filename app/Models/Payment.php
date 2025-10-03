<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
     * Boot the model
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
     * Generate unique receipt number
     */
    public static function generateReceiptNumber(): string
    {
        $date = now()->format('Ymd');
        $lastReceipt = static::whereDate('created_at', now()->toDateString())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastReceipt ? (int) substr($lastReceipt->receipt_number, -4) + 1 : 1;

        return sprintf('RCP-%s-%04d', $date, $sequence);
    }

    /**
     * Get the student that owns the payment
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
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
