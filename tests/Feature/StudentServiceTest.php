<?php

use App\Models\FeeStructure;
use App\Models\GradeLevel;
use App\Models\Payment;
use App\Models\Section;
use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = new StudentService();
});

it('creates a student successfully', function () {
    $grade = GradeLevel::factory()->create();
    $section = Section::factory()->for($grade)->create();

    $data = [
        'student_number' => '12345',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'grade_level' => $grade->id,
        'section' => $section->id,
        'status' => 'active',
    ];

    $student = $this->service->createStudent($data);

    expect($student)->toBeInstanceOf(Student::class)
        ->and($student->first_name)->toBe('John')
        ->and($student->grade_level_id)->toBe($grade->id)
        ->and($student->section_id)->toBe($section->id);
});

it('throws exception when creating student with invalid grade', function () {
    $data = [
        'student_number' => '12345',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'grade_level' => 999, // Invalid
        'section' => 1,
    ];

    $this->service->createStudent($data);
})->throws(InvalidArgumentException::class, 'Selected grade level is invalid.');

it('throws exception when creating student with invalid section', function () {
    $grade = GradeLevel::factory()->create();
    
    $data = [
        'student_number' => '12345',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'grade_level' => $grade->id,
        'section' => 999, // Invalid
    ];

    $this->service->createStudent($data);
})->throws(InvalidArgumentException::class, 'Selected section is invalid.');

it('updates a student successfully', function () {
    $grade = GradeLevel::factory()->create();
    $section = Section::factory()->for($grade)->create();
    $student = Student::factory()->create([
        'grade_level_id' => $grade->id,
        'section_id' => $section->id,
    ]);

    $newGrade = GradeLevel::factory()->create();
    $newSection = Section::factory()->for($newGrade)->create();

    $data = [
        'first_name' => 'Jane',
        'grade_level' => $newGrade->id,
        'section' => $newSection->id,
    ];

    $updatedStudent = $this->service->updateStudent($student, $data);

    expect($updatedStudent->first_name)->toBe('Jane')
        ->and($updatedStudent->grade_level_id)->toBe($newGrade->id)
        ->and($updatedStudent->section_id)->toBe($newSection->id);
});

it('calculates expected fees correctly', function () {
    $grade = GradeLevel::factory()->create();
    $student = Student::factory()->create(['grade_level_id' => $grade->id]);

    FeeStructure::factory()->create([
        'grade_level_id' => $grade->id, 
        'amount' => 1000, 
        'is_active' => true,
        'fee_type' => 'Tuition'
    ]);
    FeeStructure::factory()->create([
        'grade_level_id' => $grade->id, 
        'amount' => 500, 
        'is_active' => true,
        'fee_type' => 'Miscellaneous'
    ]);
    FeeStructure::factory()->create([
        'grade_level_id' => $grade->id, 
        'amount' => 200, 
        'is_active' => false,
        'fee_type' => 'Optional'
    ]); // Should be ignored

    $expectedFees = $this->service->calculateExpectedFees($student);

    expect($expectedFees)->toBe(1500.0);
});

it('calculates balance correctly', function () {
    $grade = GradeLevel::factory()->create();
    $student = Student::factory()->create(['grade_level_id' => $grade->id]);

    FeeStructure::factory()->create(['grade_level_id' => $grade->id, 'amount' => 1000, 'is_active' => true]);

    // Payment 1
    Payment::factory()->create(['student_id' => $student->id, 'amount' => 300]);
    // Payment 2
    Payment::factory()->create(['student_id' => $student->id, 'amount' => 200]);

    $balance = $this->service->calculateBalance($student);

    // Expected: 1000 - (300 + 200) = 500
    expect($balance)->toBe(500.0);
});

it('determines payment status correctly', function () {
    $grade = GradeLevel::factory()->create();
    $student = Student::factory()->create(['grade_level_id' => $grade->id]);
    FeeStructure::factory()->create(['grade_level_id' => $grade->id, 'amount' => 1000, 'is_active' => true]);

    // Outstanding
    expect($this->service->getPaymentStatus($student))->toBe('outstanding');

    // Partial
    Payment::factory()->create(['student_id' => $student->id, 'amount' => 500]);
    $student->refresh(); // Refresh to update relations if needed, though service calculates fresh
    expect($this->service->getPaymentStatus($student))->toBe('partial');

    // Paid
    Payment::factory()->create(['student_id' => $student->id, 'amount' => 500]);
    $student->refresh();
    expect($this->service->getPaymentStatus($student))->toBe('paid');

    // Overpaid
    Payment::factory()->create(['student_id' => $student->id, 'amount' => 100]);
    $student->refresh();
    expect($this->service->getPaymentStatus($student))->toBe('overpaid');
});
