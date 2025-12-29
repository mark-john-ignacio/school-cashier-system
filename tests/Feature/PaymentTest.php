<?php

use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    
    $this->user = User::factory()->create();
    Permission::firstOrCreate(['name' => 'create payments', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'view payments', 'guard_name' => 'web']);
    $this->user->givePermissionTo(['create payments', 'view payments']);
    
    $this->student = Student::factory()->create();
});

it('can store a payment', function () {
    $this->actingAs($this->user);

    $response = $this->post(route('payments.store'), [
        'student_id' => $this->student->id,
        'amount' => 1000,
        'payment_date' => '2025-01-01',
        'payment_purpose' => 'Tuition Fee',
        'payment_method' => 'cash',
        'notes' => 'Test payment',
    ]);

    $response->assertRedirect();
    
    $this->assertDatabaseHas('payments', [
        'student_id' => $this->student->id,
        'amount' => 1000,
        'payment_purpose' => 'Tuition Fee',
        'user_id' => $this->user->id,
    ]);
});

it('validates payment input', function () {
    $this->actingAs($this->user);

    $response = $this->post(route('payments.store'), [
        'student_id' => 999, // Invalid
        'amount' => -100, // Invalid
        'payment_date' => 'not-a-date', // Invalid
        'payment_purpose' => '', // Invalid
    ]);

    $response->assertSessionHasErrors(['student_id', 'amount', 'payment_date', 'payment_purpose']);
});

it('authorizes payment creation', function () {
    $userWithoutPermission = User::factory()->create();
    $this->actingAs($userWithoutPermission);

    $response = $this->post(route('payments.store'), [
        'student_id' => $this->student->id,
        'amount' => 1000,
        'payment_date' => '2025-01-01',
        'payment_purpose' => 'Tuition Fee',
    ]);

    $response->assertForbidden();
});
