import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { show as showPayment } from '@/routes/payments';

export interface PaymentListItem {
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

const paymentMethodLabel = (method: string): string => {
    const formatted = method.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatDate = (isoDate: string) =>
    new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(isoDate));

export const paymentsColumns: ColumnDef<PaymentListItem>[] = [
    {
        accessorKey: 'receipt_number',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Receipt" />,
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{row.original.receipt_number}</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                            {paymentMethodLabel(row.original.payment_method)}
                        </Badge>
                        <Badge variant={row.original.is_printed ? 'default' : 'outline'}>{row.original.is_printed ? 'Printed' : 'Pending'}</Badge>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'student.full_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{row.original.student.full_name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.student.student_number}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'payment_purpose',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Purpose" />,
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">{row.original.payment_purpose}</span>
                    {row.original.notes && <span className="text-xs text-muted-foreground">{row.original.notes}</span>}
                </div>
            );
        },
    },
    {
        accessorKey: 'cashier.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cashier" />,
        cell: ({ row }) => {
            return <span className="text-sm text-muted-foreground">{row.original.cashier?.name ?? '—'}</span>;
        },
    },
    {
        accessorKey: 'payment_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => {
            return <span className="text-sm text-muted-foreground">{formatDate(row.original.payment_date)}</span>;
        },
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => {
            const amount = row.original.amount;
            return <div className="text-right font-semibold text-foreground">₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            return (
                <div className="text-right">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={showPayment({ payment: row.original.id }).url}>View</Link>
                    </Button>
                </div>
            );
        },
    },
];
