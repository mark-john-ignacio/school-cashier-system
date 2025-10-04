import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { show as showStudent } from '@/routes/students';

export interface StudentSummary {
    id: number;
    student_number: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    full_name: string;
    grade_level: string;
    section: string;
    status: 'active' | 'inactive' | 'graduated';
    total_paid: number;
    expected_fees: number;
    balance: number;
    payment_status: 'paid' | 'partial' | 'outstanding' | 'overpaid';
    created_at: string;
}

const getPaymentStatusColor = (status: string): string => {
    switch (status) {
        case 'paid':
            return 'bg-green-500/10 text-green-700 dark:text-green-400';
        case 'partial':
            return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
        case 'outstanding':
            return 'bg-red-500/10 text-red-700 dark:text-red-400';
        case 'overpaid':
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
        default:
            return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'active':
            return 'bg-green-500/10 text-green-700 dark:text-green-400';
        case 'inactive':
            return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
        case 'graduated':
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
        default:
            return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
};

export const studentsColumns: ColumnDef<StudentSummary>[] = [
    {
        accessorKey: 'full_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{row.original.full_name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.student_number}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'grade_level',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Grade & Section" />,
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{row.original.grade_level}</Badge>
                    <span className="text-sm text-muted-foreground">Section {row.original.section}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'balance',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
        cell: ({ row }) => {
            const balance = row.original.balance;
            const totalPaid = row.original.total_paid;

            return (
                <div className="flex flex-col">
                    <span className={`font-medium ${balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        ₱{Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-muted-foreground">Paid: ₱{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'payment_status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Payment Status" />,
        cell: ({ row }) => {
            const status = row.original.payment_status;
            return <Badge className={getPaymentStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.original.status;
            return <Badge className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            return (
                <div className="text-right">
                    <Button variant="outline" asChild size="sm">
                        <Link href={showStudent({ student: row.original.id }).url}>View</Link>
                    </Button>
                </div>
            );
        },
    },
];
