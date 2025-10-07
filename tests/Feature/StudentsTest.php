<?php

use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

it('stores and updates a student via controller routes using numeric ids', function () {
    $this->withoutExceptionHandling();

    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $user = User::factory()->create();
    Permission::firstOrCreate(['name' => 'view students', 'guard_name' => 'web']);
    $user->givePermissionTo('view students');

    $this->actingAs($user);

    $grade = GradeLevel::factory()->create(['name' => 'Grade 1']);
    $section = Section::factory()->for($grade, 'gradeLevel')->create(['name' => 'A']);

    $studentNumber = 'STU-' . (string) Str::uuid();

    $response = $this->post(route('students.store'), [
        'student_number' => $studentNumber,
        'first_name' => 'Test',
        'middle_name' => '',
        'last_name' => 'Student',
        'grade_level' => $grade->id,
        'section' => $section->id,
        'status' => 'active',
        'notes' => '',
    ]);

    $student = Student::where('student_number', $studentNumber)->first();

    expect($student)->not->toBeNull();
    expect($student->grade_level_id)->toBe($grade->id);
    expect($student->section_id)->toBe($section->id);

    $response->assertRedirect('/students/' . $student->id);

    $newGrade = GradeLevel::factory()->create(['name' => 'Grade 2']);
    $newSection = Section::factory()->for($newGrade, 'gradeLevel')->create(['name' => 'B']);

    $updateResponse = $this->put(route('students.update', $student), [
        'student_number' => $studentNumber,
        'first_name' => 'Updated',
        'middle_name' => 'M',
        'last_name' => 'Student',
        'grade_level' => $newGrade->id,
        'section' => $newSection->id,
        'status' => 'inactive',
        'notes' => 'Now inactive',
    ]);

    $updateResponse->assertRedirect('/students/' . $student->id);

    $student->refresh();

    expect($student->grade_level_id)->toBe($newGrade->id);
    expect($student->section_id)->toBe($newSection->id);
    expect($student->status)->toBe('inactive');
});
