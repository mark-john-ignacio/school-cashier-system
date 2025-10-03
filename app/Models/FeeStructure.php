<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeStructure extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'grade_level',
        'fee_type',
        'amount',
        'school_year',
        'description',
        'is_active',
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
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Scope a query to only include active fees
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by school year
     */
    public function scopeSchoolYear($query, $schoolYear)
    {
        return $query->where('school_year', $schoolYear);
    }

    /**
     * Scope a query to filter by grade level
     */
    public function scopeGradeLevel($query, $gradeLevel)
    {
        return $query->where('grade_level', $gradeLevel);
    }

    /**
     * Get current school year (e.g., "2024-2025")
     */
    public static function currentSchoolYear(): string
    {
        $month = now()->month;
        $year = now()->year;

        // School year typically starts in June/July
        if ($month >= 6) {
            return $year . '-' . ($year + 1);
        }

        return ($year - 1) . '-' . $year;
    }
}
