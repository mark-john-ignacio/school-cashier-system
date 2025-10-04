import { useEffect, useMemo, useRef, useState } from 'react';

import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { create as createPayment, index as indexPayments, show as showPayment } from '@/routes/payments';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface PaymentListItem {
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
    };
    cashier: {
        id: number;
        name: string;
    } | null;
    is_printed: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedPayments {
    data: PaymentListItem[];
    links: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
}

interface CashierOption {
    id: number;
    name: string;
}

interface PaymentMethodOption {
    value: string;
    label: string;
}

interface PageProps extends Record<string, unknown> {
    payments: PaginatedPayments;
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        purpose?: string;
        cashier_id?: string;
        payment_method?: string;
    };
    purposes: string[];
    cashiers: CashierOption[];
    paymentMethods: PaymentMethodOption[];
    auth: {
        user?: {
            can?: {
                createPayments?: boolean;
            };
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payments',
        href: indexPayments().url,
    },
];

const paymentMethodLabel = (method: string): string => {
    const formatted = method.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export default function PaymentsIndex() {
    const { payments, filters, purposes, cashiers, paymentMethods, auth } = usePage<PageProps>().props;

    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to ?? '');
    const [purpose, setPurpose] = useState<string>(filters.purpose ?? '');
    const [cashierId, setCashierId] = useState<string>(filters.cashier_id ?? '');
    const [paymentMethod, setPaymentMethod] = useState<string>(filters.payment_method ?? '');

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                indexPayments({
                    query: {
                        search: search || undefined,
                        date_from: dateFrom || undefined,
                        date_to: dateTo || undefined,
                        purpose: purpose || undefined,
                        cashier_id: cashierId || undefined,
                        payment_method: paymentMethod || undefined,
                    },
                }).url,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, 250);

        return () => clearTimeout(timeout);
    }, [search, dateFrom, dateTo, purpose, cashierId, paymentMethod]);

    const clearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setPurpose('');
        setCashierId('');
        setPaymentMethod('');
        router.get(indexPayments().url, {}, { preserveScroll: true, replace: true });
    };

    const pageTotalAmount = useMemo(() => payments.data.reduce((sum, payment) => sum + payment.amount, 0), [payments.data]);

    const printedCount = useMemo(() => payments.data.filter((payment) => payment.is_printed).length, [payments.data]);

    const pendingPrintCount = payments.data.length - printedCount;

    const canCreatePayments = auth?.user?.can?.createPayments ?? false;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Payments</h1>
                        <p className="text-sm text-muted-foreground">Track receipts, filter transactions, and verify print status in seconds.</p>
                    </div>

                    {canCreatePayments && (
                        <Button asChild>
                            <Link href={createPayment().url}>Record payment</Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-border/60 bg-muted/40">
                        <CardHeader>
                            <CardTitle>Page total</CardTitle>
                            <CardDescription>Sum of payments shown on this page</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-6 text-2xl font-semibold text-foreground">
                            ₱{pageTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle>Printed receipts</CardTitle>
                            <CardDescription>Marked as printed on this page</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-6 text-2xl font-semibold text-foreground">{printedCount}</CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle>Pending prints</CardTitle>
                            <CardDescription>Receipts awaiting print</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-6 text-2xl font-semibold text-foreground">{pendingPrintCount}</CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-6">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by student or receipt number"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="purpose">Purpose</Label>
                            <Select value={purpose || undefined} onValueChange={(value) => setPurpose(value)}>
                                <SelectTrigger id="purpose">
                                    <SelectValue placeholder="All purposes" />
                                </SelectTrigger>
                                <SelectContent>
                                    {purposes.filter(Boolean).map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cashier">Cashier</Label>
                            <Select value={cashierId || undefined} onValueChange={(value) => setCashierId(value)}>
                                <SelectTrigger id="cashier">
                                    <SelectValue placeholder="All cashiers" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cashiers.map((cashier) => (
                                        <SelectItem key={cashier.id} value={String(cashier.id)}>
                                            {cashier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="method">Payment method</Label>
                            <Select value={paymentMethod || undefined} onValueChange={(value) => setPaymentMethod(value)}>
                                <SelectTrigger id="method">
                                    <SelectValue placeholder="All methods" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            {method.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="date_from">Date from</Label>
                            <Input id="date_from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="date_to">Date to</Label>
                            <Input id="date_to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={clearFilters}>
                            Reset filters
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                    <table className="min-w-full divide-y divide-border/70 text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Receipt</th>
                                <th className="px-4 py-3 font-medium">Student</th>
                                <th className="px-4 py-3 font-medium">Purpose</th>
                                <th className="px-4 py-3 font-medium">Cashier</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 text-right font-medium">Amount</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {payments.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                        No payments found. Try adjusting your filters or record a new payment.
                                    </td>
                                </tr>
                            )}

                            {payments.data.map((payment) => (
                                <tr key={payment.id} className="hover:bg-muted/40">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-foreground">{payment.receipt_number}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="capitalize">
                                                    {paymentMethodLabel(payment.payment_method)}
                                                </Badge>
                                                <Badge variant={payment.is_printed ? 'default' : 'outline'}>
                                                    {payment.is_printed ? 'Printed' : 'Pending'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{payment.student.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{payment.student.student_number}</span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-foreground">{payment.payment_purpose}</span>
                                            {payment.notes && <span className="text-xs text-muted-foreground">{payment.notes}</span>}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-muted-foreground">{payment.cashier?.name ?? '—'}</td>

                                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(payment.payment_date)}</td>

                                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                                        ₱{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={showPayment({ payment: payment.id }).url}>View</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{payments.from ?? 0}</span> to{' '}
                        <span className="font-medium text-foreground">{payments.to ?? 0}</span> of{' '}
                        <span className="font-medium text-foreground">{payments.total ?? 0}</span> payments
                    </div>

                    <Pagination links={payments.links} />
                </div>
            </div>
        </AppLayout>
    );
}

const formatDate = (isoDate: string) =>
    new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(isoDate));
