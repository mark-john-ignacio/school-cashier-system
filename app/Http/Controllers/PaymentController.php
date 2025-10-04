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

    public function __construct()
    {
        $this->middleware('permission:view payments')->only(['index', 'show']);
        $this->middleware('permission:create payments')->only(['create', 'store']);
        $this->middleware('permission:void payments')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Payment::query()->with(['student', 'user']);

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

        $payments = $query->paginate(20)->withQueryString();

        // Transform data
        $payments->getCollection()->transform(function ($payment) {
            return [
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
                ],
                'cashier' => [
                    'id' => $payment->user->id,
                    'name' => $payment->user->name,
                ],
                'is_printed' => $payment->isPrinted(),
                'created_at' => $payment->created_at,
            ];
        });

        // Get payment purposes for filter
        $purposes = Payment::select('payment_purpose')->distinct()->pluck('payment_purpose');

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
            'filters' => $request->only(['search', 'date_from', 'date_to', 'purpose', 'cashier_id', 'payment_method']),
            'purposes' => $purposes,
            'cashiers' => $cashiers,
            'paymentMethods' => self::PAYMENT_METHOD_OPTIONS,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        // If student_id is provided, pre-select the student
        $student = null;
        if ($request->filled('student_id')) {
            $student = Student::find($request->student_id);
            if ($student) {
                $student = [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'full_name' => $student->full_name,
                    'grade_level' => $student->grade_level,
                    'section' => $student->section,
                    'balance' => $student->balance,
                    'total_paid' => $student->total_paid,
                    'expected_fees' => $student->expected_fees,
                ];
            }
        }

        $studentsQuery = Student::query()
            ->select('id', 'student_number', 'first_name', 'middle_name', 'last_name', 'grade_level', 'section')
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
                'grade_level' => $studentOption->grade_level,
                'section' => $studentOption->section,
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
        ]);
    }

    /**
     * Store a newly created resource in storage.
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
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        $payment->load(['student', 'user']);

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
                    'grade_level' => $payment->student->grade_level,
                    'section' => $payment->student->section,
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

