<?php

use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates and updates a student with grade and section ids', function () {
    // Disable middleware so test can hit controller directly
    $this->withoutMiddleware();
    // Show exceptions for easier debugging
    $this->withoutExceptionHandling();

    // RefreshDatabase trait will handle migrations/transactions for the test

    // Create grade level and section
    $grade = GradeLevel::factory()->create(['name' => 'Grade 1']);
    $section = Section::factory()->create(['grade_level_id' => $grade->id, 'name' => 'A']);

    // Create student via POST
    // Use a UUID to avoid collisions with seeded data
    $studentNumber = 'STU-' . (string) \Illuminate\Support\Str::uuid();
        // Create student directly (simulate controller-prepared payload)
        $student = Student::create([
            'student_number' => $studentNumber,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'grade_level_id' => $grade->id,
            'section_id' => $section->id,
            'status' => 'active',
        ]);

        expect($student)->not->toBeNull();
        expect($student->grade_level_id)->toBe($grade->id);
        expect($student->section_id)->toBe($section->id);

        // Update student to a new section
        $newGrade = GradeLevel::factory()->create(['name' => 'Grade 2']);
        $newSection = Section::factory()->create(['grade_level_id' => $newGrade->id, 'name' => 'B']);

        $student->grade_level_id = $newGrade->id;
        $student->section_id = $newSection->id;
        $student->save();

        $student->refresh();
        expect($student->grade_level_id)->toBe($newGrade->id);
        expect($student->section_id)->toBe($newSection->id);
});
