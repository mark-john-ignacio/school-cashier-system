<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Student::query()->with(['payments', 'gradeLevel', 'section']);

        $perPageOptions = [10, 15, 25, 50];
        $defaultPerPage = 15;
        $perPage = $request->integer('per_page', $defaultPerPage);

        if (! in_array($perPage, $perPageOptions, true)) {
            $perPage = $defaultPerPage;
        }

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

    $students = $query->paginate($perPage)->withQueryString();

        // Add computed attributes
        $students->getCollection()->transform(function ($student) {
            return [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'full_name' => $student->full_name,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'grade_level' => $student->grade_level_name ?? '—',
                'section' => $student->section_name ?? '—',
                'status' => $student->status,
                'total_paid' => $student->total_paid,
                'expected_fees' => $student->expected_fees,
                'balance' => $student->balance,
                'payment_status' => $student->payment_status,
                'created_at' => $student->created_at,
            ];
        });


        // Get grade levels for filter
        $gradeLevels = GradeLevel::query()
            ->orderBy('display_order')
            ->orderBy('name')
            ->pluck('name');

        // Get sections grouped by grade level for filter
        $sectionsByGrade = GradeLevel::with(['sections' => function ($q) {
            $q->orderBy('display_order')->orderBy('name');
        }])
        ->orderBy('display_order')
        ->orderBy('name')
        ->get()
        ->mapWithKeys(function ($grade) {
            return [$grade->name => $grade->sections->pluck('name')->all()];
        })
        ->toArray();

        return Inertia::render('students/index', [
            'students' => $students,
            'filters' => $request->only(['search', 'grade_level', 'section', 'status', 'per_page']),
            'gradeLevels' => $gradeLevels,
            'sectionsByGrade' => $sectionsByGrade,
            'perPageOptions' => $perPageOptions,
            'perPage' => $perPage,
            'defaultPerPage' => $defaultPerPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $gradeLevels = GradeLevel::query()
            ->with(['sections' => function ($query) {
                $query->orderBy('display_order')->orderBy('name');
            }])
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        $gradeLevelOptions = $gradeLevels->map(fn ($g) => ['id' => $g->id, 'name' => $g->name])->all();

        $sectionsByGrade = $gradeLevels
            ->mapWithKeys(fn ($grade) => [$grade->id => $grade->sections->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->all()])
            ->toArray();

        return Inertia::render('students/create', [
            'gradeLevels' => $gradeLevelOptions,
            'sectionsByGrade' => $sectionsByGrade,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStudentRequest $request)
    {
        $data = $request->validated();

        // Resolve grade level to id
        $gradeInput = $data['grade_level'] ?? null;
        $grade = null;
        if ($gradeInput !== null) {
            if (is_numeric($gradeInput)) {
                $grade = GradeLevel::find((int) $gradeInput);
            } else {
                $grade = GradeLevel::where('name', $gradeInput)
                    ->orWhere('slug', $gradeInput)
                    ->first();
            }
        }

        if (! $grade) {
            return back()->withErrors(['grade_level' => 'Selected grade level is invalid'])->withInput();
        }

        // Resolve section to id (prefer section within grade level)
        $sectionInput = $data['section'] ?? null;
        $section = null;
        if ($sectionInput !== null) {
            if (is_numeric($sectionInput)) {
                $section = Section::find((int) $sectionInput);
            } else {
                $q = Section::where('name', $sectionInput)->orWhere('slug', $sectionInput);
                if ($grade) {
                    $q->where('grade_level_id', $grade->id);
                }
                $section = $q->first();
            }
        }

        if (! $section) {
            return back()->withErrors(['section' => 'Selected section is invalid'])->withInput();
        }

        // Prepare payload for mass assignment
        $payload = $data;
        $payload['grade_level_id'] = $grade->id;
        $payload['section_id'] = $section->id;
        unset($payload['grade_level'], $payload['section']);

        $student = Student::create($payload);

        return redirect('/students/' . $student->id)
            ->with('success', 'Student added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
    $student->load(['payments.user', 'gradeLevel', 'section']);

        $paymentHistory = $student->payments()->orderBy('payment_date', 'desc')->get();

        return Inertia::render('students/show', [
            'student' => [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'full_name' => $student->full_name,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'grade_level' => $student->grade_level_name ?? '—',
                'section' => $student->section_name ?? '—',
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
        $student->load(['gradeLevel', 'section']);

        $gradeLevels = GradeLevel::query()
            ->with(['sections' => function ($query) {
                $query->orderBy('display_order')->orderBy('name');
            }])
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        $gradeLevelOptions = $gradeLevels->map(fn ($g) => ['id' => $g->id, 'name' => $g->name])->all();

        $sectionsByGrade = $gradeLevels
            ->mapWithKeys(fn ($grade) => [$grade->id => $grade->sections->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->all()])
            ->toArray();

        return Inertia::render('students/edit', [
            'student' => [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'grade_level' => $student->gradeLevel?->id ?? '',
                'section' => $student->section?->id ?? '',
                'contact_number' => $student->contact_number,
                'email' => $student->email,
                'parent_name' => $student->parent_name,
                'parent_contact' => $student->parent_contact,
                'parent_email' => $student->parent_email,
                'status' => $student->status,
                'notes' => $student->notes,
            ],
            'gradeLevels' => $gradeLevelOptions,
            'sectionsByGrade' => $sectionsByGrade,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStudentRequest $request, Student $student)
    {
        $data = $request->validated();

        // Resolve grade level to id
        $gradeInput = $data['grade_level'] ?? null;
        $grade = null;
        if ($gradeInput !== null) {
            if (is_numeric($gradeInput)) {
                $grade = GradeLevel::find((int) $gradeInput);
            } else {
                $grade = GradeLevel::where('name', $gradeInput)
                    ->orWhere('slug', $gradeInput)
                    ->first();
            }
        }

        if (! $grade) {
            return back()->withErrors(['grade_level' => 'Selected grade level is invalid'])->withInput();
        }

        // Resolve section to id (prefer section within grade level)
        $sectionInput = $data['section'] ?? null;
        $section = null;
        if ($sectionInput !== null) {
            if (is_numeric($sectionInput)) {
                $section = Section::find((int) $sectionInput);
            } else {
                $q = Section::where('name', $sectionInput)->orWhere('slug', $sectionInput);
                if ($grade) {
                    $q->where('grade_level_id', $grade->id);
                }
                $section = $q->first();
            }
        }

        if (! $section) {
            return back()->withErrors(['section' => 'Selected section is invalid'])->withInput();
        }

        // Prepare payload for update and assign explicitly to avoid mass-assignment surprises
        $payload = $data;
        unset($payload['grade_level'], $payload['section']);

        $student->fill($payload);
        $student->grade_level_id = $grade->id;
        $student->section_id = $section->id;
        $student->save();

        return redirect('/students/' . $student->id)
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
