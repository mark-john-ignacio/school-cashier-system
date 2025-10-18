import { ChangeEvent, FormEventHandler, useMemo } from 'react';

import { BalanceSummary, FeeCheckbox, FeeSelectionSummary, Stepper, StudentCard } from '@/components/payments/payment-components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePaymentWizard } from '@/hooks/use-payment-wizard';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/payments';
import { create as createPayments, index as indexPayments, store as storePayment } from '@/routes/payments';
import { create as createStudent, show as showStudent } from '@/routes/students';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Student summary for payment processing
 */
interface StudentSummary {
    id: number;
    student_number: string;
    full_name: string;
    grade_level_id?: number | null;
    grade_level: string | null;
    section: string | null;
    balance: number;
    total_paid?: number;
    expected_fees?: number;
}

/**
 * Fee structure option for grade-level specific fees
 */
interface FeeStructureOption {
    id: number;
    fee_type: string;
    amount: number;
    description: string | null;
    is_required: boolean;
    school_year?: string | null;
}

/**
 * Props passed from the PaymentController
 */
interface PaymentCreationProps extends Record<string, unknown> {
    student: StudentSummary | null;
    paymentPurposes: string[];
    students: StudentSummary[];
    search: string;
    paymentMethods: { value: string; label: string }[];
    gradeLevelFees: FeeStructureOption[];
    auth: {
        user?: {
            can?: {
                createPayments?: boolean;
            };
        };
    };
}

/**
 * Payment form data structure
 */
interface PaymentFormData {
    student_id: number | null;
    amount: string;
    payment_date: string;
    payment_purpose: string;
    payment_method: 'cash' | 'check' | 'online';
    notes: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payments',
        href: indexPayments().url,
    },
    {
        title: 'Record payment',
        href: createPayments().url,
    },
];

const wizardSteps = [
    {
        id: 1,
        title: 'Select student',
        description: 'Find the payer and confirm their details.',
    },
    {
        id: 2,
        title: 'Payment details',
        description: 'Choose fees, confirm totals, and submit.',
    },
];

/**
 * Payment Creation Wizard
 * 
 * A multi-step form for recording student payments with the following features:
 * 
 * **Step 1: Student Selection**
 * - Search for students by name or student number
 * - Display student information with current balance
 * - Shows balance status (Paid, Partially Paid, Outstanding, Overpaid)
 * 
 * **Step 2: Payment Details**
 * - Select from grade-level specific fee structures
 * - Choose payment method (Cash, Check, Online)
 * - Set payment date (defaults to today)
 * - Add optional notes
 * - Real-time balance calculation
 * 
 * **Key Features:**
 * - Type-safe routing with Wayfinder
 * - Server-side validation via Inertia forms
 * - Automatic receipt number generation
 * - Fee selection based on student's grade level
 * - Balance updates in real-time
 * 
 * @component
 * 
 * @example
 * // Navigate to payment creation
 * router.visit(createPayments())
 * 
 * // With pre-selected student
 * router.visit(createPayments({ student: 123 }))
 * 
 * @remarks
 * Uses the usePaymentWizard custom hook for step management and state.
 * Form submission is handled by Inertia.js for automatic CSRF protection
 * and server-side validation.
 */
