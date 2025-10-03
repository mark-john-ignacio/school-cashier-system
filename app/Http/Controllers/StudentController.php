<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view students')->only(['index', 'show']);
        $this->middleware('permission:create students')->only(['create', 'store']);
        $this->middleware('permission:edit students')->only(['edit', 'update']);
        $this->middleware('permission:delete students')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Student::query()->with(['payments']);

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by grade level
        if ($request->filled('grade_level')) {
            $query->gradeLevel($request->grade_level);
        }

        // Filter by section
        if ($request->filled('section')) {
            $query->section($request->section);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $students = $query->paginate(15)->withQueryString();

        // Add computed attributes
        $students->getCollection()->transform(function ($student) {
            return [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'full_name' => $student->full_name,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'grade_level' => $student->grade_level,
                'section' => $student->section,
                'status' => $student->status,
                'total_paid' => $student->total_paid,
                'expected_fees' => $student->expected_fees,
                'balance' => $student->balance,
                'payment_status' => $student->payment_status,
                'created_at' => $student->created_at,
            ];
        });

        // Get unique grade levels and sections for filters
        $gradeLevels = Student::select('grade_level')->distinct()->pluck('grade_level');
        $sections = Student::select('section')->distinct()->pluck('section');

        return Inertia::render('students/index', [
            'students' => $students,
            'filters' => $request->only(['search', 'grade_level', 'section', 'status']),
            'gradeLevels' => $gradeLevels,
            'sections' => $sections,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $gradeLevels = [
            'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
            'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
        ];

        return Inertia::render('students/create', [
            'gradeLevels' => $gradeLevels,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStudentRequest $request)
    {
        $student = Student::create($request->validated());

        return redirect()->route('students.show', $student)
            ->with('success', 'Student added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
        $student->load(['payments.user']);

        $paymentHistory = $student->payments()->orderBy('payment_date', 'desc')->get();

        return Inertia::render('students/show', [
            'student' => [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'full_name' => $student->full_name,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'grade_level' => $student->grade_level,
                'section' => $student->section,
                'contact_number' => $student->contact_number,
                'email' => $student->email,
                'parent_name' => $student->parent_name,
                'parent_contact' => $student->parent_contact,
                'parent_email' => $student->parent_email,
                'status' => $student->status,
                'notes' => $student->notes,
                'total_paid' => $student->total_paid,
                'expected_fees' => $student->expected_fees,
                'balance' => $student->balance,
                'payment_status' => $student->payment_status,
                'created_at' => $student->created_at,
            ],
            'paymentHistory' => $paymentHistory->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'receipt_number' => $payment->receipt_number,
                    'amount' => $payment->amount,
                    'payment_date' => $payment->payment_date,
                    'payment_purpose' => $payment->payment_purpose,
                    'payment_method' => $payment->payment_method,
                    'notes' => $payment->notes,
                    'cashier_name' => $payment->user->name,
                    'created_at' => $payment->created_at,
                ];
            }),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Student $student)
    {
        $gradeLevels = [
            'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
            'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
        ];

        return Inertia::render('students/edit', [
            'student' => $student,
            'gradeLevels' => $gradeLevels,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());

        return redirect()->route('students.show', $student)
            ->with('success', 'Student updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        $student->delete();

        return redirect()->route('students.index')
            ->with('success', 'Student deactivated successfully.');
    }
}
