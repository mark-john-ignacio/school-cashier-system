<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\GradeLevel;
use App\Models\Section;
use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use InvalidArgumentException;

class StudentController extends Controller
{
    public function __construct(protected StudentService $studentService)
    {
    }

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

        $gradeLevelFilterInput = $request->input('grade_level');
        $resolvedGradeLevel = $this->studentService->resolveGradeLevel($gradeLevelFilterInput);

        // Filter by grade level
        if ($request->filled('grade_level')) {
            $query->gradeLevel($gradeLevelFilterInput);
        }

        $sectionFilterInput = $request->input('section');
        $resolvedSection = $this->studentService->resolveSection($sectionFilterInput, $resolvedGradeLevel?->id);

        // Filter by section
        if ($request->filled('section')) {
            $query->section($sectionFilterInput);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $students = StudentResource::collection($query->paginate($perPage)->withQueryString());

        $gradeLevels = GradeLevel::query()
            ->with(['sections' => function ($query) {
                $query->orderBy('display_order')->orderBy('name');
            }])
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        $gradeLevelOptions = $gradeLevels
            ->map(fn ($grade) => [
                'id' => $grade->id,
                'name' => $grade->name,
            ])
            ->all();

        $sectionsByGrade = $gradeLevels
            ->mapWithKeys(fn ($grade) => [
                (string) $grade->id => $grade->sections->map(fn ($section) => [
                    'id' => $section->id,
                    'name' => $section->name,
                ])->all(),
            ])
            ->toArray();

        return Inertia::render('students/index', [
            'students' => $students,
            'filters' => [
                'search' => $request->input('search'),
                'grade_level' => $resolvedGradeLevel?->id ? (string) $resolvedGradeLevel->id : '',
                'section' => $resolvedSection?->id ? (string) $resolvedSection->id : '',
                'status' => $request->input('status'),
                'per_page' => (string) $perPage,
            ],
            'gradeLevels' => $gradeLevelOptions,
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
        try {
            $student = $this->studentService->createStudent($request->validated());

            return redirect('/students/' . $student->id)
                ->with('success', 'Student added successfully.');
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
        $student->load(['payments.user', 'gradeLevel', 'section']);

        $paymentHistory = $student->payments()->orderBy('payment_date', 'desc')->get();

        return Inertia::render('students/show', [
            'student' => new StudentResource($student),
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
            'student' => new StudentResource($student),
            'gradeLevels' => $gradeLevelOptions,
            'sectionsByGrade' => $sectionsByGrade,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStudentRequest $request, Student $student)
    {
        try {
            $this->studentService->updateStudent($student, $request->validated());

            return redirect('/students/' . $student->id)
                ->with('success', 'Student updated successfully.');
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
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
