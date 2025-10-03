<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
        'grade_level',
        'section',
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
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
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
     * Get expected fees for student's grade level
     */
    public function getExpectedFeesAttribute(): float
    {
        return FeeStructure::where('grade_level', $this->grade_level)
            ->where('is_active', true)
            ->sum('amount');
    }

    /**
     * Get current balance (negative means overpaid)
     */
    public function getBalanceAttribute(): float
    {
        return $this->expected_fees - $this->total_paid;
    }

    /**
     * Get payment status
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
     * Scope a query to only include active students
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to filter by grade level
     */
    public function scopeGradeLevel($query, $gradeLevel)
    {
        return $query->where('grade_level', $gradeLevel);
    }

    /**
     * Scope a query to filter by section
     */
    public function scopeSection($query, $section)
    {
        return $query->where('section', $section);
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
