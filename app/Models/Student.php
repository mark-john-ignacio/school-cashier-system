<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_number',
        'first_name',
        'middle_name',
        'last_name',
    'grade_level_id',
    'section_id',
        'contact_number',
        'email',
        'parent_name',
        'parent_contact',
        'parent_email',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $appends = [
        'grade_level_name',
        'section_name',
    ];

    protected function casts(): array
    {
        return [
            'grade_level_id' => 'integer',
            'section_id' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function gradeLevel(): BelongsTo
    {
        return $this->belongsTo(GradeLevel::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get the student's full name
     */
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ]);

        return implode(' ', $parts);
    }

    /**
     * Get all payments for this student
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get total amount paid by student
     */
    public function getTotalPaidAttribute(): float
    {
        return $this->payments()->sum('amount');
    }

    /**
     * Calculate the total expected fees for the student.
     * 
     * Aggregates all active fee structures assigned to the student's grade level.
     * Returns 0 if the student is not assigned to a grade level.
     * 
     * @return float Total expected fees in PHP
     */
    public function getExpectedFeesAttribute(): float
    {
        if (!$this->grade_level_id) {
            return 0.0;
        }

        return FeeStructure::where('grade_level_id', $this->grade_level_id)
            ->where('is_active', true)
            ->sum('amount');
    }

    /**
     * Calculate the current balance for the student.
     * 
     * Balance Calculation:
     * - Positive balance = Amount still owed by the student
     * - Zero balance = Fully paid
     * - Negative balance = Overpayment (student paid more than expected)
     * 
     * Formula: Balance = Expected Fees - Total Paid
     * 
     * @return float Current balance in PHP
     * 
     * @example
     * Expected fees: ₱10,000, Total paid: ₱7,000  → Balance: ₱3,000 (owes)
     * Expected fees: ₱10,000, Total paid: ₱10,000 → Balance: ₱0 (fully paid)
     * Expected fees: ₱10,000, Total paid: ₱12,000 → Balance: -₱2,000 (overpaid)
     */
    public function getBalanceAttribute(): float
    {
        return $this->expected_fees - $this->total_paid;
    }

    /**
     * Determine the payment status based on balance.
     * 
     * Status Logic:
     * - "overpaid": Balance is negative (paid more than expected)
     * - "paid": Balance is zero or very close to zero
     * - "partial": Has made some payments but still owes
     * - "outstanding": No payments made yet
     * 
     * @return string Payment status label
     */
    public function getPaymentStatusAttribute(): string
    {
        $balance = $this->balance;

        if ($balance <= 0) {
            return $balance < 0 ? 'overpaid' : 'paid';
        }

        if ($this->total_paid > 0) {
            return 'partial';
        }

        return 'outstanding';
    }

    /**
     * Scope a query to only include active students.
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to filter by grade level.
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int|string $gradeLevel Grade level ID or name
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeGradeLevel($query, $gradeLevel)
    {
        if (is_numeric($gradeLevel)) {
            return $query->where('grade_level_id', (int) $gradeLevel);
        }

        return $query->whereHas('gradeLevel', function ($relation) use ($gradeLevel) {
            $relation->where('slug', $gradeLevel)
                ->orWhere('name', $gradeLevel);
        });
    }

    /**
     * Scope a query to filter by section
     */
    public function scopeSection($query, $section)
    {
        if (is_numeric($section)) {
            return $query->where('section_id', (int) $section);
        }

        return $query->whereHas('section', function ($relation) use ($section) {
            $relation->where('slug', $section)
                ->orWhere('name', $section);
        });
    }

    /**
     * Scope a query to search students
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('student_number', 'like', "%{$search}%")
                ->orWhere('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$search}%"])
                ->orWhereRaw("CONCAT(first_name, ' ', middle_name, ' ', last_name) like ?", ["%{$search}%"]);
        });
    }

    public function getGradeLevelNameAttribute(): ?string
    {
        return $this->gradeLevel?->name;
    }

    public function getSectionNameAttribute(): ?string
    {
        return $this->section?->name;
    }

    /**
     * Scope a query to filter by payment status
     */
    public function scopePaymentStatus($query, $status)
    {
        // This will be implemented with a join or subquery
        // For now, we'll load all and filter in memory
        return $query;
    }
}
