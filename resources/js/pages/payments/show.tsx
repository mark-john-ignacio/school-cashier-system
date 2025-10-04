import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
    create as createPayment,
    destroy as destroyPaymentRoute,
    index as indexPayments,
    print as printPayment,
    show as showPayment,
} from '@/routes/payments';
import { show as showStudent } from '@/routes/students';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

interface PaymentDetail extends Record<string, unknown> {
    id: number;
    receipt_number: string;
    amount: number;
    payment_date: string;
    payment_purpose: string;
    payment_method: string;
    notes?: string | null;
    student: {
        id: number;
        student_number: string;
        full_name: string;
        grade_level: string;
        section: string;
    };
    cashier: {
        id: number;
        name: string;
    } | null;
    is_printed: boolean;
    printed_at?: string | null;
    created_at: string;
}

interface PageProps extends Record<string, unknown> {
    payment: PaymentDetail;
    auth: {
        user?: {
            can?: {
                printReceipts?: boolean;
                voidPayments?: boolean;
                createPayments?: boolean;
            };
        };
    };
    flash?: {
        success?: string;
    };
}

export default function PaymentShow() {
    const { payment, auth, flash } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Payments',
            href: indexPayments().url,
        },
        {
            title: payment.receipt_number,
            href: showPayment({ payment: payment.id }).url,
        },
    ];

    const printForm = useForm({});
    const voidForm = useForm({});

    const canPrint = auth?.user?.can?.printReceipts ?? false;
    const canVoid = auth?.user?.can?.voidPayments ?? false;
    const canCreate = auth?.user?.can?.createPayments ?? false;

    const paymentDate = useMemo(() => formatDate(payment.payment_date), [payment.payment_date]);
    const createdAt = useMemo(() => formatDateTime(payment.created_at), [payment.created_at]);
    const printedAt = useMemo(() => (payment.printed_at ? formatDateTime(payment.printed_at) : null), [payment.printed_at]);

    const handleMarkPrinted = () => {
        printForm.post(printPayment({ payment: payment.id }).url, {
            preserveScroll: true,
        });
    };

    const handleVoidPayment = () => {
        if (!canVoid) {
            return;
        }

        if (confirm('Void this payment? The receipt number will be retained for audit.')) {
            voidForm.delete(destroyPaymentRoute({ payment: payment.id }).url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Receipt ${payment.receipt_number}`} />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        {flash?.success && (
                            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                                {flash.success}
                            </div>
                        )}

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle>Receipt {payment.receipt_number}</CardTitle>
                                <CardDescription>Recorded on {createdAt}.</CardDescription>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button variant="outline" asChild>
                                    <Link href={indexPayments().url}>Back to payments</Link>
                                </Button>
                                {canCreate && (
                                    <Button variant="secondary" asChild>
                                        <Link href={createPayment().url}>Record another payment</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent lg:col-span-3">
                                <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex items-start gap-3">
                                        <Badge variant={payment.is_printed ? 'default' : 'secondary'}>
                                            {payment.is_printed ? 'Printed' : 'Pending print'}
                                        </Badge>
                                        <Badge variant="outline" className="capitalize">
                                            {payment.payment_method.replace(/_/g, ' ')}
                                        </Badge>
                                        <Badge variant="outline">{payment.payment_purpose}</Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {canPrint && !payment.is_printed && (
                                            <Button type="button" onClick={handleMarkPrinted} disabled={printForm.processing}>
                                                {printForm.processing ? 'Marking…' : 'Mark as printed'}
                                            </Button>
                                        )}
                                        {canVoid && (
                                            <Button type="button" variant="destructive" onClick={handleVoidPayment} disabled={voidForm.processing}>
                                                {voidForm.processing ? 'Voiding…' : 'Void payment'}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Amount</p>
                                        <p className="text-4xl font-semibold text-foreground">
                                            ₱{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Payment date</p>
                                        <p className="text-lg font-medium text-foreground">{paymentDate}</p>
                                        {printedAt && <p className="text-xs text-muted-foreground">Printed {printedAt}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/60 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Payment breakdown</CardTitle>
                                    <CardDescription>All receipt details at a glance.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <DetailRow label="Receipt number" value={payment.receipt_number} />
                                    <DetailRow label="Payment purpose" value={payment.payment_purpose} />
                                    <DetailRow label="Payment method" value={capitalize(payment.payment_method)} />
                                    <DetailRow label="Recorded by" value={payment.cashier?.name ?? '—'} />
                                    <DetailRow label="Payment date" value={paymentDate} />
                                    <DetailRow label="Created at" value={createdAt} />
                                    {printedAt && <DetailRow label="Printed at" value={printedAt} />}
                                    {payment.notes && (
                                        <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-4">
                                            <span className="text-sm font-medium text-foreground">Notes</span>
                                            <p className="text-sm whitespace-pre-line text-muted-foreground">{payment.notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="grid gap-6">
                                <Card className="border-border/60">
                                    <CardHeader>
                                        <CardTitle>Student details</CardTitle>
                                        <CardDescription>Who this payment is for.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <DetailRow label="Student" value={payment.student.full_name} />
                                        <DetailRow label="Student number" value={payment.student.student_number} />
                                        <DetailRow label="Grade level" value={payment.student.grade_level} />
                                        <DetailRow label="Section" value={payment.student.section} />

                                        <div className="flex justify-end">
                                            <Button variant="outline" asChild>
                                                <Link href={showStudent({ student: payment.student.id }).url}>View student profile</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/60">
                                    <CardHeader>
                                        <CardTitle>Audit trail</CardTitle>
                                        <CardDescription>Keep track of receipt milestones.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <TimelineItem
                                            title="Payment recorded"
                                            description={`Saved by ${payment.cashier?.name ?? 'system'} on ${createdAt}.`}
                                        />
                                        {payment.is_printed ? (
                                            <TimelineItem title="Receipt printed" description={`Marked printed on ${printedAt}.`} state="complete" />
                                        ) : (
                                            <TimelineItem
                                                title="Awaiting print"
                                                description="Mark as printed once the physical receipt has been handed to the payer."
                                                state="pending"
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

interface DetailRowProps {
    label: string;
    value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-1 rounded-lg border border-border/40 bg-card/50 p-4">
            <span className="text-xs tracking-wide text-muted-foreground uppercase">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
    );
}

interface TimelineItemProps {
    title: string;
    description: string;
    state?: 'complete' | 'pending';
}

function TimelineItem({ title, description, state = 'complete' }: TimelineItemProps) {
    return (
        <div className="flex items-start gap-3">
            <span
                className={`mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full ${state === 'complete' ? 'bg-emerald-500' : 'bg-yellow-500'}`}
            />
            <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

const formatDate = (isoDate: string) =>
    new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(isoDate));

const formatDateTime = (isoDate: string) =>
    new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }).format(new Date(isoDate));

const capitalize = (value: string) => {
    const formatted = value.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};
