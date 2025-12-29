<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Models\Payment;
use App\Models\Student;
use App\Services\PaymentService;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    private const PAYMENT_METHOD_OPTIONS = [
        ['value' => 'cash', 'label' => 'Cash'],
        ['value' => 'check', 'label' => 'Check'],
        ['value' => 'online', 'label' => 'Online'],
    ];

    public function __construct(
        protected PaymentService $paymentService,
        protected StudentService $studentService
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'date_from', 'date_to', 'purpose', 'cashier_id', 'payment_method']);
        $perPage = $request->integer('per_page', 15);
        $sortField = $request->get('sort_field', 'payment_date');
        $sortDirection = $request->get('sort_direction', 'desc');

        $payments = $this->paymentService->getPayments($filters, $perPage, $sortField, $sortDirection);

        $payments->getCollection()->transform(fn ($payment) => [
            'id' => $payment->id,
            'receipt_number' => $payment->receipt_number,
            'amount' => $payment->amount,
            'payment_date' => $payment->payment_date,
            'payment_purpose' => $payment->payment_purpose,
            'payment_method' => $payment->payment_method,
            'notes' => $payment->notes,
            'student' => $payment->student ? [
                'id' => $payment->student->id,
                'student_number' => $payment->student->student_number,
                'full_name' => $payment->student->full_name,
            ] : null,
            'cashier' => $payment->user ? ['id' => $payment->user->id, 'name' => $payment->user->name] : null,
            'is_printed' => $payment->isPrinted(),
            'created_at' => $payment->created_at,
        ]);

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => [
                ...$filters,
                'per_page' => (string) $perPage,
            ],
            'purposes' => $this->paymentService->getPaymentPurposes(),
            'cashiers' => $this->paymentService->getCashiers(),
            'paymentMethods' => self::PAYMENT_METHOD_OPTIONS,
            'perPageOptions' => [10, 15, 25, 50],
            'perPage' => $perPage,
            'defaultPerPage' => 15,
        ]);
    }

    public function create(Request $request)
    {
        $student = null;
        $gradeLevelFees = [];

        if ($request->filled('student_id')) {
            $selectedStudent = $this->studentService->getStudentWithFees($request->integer('student_id'));

            if ($selectedStudent) {
                $gradeLevelFees = ($selectedStudent->gradeLevel?->feeStructures ?? collect())
                    ->map(fn ($fee) => [
                        'id' => $fee->id,
                        'fee_type' => $fee->fee_type,
                        'amount' => (float) $fee->amount,
                        'description' => $fee->description,
                        'is_required' => (bool) $fee->is_required,
                        'school_year' => $fee->school_year,
                    ])->values()->all();

                $student = [
                    'id' => $selectedStudent->id,
                    'student_number' => $selectedStudent->student_number,
                    'full_name' => $selectedStudent->full_name,
                    'grade_level_id' => $selectedStudent->grade_level_id,
                    'grade_level' => $selectedStudent->grade_level_name,
                    'section' => $selectedStudent->section_name,
                    'balance' => $this->studentService->calculateBalance($selectedStudent),
                    'total_paid' => $selectedStudent->total_paid,
                    'expected_fees' => $this->studentService->calculateExpectedFees($selectedStudent),
                ];
            }
        }

        $students = $this->studentService->searchStudents($request->string('search')->toString())
            ->map(fn ($s) => [
                'id' => $s->id,
                'student_number' => $s->student_number,
                'full_name' => $s->full_name,
                'grade_level' => $s->grade_level_name,
                'section' => $s->section_name,
                'balance' => $this->studentService->calculateBalance($s),
            ])->all();

        return Inertia::render('payments/create', [
            'student' => $student,
            'paymentPurposes' => ['Tuition Fee', 'Miscellaneous Fee', 'Books', 'Uniforms', 'Laboratory Fee', 'Field Trip', 'Events', 'Other'],
            'students' => $students,
            'search' => $request->string('search')->toString(),
            'paymentMethods' => self::PAYMENT_METHOD_OPTIONS,
            'gradeLevelFees' => $gradeLevelFees,
        ]);
    }

    public function store(StorePaymentRequest $request)
    {
        $student = Student::findOrFail($request->validated('student_id'));
        $payment = $this->paymentService->recordPayment($student, $request->user(), $request->validated());

        return redirect()->route('payments.show', $payment)
            ->with('success', 'Payment recorded successfully.');
    }

    public function show(Payment $payment)
    {
        $payment = $this->paymentService->getPaymentDetails($payment);

        return Inertia::render('payments/show', [
            'payment' => [
                'id' => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'amount' => $payment->amount,
                'payment_date' => $payment->payment_date,
                'payment_purpose' => $payment->payment_purpose,
                'payment_method' => $payment->payment_method,
                'notes' => $payment->notes,
                'student' => $payment->student ? [
                    'id' => $payment->student->id,
                    'student_number' => $payment->student->student_number,
                    'full_name' => $payment->student->full_name,
                    'grade_level' => $payment->student->grade_level_name,
                    'section' => $payment->student->section_name,
                ] : null,
                'cashier' => $payment->user ? ['id' => $payment->user->id, 'name' => $payment->user->name] : null,
                'is_printed' => $payment->isPrinted(),
                'created_at' => $payment->created_at,
            ],
        ]);
    }

    public function print(Payment $payment)
    {
        $this->paymentService->markReceiptPrinted($payment);
        return back()->with('success', 'Receipt marked as printed.');
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->route('payments.index')
            ->with('success', 'Payment voided successfully.');
    }
}

