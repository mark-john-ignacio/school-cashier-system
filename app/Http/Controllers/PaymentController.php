<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view payments')->only(['index', 'show']);
        $this->middleware('permission:create payments')->only(['create', 'store']);
        $this->middleware('permission:print receipts')->only(['receipt']);
        $this->middleware('permission:void payments')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Payment::query()->with(['student', 'user']);

        // Filter by student
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('payment_date', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('payment_date', '<=', $request->end_date);
        }

        // Filter by purpose
        if ($request->filled('payment_purpose')) {
            $query->purpose($request->payment_purpose);
        }

        // Filter by cashier
        if ($request->filled('user_id')) {
            $query->byCashier($request->user_id);
        }

        // Today's payments by default
        if (!$request->has('start_date') && !$request->has('end_date') && !$request->has('all')) {
            $query->today();
        }

        // Sort
        $sortField = $request->get('sort_field', 'payment_date');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $payments = $query->paginate(20)->withQueryString();

        // Transform data for frontend
        $payments->getCollection()->transform(function ($payment) {
            return [
                'id' => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'student' => [
                    'id' => $payment->student->id,
                    'student_number' => $payment->student->student_number,
                    'full_name' => $payment->student->full_name,
                ],
                'amount' => $payment->amount,
                'payment_date' => $payment->payment_date,
                'payment_purpose' => $payment->payment_purpose,
                'payment_method' => $payment->payment_method,
                'notes' => $payment->notes,
                'cashier' => [
                    'id' => $payment->user->id,
                    'name' => $payment->user->name,
                ],
                'printed_at' => $payment->printed_at,
                'created_at' => $payment->created_at,
            ];
        });

        // Get unique payment purposes for filter
        $paymentPurposes = Payment::select('payment_purpose')->distinct()->pluck('payment_purpose');

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => $request->only(['student_id', 'start_date', 'end_date', 'payment_purpose', 'user_id']),
            'paymentPurposes' => $paymentPurposes,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
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
                    'expected_fees' => $student->expected_fees,
                    'total_paid' => $student->total_paid,
                ];
            }
        }

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
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentRequest $request)
    {
        $payment = Payment::create([
            ...$request->validated(),
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('payments.show', $payment)
            ->with('success', 'Payment recorded successfully. Receipt Number: ' . $payment->receipt_number);
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
                'student' => [
                    'id' => $payment->student->id,
                    'student_number' => $payment->student->student_number,
                    'full_name' => $payment->student->full_name,
                    'grade_level' => $payment->student->grade_level,
                    'section' => $payment->student->section,
                ],
                'amount' => $payment->amount,
                'payment_date' => $payment->payment_date,
                'payment_purpose' => $payment->payment_purpose,
                'payment_method' => $payment->payment_method,
                'notes' => $payment->notes,
                'cashier' => [
                    'id' => $payment->user->id,
                    'name' => $payment->user->name,
                ],
                'printed_at' => $payment->printed_at,
                'created_at' => $payment->created_at,
            ],
        ]);
    }

    /**
     * Print receipt for payment
     */
    public function receipt(Payment $payment)
    {
        $payment->load(['student', 'user']);
        $payment->markAsPrinted();

        return Inertia::render('payments/receipt', [
            'payment' => [
                'id' => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'student' => [
                    'student_number' => $payment->student->student_number,
                    'full_name' => $payment->student->full_name,
                    'grade_level' => $payment->student->grade_level,
                    'section' => $payment->student->section,
                ],
                'amount' => $payment->amount,
                'payment_date' => $payment->payment_date,
                'payment_purpose' => $payment->payment_purpose,
                'payment_method' => $payment->payment_method,
                'notes' => $payment->notes,
                'cashier' => [
                    'name' => $payment->user->name,
                ],
                'printed_at' => $payment->printed_at,
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage (void payment)
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->route('payments.index')
            ->with('success', 'Payment voided successfully.');
    }
}
