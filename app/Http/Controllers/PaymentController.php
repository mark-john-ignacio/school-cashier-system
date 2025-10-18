<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    private const PAYMENT_METHOD_OPTIONS = [
        ['value' => 'cash', 'label' => 'Cash'],
        ['value' => 'check', 'label' => 'Check'],
        ['value' => 'online', 'label' => 'Online'],
    ];

    /**
     * Display a paginated listing of payments with filtering and search.
     *
     * Supports advanced filtering by student name, receipt number, date range,
     * payment purpose, cashier, and payment method. Results are paginated with
     * configurable items per page.
     *
     * @param Request $request The incoming HTTP request with query parameters
     *
     * Query Parameters:
     * - search: Student name or receipt number
     * - date_from: Start date for date range filter (Y-m-d)
     * - date_to: End date for date range filter (Y-m-d)
     * - purpose: Payment purpose to filter by
     * - cashier_id: Cashier user ID to filter by
     * - payment_method: Payment method (cash, check, online)
     * - per_page: Items per page (10, 15, 25, 50) - defaults to 15
     * - sort_field: Field to sort by - defaults to 'payment_date'
     * - sort_direction: Sort direction (asc, desc) - defaults to 'desc'
     *
     * @return \Inertia\Response Inertia response rendering 'payments/index' page
     *
     * @see Payment::search() for student search implementation
     * @see Payment::dateRange() for date range filtering
     * @see Payment::purpose() for purpose filtering
     */
    public function index(Request $request)
    {
        $query = Payment::query()->with(['student', 'user']);

        $perPageOptions = [10, 15, 25, 50];
        $defaultPerPage = 15;
        $perPage = $request->integer('per_page', $defaultPerPage);

        if (! in_array($perPage, $perPageOptions, true)) {
            $perPage = $defaultPerPage;
        }

        // Search by student name or receipt number
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                    ->orWhereHas('student', function ($studentQuery) use ($search) {
                        $studentQuery->search($search);
                    });
            });
        }

        // Filter by date range
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->dateRange($request->date_from, $request->date_to);
        }

        // Filter by payment purpose
        if ($request->filled('purpose')) {
            $query->purpose($request->purpose);
        }

        // Filter by cashier
        if ($request->filled('cashier_id')) {
            $query->byCashier($request->cashier_id);
        }

        // Filter by payment method
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Sort
        $sortField = $request->get('sort_field', 'payment_date');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

    $payments = $query->paginate($perPage)->withQueryString();

        // Transform data
        $payments->getCollection()->transform(function ($payment) {
            $student = $payment->student;
            $cashier = $payment->user;

            return [
                'id' => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'amount' => $payment->amount,
                'payment_date' => $payment->payment_date,
                'payment_purpose' => $payment->payment_purpose,
                'payment_method' => $payment->payment_method,
                'notes' => $payment->notes,
                'student' => $student ? [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'full_name' => $student->full_name,
                ] : null,
                'cashier' => $cashier ? [
                    'id' => $cashier->id,
                    'name' => $cashier->name,
                ] : null,
                'is_printed' => $payment->isPrinted(),
                'created_at' => $payment->created_at,
            ];
        });

        // Get payment purposes for filter
        $purposes = Payment::query()
            ->select('payment_purpose')
            ->whereNotNull('payment_purpose')
            ->distinct()
            ->orderBy('payment_purpose')
            ->pluck('payment_purpose')
            ->filter()
            ->values()
            ->all();

        $cashiers = User::permission(['view payments', 'create payments'])
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->unique('id')
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
            ])
            ->values()
            ->all();

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => [
                'search' => $request->input('search'),
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
                'purpose' => $request->input('purpose'),
                'cashier_id' => $request->input('cashier_id'),
                'payment_method' => $request->input('payment_method'),
                'per_page' => (string) $perPage,
            ],
            'purposes' => $purposes,
            'cashiers' => $cashiers,
            'paymentMethods' => self::PAYMENT_METHOD_OPTIONS,
            'perPageOptions' => $perPageOptions,
            'perPage' => $perPage,
            'defaultPerPage' => $defaultPerPage,
        ]);
    }

    /**
     * Show the form for creating a new payment.
     *
     * Renders the payment creation wizard with optional student pre-selection.
     * When a student_id is provided, loads the student's grade level fee structures
     * to enable quick fee selection.
     *
     * @param Request $request The incoming HTTP request
     *
     * Query Parameters:
     * - student_id: Optional student ID to pre-select in the wizard
     *
     * @return \Inertia\Response Inertia response rendering 'payments/create' page
     *
     * Props returned:
     * - student: Pre-selected student with grade level and section (if student_id provided)
     * - gradeLevelFees: Active fee structures for the student's grade level
     * - paymentMethods: Available payment method options
     *
     * @see Student::gradeLevel() for grade level relationship
     * @see FeeStructure for fee structure data
     */
    public function create(Request $request)
    {
        // If student_id is provided, pre-select the student
        $student = null;
        $gradeLevelFees = [];

        if ($request->filled('student_id')) {
            $selectedStudent = Student::query()
                ->with(['gradeLevel', 'section:id,name'])
                ->find($request->integer('student_id'));

            if ($selectedStudent) {
                $selectedStudent->loadMissing([
                    'gradeLevel.feeStructures' => function ($query) {
                        $query->where('is_active', true)
                            ->orderByDesc('is_required')
                            ->orderBy('fee_type');
                    },
                ]);

                $gradeLevelFeesCollection = $selectedStudent->gradeLevel?->feeStructures ?? collect();

                $gradeLevelFees = $gradeLevelFeesCollection
                    ->map(fn ($fee) => [
                        'id' => $fee->id,
                        'fee_type' => $fee->fee_type,
                        'amount' => (float) $fee->amount,
                        'description' => $fee->description,
                        'is_required' => (bool) $fee->is_required,
                        'school_year' => $fee->school_year,
                    ])
                    ->values()
                    ->all();

                $student = [
                    'id' => $selectedStudent->id,
                    'student_number' => $selectedStudent->student_number,
                    'full_name' => $selectedStudent->full_name,
                    'grade_level_id' => $selectedStudent->grade_level_id,
                    'grade_level' => $selectedStudent->grade_level_name,
                    'section' => $selectedStudent->section_name,
                    'balance' => $selectedStudent->balance,
                    'total_paid' => $selectedStudent->total_paid,
                    'expected_fees' => $selectedStudent->expected_fees,
                ];
            }
        }

        $studentsQuery = Student::query()
            ->select('id', 'student_number', 'first_name', 'middle_name', 'last_name', 'grade_level_id', 'section_id')
            ->with(['gradeLevel:id,name', 'section:id,name'])
            ->orderBy('last_name');

        if ($request->filled('search')) {
            $studentsQuery->search($request->string('search'));
        } else {
            $studentsQuery->latest();
        }

        $students = $studentsQuery
            ->limit(10)
            ->get()
            ->map(fn (Student $studentOption) => [
                'id' => $studentOption->id,
                'student_number' => $studentOption->student_number,
                'full_name' => $studentOption->full_name,
                'grade_level' => $studentOption->grade_level_name,
                'section' => $studentOption->section_name,
                'balance' => $studentOption->balance,
            ])
            ->all();

        $paymentPurposes = [
            'Tuition Fee',
            'Miscellaneous Fee',
            'Books',
            'Uniforms',
            'Laboratory Fee',
            'Field Trip',
            'Events',
            'Other',
        ];

        return Inertia::render('payments/create', [
            'student' => $student,
            'paymentPurposes' => $paymentPurposes,
            'students' => $students,
            'search' => $request->string('search')->toString(),
            'paymentMethods' => self::PAYMENT_METHOD_OPTIONS,
            'gradeLevelFees' => $gradeLevelFees,
        ]);
    }

    /**
     * Store a newly created payment record in the database.
     *
     * Validates the payment data, creates a new payment record with an auto-generated
     * receipt number, and associates it with the authenticated cashier.
     *
     * @param Request $request The incoming HTTP request with payment data
     *
     * Validated Fields:
     * - student_id: Required, must exist in students table
     * - amount: Required, numeric, minimum 0.01
     * - payment_date: Required, valid date
     * - payment_purpose: Required, string, max 255 characters
     * - payment_method: Optional, must be 'cash', 'check', or 'online' (defaults to 'cash')
     * - notes: Optional, string
     *
     * @return \Illuminate\Http\RedirectResponse Redirects to payment detail page
     *
     * @see Payment::generateReceiptNumber() for receipt number generation
     * @see Payment::$fillable for fillable attributes
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'payment_purpose' => ['required', 'string', 'max:255'],
            'payment_method' => ['sometimes', 'in:cash,check,online'],
            'notes' => ['nullable', 'string'],
        ]);

        $payment = Payment::create([
            ...$validated,
            'user_id' => auth()->id(),
            'payment_method' => $validated['payment_method'] ?? 'cash',
        ]);

        return redirect()->route('payments.show', $payment)
            ->with('success', 'Payment recorded successfully.');
    }

    /**
     * Display the detailed information for a specific payment.
     *
     * Loads the payment with related student, grade level, section, and cashier data.
     * Renders the payment receipt view with all transaction details.
     *
     * @param Payment $payment The payment model instance (route model binding)
     *
     * @return \Inertia\Response Inertia response rendering 'payments/show' page
     *
     * Props returned:
     * - payment: Complete payment details including receipt number, amount, date, method
     * - payment.student: Student information with grade level and section
     * - payment.cashier: Cashier (user) who processed the payment
     *
     * @see Payment::student() for student relationship
     * @see Payment::user() for cashier relationship
     */
    public function show(Payment $payment)
    {
    $payment->load(['student.gradeLevel', 'student.section', 'user']);

        return Inertia::render('payments/show', [
            'payment' => [
                'id' => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'amount' => $payment->amount,
                'payment_date' => $payment->payment_date,
                'payment_purpose' => $payment->payment_purpose,
                'payment_method' => $payment->payment_method,
                'notes' => $payment->notes,
                'student' => [
                    'id' => $payment->student->id,
                    'student_number' => $payment->student->student_number,
                    'full_name' => $payment->student->full_name,
                    'grade_level' => $payment->student->grade_level_name ?? 'Unassigned',
                    'section' => $payment->student->section_name ?? 'Unassigned',
                ],
                'cashier' => [
                    'id' => $payment->user->id,
                    'name' => $payment->user->name,
                ],
                'is_printed' => $payment->isPrinted(),
                'printed_at' => $payment->printed_at,
                'created_at' => $payment->created_at,
            ],
        ]);
    }

    /**
     * Mark receipt as printed
     */
    public function print(Payment $payment)
    {
        $payment->markAsPrinted();

        return redirect()->route('payments.show', $payment)
            ->with('success', 'Receipt marked as printed.');
    }

    /**
     * Remove the specified resource from storage (soft delete for audit).
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->route('payments.index')
            ->with('success', 'Payment voided successfully.');
    }
}

