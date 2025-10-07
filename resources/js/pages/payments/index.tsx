import { useEffect, useRef, useState } from 'react';

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
        search?: string | null;
        date_from?: string | null;
        date_to?: string | null;
        purpose?: string | null;
        cashier_id?: string | null;
        payment_method?: string | null;
        per_page?: string | null;
    };
    purposes: string[];
    cashiers: CashierOption[];
    paymentMethods: PaymentMethodOption[];
    perPageOptions: number[];
    perPage: number;
    defaultPerPage: number;
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
    const {
        payments,
        filters,
        purposes,
        cashiers,
        paymentMethods,
        perPageOptions,
        perPage: currentPerPage,
        defaultPerPage,
        auth,
    } = usePage<PageProps>().props;

    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to ?? '');
    const [purpose, setPurpose] = useState<string>(filters.purpose ?? '');
    const [cashierId, setCashierId] = useState<string>(filters.cashier_id ?? '');
    const [paymentMethod, setPaymentMethod] = useState<string>(filters.payment_method ?? '');
    const [perPage, setPerPage] = useState<string>(filters.per_page ?? String(currentPerPage ?? defaultPerPage));

    const isFirstRender = useRef(true);

    useEffect(() => {
        const normalizedPerPage = filters.per_page ?? String(currentPerPage ?? defaultPerPage);
        setPerPage(normalizedPerPage);
    }, [currentPerPage, defaultPerPage, filters.per_page]);

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
                        per_page: perPage || undefined,
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
    }, [search, dateFrom, dateTo, purpose, cashierId, paymentMethod, perPage]);

    const clearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setPurpose('');
        setCashierId('');
        setPaymentMethod('');
        setPerPage(String(defaultPerPage));
    };

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

                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-center">
                            <div className="text-center text-sm text-muted-foreground md:text-left">
                                Showing <span className="font-medium text-foreground">{payments.from ?? 0}</span> to{' '}
                                <span className="font-medium text-foreground">{payments.to ?? 0}</span> of{' '}
                                <span className="font-medium text-foreground">{payments.total ?? 0}</span> payments
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="rows-per-page" className="text-sm">
                                    Rows per page
                                </Label>
                                <Select value={perPage || undefined} onValueChange={(value) => setPerPage(value)}>
                                    <SelectTrigger id="rows-per-page" className="w-28">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perPageOptions.map((option) => {
                                            const value = option.toString();
                                            return (
                                                <SelectItem key={value} value={value}>
                                                    {option}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Pagination links={payments.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
