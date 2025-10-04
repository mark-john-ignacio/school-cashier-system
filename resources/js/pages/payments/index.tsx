import { useEffect, useMemo, useRef, useState } from 'react';

import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { create as createPayment, index as indexPayments } from '@/routes/payments';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { paymentsColumns, type PaymentListItem } from './columns';

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

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>Payments</CardTitle>
                                <CardDescription>Track receipts, filter transactions, and verify print status in seconds.</CardDescription>
                            </div>
                            {canCreatePayments && (
                                <Button asChild>
                                    <Link href={createPayment().url}>Record Payment</Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="border-border/60 bg-muted/40">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Page total</CardTitle>
                                    <CardDescription>Sum of payments shown on this page</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="text-2xl font-bold text-foreground">
                                        ₱{pageTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/60">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Printed receipts</CardTitle>
                                    <CardDescription>Marked as printed on this page</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="text-2xl font-bold text-foreground">{printedCount}</div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/60">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Pending prints</CardTitle>
                                    <CardDescription>Receipts awaiting print</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="text-2xl font-bold text-foreground">{pendingPrintCount}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="grid gap-4 md:grid-cols-6">
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

                            <div className="mt-4 flex justify-end">
                                <Button variant="outline" onClick={clearFilters} size="sm">
                                    Reset filters
                                </Button>
                            </div>
                        </div>

                        <DataTable columns={paymentsColumns} data={payments.data} />

                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium text-foreground">{payments.from ?? 0}</span> to{' '}
                                <span className="font-medium text-foreground">{payments.to ?? 0}</span> of{' '}
                                <span className="font-medium text-foreground">{payments.total ?? 0}</span> payments
                            </div>
                            <Pagination links={payments.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
