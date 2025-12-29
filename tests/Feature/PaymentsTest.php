<?php

use App\Models\GradeLevel;
use App\Models\Payment;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $this->user = User::factory()->create();
    
    // Create permissions
    Permission::firstOrCreate(['name' => 'view payments', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'create payments', 'guard_name' => 'web']);
    
    $this->user->givePermissionTo(['view payments', 'create payments']);

    // Setup student with grade/section
    $this->gradeLevel = GradeLevel::factory()->create();
    $this->section = Section::factory()->create(['grade_level_id' => $this->gradeLevel->id]);
    $this->student = Student::factory()->create([
        'grade_level_id' => $this->gradeLevel->id,
        'section_id' => $this->section->id,
    ]);
});

it('allows authorized user to view payments index', function () {
    $this->actingAs($this->user)
        ->get(route('payments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('payments/index')
        );
});

it('allows authorized user to create a payment with valid data', function () {
    $paymentData = [
        'student_id' => $this->student->id,
        'amount' => 1500.50,
        'payment_date' => now()->toDateString(),
        'payment_purpose' => 'Tuition Fee',
        'payment_method' => 'cash',
        'notes' => 'First installment',
    ];

    $this->actingAs($this->user)
        ->post(route('payments.store'), $paymentData)
        ->assertRedirect();

    $this->assertDatabaseHas('payments', [
        'student_id' => $this->student->id,
        'amount' => 1500.50,
        'payment_purpose' => 'Tuition Fee',
        'user_id' => $this->user->id,
    ]);
});

it('prevents unauthorized user from creating payments', function () {
    $unauthorizedUser = User::factory()->create();
    
    $paymentData = [
        'student_id' => $this->student->id,
        'amount' => 1000,
        'payment_date' => now()->toDateString(),
        'payment_purpose' => 'Tuition Fee',
        'payment_method' => 'cash',
    ];

    $this->actingAs($unauthorizedUser)
        ->post(route('payments.store'), $paymentData)
        ->assertForbidden();
        
    $this->assertDatabaseCount('payments', 0);
});

it('validates required fields for payment creation', function () {
    $this->actingAs($this->user)
        ->post(route('payments.store'), [])
        ->assertSessionHasErrors(['student_id', 'amount', 'payment_date', 'payment_purpose']);
});

it('generates unique receipt numbers for payments', function () {
    // Create first payment
    $this->actingAs($this->user)
        ->post(route('payments.store'), [
            'student_id' => $this->student->id,
            'amount' => 1000,
            'payment_date' => now()->toDateString(),
            'payment_purpose' => 'Fee 1',
            'payment_method' => 'cash',
        ]);
        
    $payment1 = Payment::first();
    expect($payment1->receipt_number)->not->toBeNull();
    
    // Create second payment
    $this->actingAs($this->user)
        ->post(route('payments.store'), [
            'student_id' => $this->student->id,
            'amount' => 2000,
            'payment_date' => now()->toDateString(),
            'payment_purpose' => 'Fee 2',
            'payment_method' => 'cash',
        ]);
        
    $payment2 = Payment::where('id', '!=', $payment1->id)->first();
    expect($payment2->receipt_number)->not->toBeNull();
    expect($payment2->receipt_number)->not->toBe($payment1->receipt_number);
});

it('correctly associates payments with students and users', function () {
    $this->actingAs($this->user)
        ->post(route('payments.store'), [
            'student_id' => $this->student->id,
            'amount' => 500,
            'payment_date' => now()->toDateString(),
            'payment_purpose' => 'Misc Fee',
            'payment_method' => 'cash',
        ]);
        
    $payment = Payment::first();
    
    expect($payment->student_id)->toBe($this->student->id);
    expect($payment->user_id)->toBe($this->user->id);
    expect($payment->student->id)->toBe($this->student->id);
    expect($payment->user->id)->toBe($this->user->id);
});
