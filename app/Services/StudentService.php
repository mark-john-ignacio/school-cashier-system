<?php

namespace App\Services;

use App\Models\FeeStructure;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class StudentService
{
    /**
     * Create a new student.
     *
     * @param array $data
     * @return Student
     * @throws InvalidArgumentException
     */
    public function createStudent(array $data): Student
    {
        return DB::transaction(function () use ($data) {
            // Resolve grade level
            $grade = $this->resolveGradeLevel($data['grade_level'] ?? null);
            if (! $grade) {
                throw new InvalidArgumentException('Selected grade level is invalid.');
            }

            // Resolve section
            $section = $this->resolveSection($data['section'] ?? null, $grade->id);
            if (! $section) {
                throw new InvalidArgumentException('Selected section is invalid.');
            }

            // Prepare payload
            $payload = $data;
            $payload['grade_level_id'] = $grade->id;
            $payload['section_id'] = $section->id;
            unset($payload['grade_level'], $payload['section']);

            return Student::create($payload);
        });
    }

    /**
     * Update an existing student.
     *
     * @param Student $student
     * @param array $data
     * @return Student
     * @throws InvalidArgumentException
     */
    public function updateStudent(Student $student, array $data): Student
    {
        return DB::transaction(function () use ($student, $data) {
            // Resolve grade level
            $grade = $this->resolveGradeLevel($data['grade_level'] ?? null);
            if (! $grade) {
                throw new InvalidArgumentException('Selected grade level is invalid.');
            }

            // Resolve section
            $section = $this->resolveSection($data['section'] ?? null, $grade->id);
            if (! $section) {
                throw new InvalidArgumentException('Selected section is invalid.');
            }

            // Prepare payload
            $payload = $data;
            unset($payload['grade_level'], $payload['section']);

            $student->fill($payload);
            $student->grade_level_id = $grade->id;
            $student->section_id = $section->id;
            $student->save();

            return $student;
        });
    }

    /**
     * Calculate the total expected fees for the student.
     *
     * @param Student $student
     * @return float
     */
    public function calculateExpectedFees(Student $student): float
    {
        if (! $student->grade_level_id) {
            return 0.0;
        }

        return FeeStructure::where('grade_level_id', $student->grade_level_id)
            ->where('is_active', true)
            ->sum('amount');
    }

    /**
     * Calculate the current balance for the student.
     *
     * @param Student $student
     * @return float
     */
    public function calculateBalance(Student $student): float
    {
        $expectedFees = $this->calculateExpectedFees($student);
        $totalPaid = $student->total_paid; // Assuming this attribute is still available or we should calculate it here too?
        // The user asked to move logic, but total_paid is a simple sum relation. 
        // I'll keep using the attribute for now as it wasn't explicitly asked to be moved, 
        // but calculateExpectedFees was.
        
        return $expectedFees - $totalPaid;
    }

    /**
     * Determine the payment status based on balance.
     *
     * @param Student $student
     * @return string
     */
    public function getPaymentStatus(Student $student): string
    {
        $balance = $this->calculateBalance($student);
        $totalPaid = $student->total_paid;

        if ($balance <= 0) {
            return $balance < 0 ? 'overpaid' : 'paid';
        }

        if ($totalPaid > 0) {
            return 'partial';
        }

        return 'outstanding';
    }

    /**
     * Resolve grade level from input.
     *
     * @param mixed $input
     * @return GradeLevel|null
     */
    public function resolveGradeLevel(mixed $input): ?GradeLevel
    {
        if ($input === null || $input === '') {
            return null;
        }

        if (is_numeric($input)) {
            return GradeLevel::find((int) $input);
        }

        return GradeLevel::query()
            ->where('slug', $input)
            ->orWhere('name', $input)
            ->first();
    }

    /**
     * Resolve section from input.
     *
     * @param mixed $input
     * @param int|null $gradeLevelId
     * @return Section|null
     */
    public function resolveSection(mixed $input, ?int $gradeLevelId = null): ?Section
    {
        if ($input === null || $input === '') {
            return null;
        }

        if (is_numeric($input)) {
            return Section::find((int) $input);
        }

        $query = Section::query()
            ->where(function ($relation) use ($input) {
                $relation->where('slug', $input)
                    ->orWhere('name', $input);
            });

        if ($gradeLevelId) {
            $query->where('grade_level_id', $gradeLevelId);
        }

        return $query->first();
    }
}
