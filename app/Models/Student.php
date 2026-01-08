<?php

namespace App\Models;

use App\Enums\StudentStatus;
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
        'expected_fees',
    ];

    protected function casts(): array
    {
        return [
            'grade_level_id' => 'integer',
            'section_id' => 'integer',
            'status' => StudentStatus::class,
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
     * Scope a query to only include active students.
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', StudentStatus::Active);
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
     * Get total expected fees for this student based on their grade level
     */
    public function getExpectedFeesAttribute(): float
    {
        return FeeStructure::where('grade_level_id', $this->grade_level_id)
            ->where('is_active', true)
            ->sum('amount');
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
