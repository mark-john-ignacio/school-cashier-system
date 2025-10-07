import { FormEventHandler, useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { create as createPayments, index as indexPayments, store as storePayment } from '@/routes/payments';
import { create as createStudent, show as showStudent } from '@/routes/students';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

interface StudentSummary {
    id: number;
    student_number: string;
    full_name: string;
    grade_level: string | null;
    section: string | null;
    balance: number;
    total_paid?: number;
    expected_fees?: number;
}

interface PaymentCreationProps extends Record<string, unknown> {
    student: StudentSummary | null;
    paymentPurposes: string[];
    students: StudentSummary[];
    search: string;
    paymentMethods: { value: string; label: string }[];
    auth: {
        user?: {
            can?: {
                createPayments?: boolean;
            };
        };
    };
}

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

export default function CreatePayment() {
    const { student, paymentPurposes, students, search, paymentMethods, auth } = usePage<PaymentCreationProps>().props;

    const today = new Date().toISOString().slice(0, 10);
    const defaultMethod = (paymentMethods[0]?.value ?? 'cash') as PaymentFormData['payment_method'];

    const { data, setData, post, processing, errors, reset } = useForm<PaymentFormData>({
        student_id: student?.id ?? null,
        amount: '',
        payment_date: today,
        payment_purpose: paymentPurposes[0] ?? 'Tuition Fee',
        payment_method: defaultMethod,
        notes: '',
    });

    const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(student);
    const [searchQuery, setSearchQuery] = useState(search ?? '');
    const searchInitializedRef = useRef(false);

    useEffect(() => {
        setSelectedStudent(student);
        setData('student_id', student?.id ?? null);
    }, [student, setData]);

    useEffect(() => {
        setSearchQuery(search ?? '');
    }, [search]);

    useEffect(() => {
        if (!searchInitializedRef.current) {
            searchInitializedRef.current = true;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                createPayments({
                    query: {
                        search: searchQuery || undefined,
                        student_id: data.student_id ?? undefined,
                    },
                }).url,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['students', 'search'],
                },
            );
        }, 250);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleSelectStudent = (studentOption: StudentSummary) => {
        setSelectedStudent(studentOption);
        setData('student_id', studentOption.id);
    };

    const handleClearStudent = () => {
        setSelectedStudent(null);
        setData('student_id', null);
    };

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        post(storePayment().url, {
            onSuccess: () => {
                reset('amount', 'notes');
            },
        });
    };

    const isSubmitDisabled = !data.student_id || !data.amount || processing;

    const displayBalance = useMemo(() => selectedStudent?.balance ?? 0, [selectedStudent]);

    const canCreatePayments = auth?.user?.can?.createPayments ?? false;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Payment" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <CardTitle>Record payment</CardTitle>
                                <CardDescription>Search a student and capture their payment in under 30 seconds.</CardDescription>
                            </div>

                            {canCreatePayments && selectedStudent && (
                                <Button asChild variant="outline">
                                    <Link href={showStudent({ student: selectedStudent.id }).url}>View student</Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 lg:grid-cols-5">
                            <div className="grid gap-6 lg:col-span-2">
                                <Card className="border-border/60">
                                    <CardHeader>
                                        <CardTitle>Selected student</CardTitle>
                                        <CardDescription>Choose a student to tie this payment to.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        {selectedStudent ? (
                                            <div className="flex flex-col gap-4 rounded-lg border border-border/50 bg-muted/40 p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-base font-semibold text-foreground">{selectedStudent.full_name}</p>
                                                        <p className="text-sm text-muted-foreground">{selectedStudent.student_number}</p>
                                                    </div>
                                                    <Badge variant="secondary">{selectedStudent.grade_level ?? 'Unassigned'}</Badge>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Section</span>
                                                        <p className="font-medium text-foreground">{selectedStudent.section ?? 'Unassigned'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Balance</span>
                                                        <p
                                                            className={`font-semibold ${displayBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                                                        >
                                                            ₱{Math.abs(displayBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-muted-foreground">After this payment</span>
                                                        <p className="text-sm text-muted-foreground">New balance updates automatically once saved.</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <Button type="button" variant="ghost" onClick={handleClearStudent}>
                                                        Clear selection
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                                                No student selected yet. Pick a student from the list to begin.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-border/60">
                                    <CardHeader>
                                        <CardTitle>Find a student</CardTitle>
                                        <CardDescription>Search by name or student number.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="student-search">Search</Label>
                                            <Input
                                                id="student-search"
                                                value={searchQuery}
                                                onChange={(event) => setSearchQuery(event.target.value)}
                                                placeholder="e.g. Juan Dela Cruz or STU-2025-0001"
                                                autoComplete="off"
                                            />
                                        </div>

                                        <div className="grid max-h-72 gap-2 overflow-auto">
                                            {students.length === 0 && (
                                                <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
                                                    No matches yet. Keep typing to narrow the list.
                                                </div>
                                            )}

                                            {students.map((studentOption) => (
                                                <button
                                                    key={studentOption.id}
                                                    type="button"
                                                    onClick={() => handleSelectStudent(studentOption)}
                                                    className="flex flex-col rounded-lg border border-border/40 bg-card/60 px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5"
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
                                                        <span>
                                                            Balance: ₱{studentOption.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            Need to add a new student?{' '}
                                            <Link href={createStudent().url} className="font-medium text-primary">
                                                Create student
                                            </Link>
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <form onSubmit={submit} className="grid gap-6 lg:col-span-3">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold">Payment details</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Enter the payment information exactly as reflected on the receipt.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <Label htmlFor="amount">
                                                Amount <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={data.amount}
                                                onChange={(event) => setData('amount', event.target.value)}
                                                placeholder="0.00"
                                                required
                                            />
                                            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                        </div>

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

                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={indexPayments().url}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={isSubmitDisabled}>
                                        {processing ? 'Saving...' : 'Save payment'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