export default function CreatePayment() {
    const { student, paymentPurposes, students, search, paymentMethods, gradeLevelFees, auth } = usePage<PaymentCreationProps>().props;

    // Default to today's date for payment
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const defaultMethod = (paymentMethods[0]?.value ?? 'cash') as PaymentFormData['payment_method'];

    // Initialize Inertia form with default values
    const { data, setData, post, processing, errors, reset } = useForm<PaymentFormData>({
        student_id: student?.id ?? null,
        amount: '',
        payment_date: today,
        payment_purpose: paymentPurposes[0] ?? 'Tuition Fee',
        payment_method: defaultMethod,
        notes: '',
    });

    // Use custom payment wizard hook for step management and fee selection
    const wizard = usePaymentWizard({
        initialStudent: student,
        initialSearch: search,
        gradeLevelFees,
    });

    // Sync form student_id with wizard state when student changes
    useMemo(() => {
        if (data.student_id !== wizard.selectedStudent?.id) {
            setData('student_id', wizard.selectedStudent?.id ?? null);
        }
    }, [wizard.selectedStudent?.id]);

    // Auto-calculate amount from selected fees (unless manually overridden)
    useMemo(() => {
        if (!wizard.selectedStudent) {
            if (data.amount !== '') {
                setData('amount', '');
            }
            wizard.setAmountManuallyEdited(false);
            return;
        }

        if (wizard.amountManuallyEdited) {
            return;
        }

        const nextAmount = wizard.calculatedTotal > 0 ? wizard.calculatedTotal.toFixed(2) : '';

        if (data.amount !== nextAmount) {
            setData('amount', nextAmount);
        }
    }, [wizard.selectedStudent, wizard.calculatedTotal, wizard.amountManuallyEdited, data.amount]);

    const handleAmountInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        wizard.setAmountManuallyEdited(true);
        setData('amount', event.target.value);
    };

    const handleApplyCalculatedTotal = () => {
        wizard.resetToCalculatedTotal();
    };

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        post(storePayment().url, {
            onSuccess: () => {
                reset('amount', 'notes');
                wizard.setAmountManuallyEdited(false);
            },
        });
    };

    const parsedAmount = Number(data.amount);
    const isSubmitDisabled = !data.student_id || !data.amount || Number.isNaN(parsedAmount) || parsedAmount <= 0 || processing;

    const canCreatePayments = auth?.user?.can?.createPayments ?? false;
    const showManualOverrideBadge = wizard.amountManuallyEdited && data.amount !== '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Payment" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="space-y-4">
                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                <div>
                                    <CardTitle>Record payment</CardTitle>
                                    <CardDescription>Guided flow for accurate receipts and faster checkout.</CardDescription>
                                </div>

                                {canCreatePayments && wizard.selectedStudent && (
                                    <Button asChild variant="outline">
                                        <Link href={showStudent({ student: wizard.selectedStudent.id }).url}>View student</Link>
                                    </Button>
                                )}
                            </div>

                            <Stepper currentStep={wizard.step} steps={wizardSteps} />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {wizard.step === 1 && (
                            <div className="grid gap-6 lg:grid-cols-[1.3fr,2fr]">
                                <Card className="border-border/60">
                                    <CardHeader>
                                        <CardTitle>Selected student</CardTitle>
                                        <CardDescription>Pick a student to move on to the payment step.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        {wizard.selectedStudent ? (
                                            <StudentCard
                                                student={wizard.selectedStudent}
                                                variant="detailed"
                                                showBalance={true}
                                                onClear={wizard.handleClearStudent}
                                                onContinue={() => wizard.setStep(2)}
                                            />
                                        ) : (
                                            <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                                                No student selected yet. Search the list to get started.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-border/60">
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <CardTitle>Find a student</CardTitle>
                                                <CardDescription>Search by name, ID, or partial keywords.</CardDescription>
                                            </div>
                                            {wizard.isFetchingStudent && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="student-search">Search</Label>
                                            <Input
                                                id="student-search"
                                                value={wizard.searchQuery}
                                                onChange={(event) => wizard.setSearchQuery(event.target.value)}
                                                placeholder="e.g. Juan Dela Cruz or STU-2025-0001"
                                                autoComplete="off"
                                            />
                                        </div>

                                        <div className="grid max-h-80 gap-2 overflow-auto pr-1">
                                            {students.length === 0 && (
                                                <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
                                                    No matches yet. Keep typing to narrow the list.
                                                </div>
                                            )}

                                            {students.map((studentOption) => {
                                                const isActive = wizard.selectedStudent?.id === studentOption.id;

                                                return (
                                                    <button
                                                        key={studentOption.id}
                                                        type="button"
                                                        onClick={() => wizard.handleSelectStudent(studentOption)}
                                                        className={cn(
                                                            'flex flex-col rounded-lg border border-border/40 bg-card/60 px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5',
                                                            isActive && 'border-primary bg-primary/10 shadow-sm',
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">{studentOption.full_name}</p>
                                                                <p className="text-xs text-muted-foreground">{studentOption.student_number}</p>
                                                            </div>
                                                            <Badge variant="outline">{studentOption.grade_level ?? 'Unassigned'}</Badge>
                                                        </div>
                                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                            <span>Section {studentOption.section ?? '—'}</span>
                                                            <span>Balance: {formatCurrency(studentOption.balance)}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                            <span>
                                                Need to add a new student?{' '}
                                                <Link href={createStudent().url} className="font-medium text-primary">
                                                    Create student
                                                </Link>
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => wizard.setStep(2)}
                                                disabled={!wizard.selectedStudent || wizard.isFetchingStudent}
                                            >
                                                Continue
                                                <ArrowRight className="ml-2 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {wizard.step === 2 && wizard.selectedStudent && (
                            <div className="grid gap-6 lg:grid-cols-[1.3fr,2fr]">
                                <div className="grid gap-6">
                                    <Card className="border-border/60">
                                        <CardHeader>
                                            <CardTitle>Payment context</CardTitle>
                                            <CardDescription>Cross-check balances before submitting the payment.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-base font-semibold text-foreground">{wizard.selectedStudent.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{wizard.selectedStudent.student_number}</p>
                                                    <p className="text-xs text-muted-foreground">Section {wizard.selectedStudent.section ?? '—'}</p>
                                                </div>
                                                <Badge variant="secondary">{wizard.selectedStudent.grade_level ?? 'Unassigned'}</Badge>
                                            </div>

                                            <BalanceSummary
                                                outstandingBalance={wizard.selectedStudent.balance}
                                                expectedFees={wizard.selectedStudent.expected_fees}
                                                totalPaid={wizard.selectedStudent.total_paid}
                                            />

                                            <div className="flex flex-wrap gap-3">
                                                <Button type="button" variant="ghost" onClick={() => wizard.setStep(1)}>
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Change student
                                                </Button>
                                                <Button type="button" variant="outline" onClick={wizard.handleClearStudent}>
                                                    Clear selection
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/60">
                                        <CardHeader>
                                            <CardTitle>Billing plan</CardTitle>
                                            <CardDescription>
                                                Prefill from the grade-level fee catalog. Required fees stay selected; optional fees can be toggled.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-4">
                                            {gradeLevelFees.length === 0 ? (
                                                <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                                                    No fee structures configured for this student’s grade level. Enter the amount manually below.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {gradeLevelFees.map((fee) => (
                                                        <FeeCheckbox
                                                            key={fee.id}
                                                            fee={fee}
                                                            checked={wizard.selectedFeeIds.includes(fee.id)}
                                                            onCheckedChange={(checked) => wizard.toggleFee(fee.id, fee.is_required, Boolean(checked))}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            <FeeSelectionSummary selectedFees={wizard.selectedFees} totalAmount={wizard.calculatedTotal} />
                                        </CardContent>
                                    </Card>
                                </div>

                                <form onSubmit={submit} className="grid gap-6">
                                    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Amount to collect</p>
                                                <p className="text-2xl font-semibold text-foreground">{formatCurrency(data.amount)}</p>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                <p>Balance after payment</p>
                                                <p className="font-medium text-foreground">
                                                    {formatCurrency(wizard.selectedStudent.balance - (Number(data.amount) || 0))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <Label htmlFor="amount">
                                                    Amount <span className="text-red-500">*</span>
                                                </Label>
                                                {showManualOverrideBadge && (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
                                                    >
                                                        Manual override
                                                    </Badge>
                                                )}
                                            </div>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={data.amount}
                                                onChange={handleAmountInputChange}
                                                placeholder="0.00"
                                                required
                                            />
                                            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>You can adjust this amount for partial payments.</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleApplyCalculatedTotal}
                                                    disabled={wizard.calculatedTotal <= 0}
                                                >
                                                    Reset to {formatCurrency(wizard.calculatedTotal)}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="payment_date">
                                                    Payment date <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="payment_date"
                                                    type="date"
                                                    value={data.payment_date}
                                                    onChange={(event) => setData('payment_date', event.target.value)}
                                                    required
                                                />
                                                {errors.payment_date && <p className="text-sm text-red-500">{errors.payment_date}</p>}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="payment_purpose">
                                                    Purpose <span className="text-red-500">*</span>
                                                </Label>
                                                <Select value={data.payment_purpose} onValueChange={(value) => setData('payment_purpose', value)}>
                                                    <SelectTrigger id="payment_purpose">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {paymentPurposes.map((purposeOption) => (
                                                            <SelectItem key={purposeOption} value={purposeOption}>
                                                                {purposeOption}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.payment_purpose && <p className="text-sm text-red-500">{errors.payment_purpose}</p>}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="payment_method">Method</Label>
                                                <Select
                                                    value={data.payment_method}
                                                    onValueChange={(value) => setData('payment_method', value as PaymentFormData['payment_method'])}
                                                >
                                                    <SelectTrigger id="payment_method">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {paymentMethods.map((method) => (
                                                            <SelectItem key={method.value} value={method.value}>
                                                                {method.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.payment_method && <p className="text-sm text-red-500">{errors.payment_method}</p>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(event) => setData('notes', event.target.value)}
                                                rows={4}
                                                placeholder="Optional details, reference numbers, or special instructions"
                                            />
                                            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                                        </div>

                                        {!data.student_id && (
                                            <p className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
                                                Select a student before recording the payment.
                                            </p>
                                        )}
                                        {errors.student_id && <p className="text-sm text-red-500">{errors.student_id}</p>}
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex flex-wrap gap-3">
                                            <Button type="button" variant="ghost" onClick={() => wizard.setStep(1)}>
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to student list
                                            </Button>
                                            <Button type="button" variant="outline" asChild>
                                                <Link href={indexPayments().url}>Cancel</Link>
                                            </Button>
                                        </div>
                                        <Button type="submit" disabled={isSubmitDisabled} className="min-w-[160px]">
                                            {processing ? 'Saving...' : 'Save payment'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
