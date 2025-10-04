import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { destroy as destroyStudent, edit as editStudent, index as indexStudents, show as showStudent } from '@/routes/students';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, Mail, MapPin, Phone, User } from 'lucide-react';

interface Student {
    id: number;
    student_number: string;
    full_name: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    grade_level: string;
    section: string;
    contact_number?: string | null;
    email?: string | null;
    parent_name?: string | null;
    parent_contact?: string | null;
    parent_email?: string | null;
    status: 'active' | 'inactive' | 'graduated';
    notes?: string | null;
    total_paid: number;
    expected_fees: number;
    balance: number;
    payment_status: 'paid' | 'partial' | 'outstanding' | 'overpaid';
    created_at: string;
}

interface Payment {
    id: number;
    receipt_number: string;
    amount: number;
    payment_date: string;
    payment_purpose: string;
    payment_method: string;
    notes?: string | null;
    cashier_name: string;
    created_at: string;
}

interface PageProps extends Record<string, unknown> {
    student: Student;
    paymentHistory: Payment[];
    auth: {
        user?: {
            can?: {
                editStudents?: boolean;
                deleteStudents?: boolean;
            };
        };
    };
}

const getPaymentStatusColor = (status: string): string => {
    switch (status) {
        case 'paid':
            return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
        case 'partial':
            return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
        case 'outstanding':
            return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
        case 'overpaid':
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
        default:
            return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'active':
            return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
        case 'inactive':
            return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
        case 'graduated':
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
        default:
            return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
};

export default function ShowStudent() {
    const { student, paymentHistory, auth } = usePage<PageProps>().props;
    const [isDeleting, setIsDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Students',
            href: indexStudents().url,
        },
        {
            title: student.student_number,
            href: showStudent({ student: student.id }).url,
        },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to deactivate this student? This action can be reversed later.')) {
            setIsDeleting(true);
            router.delete(destroyStudent({ student: student.id }).url, {
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    const canEdit = auth?.user?.can?.editStudents ?? false;
    const canDelete = auth?.user?.can?.deleteStudents ?? false;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={student.full_name} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{student.full_name}</h1>
                            <Badge className={getStatusColor(student.status)}>
                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Student Number: {student.student_number}</p>
                    </div>

                    <div className="flex gap-3">
                        {canEdit && (
                            <Button variant="outline" asChild>
                                <Link href={editStudent({ student: student.id }).url}>Edit Student</Link>
                            </Button>
                        )}
                        {canDelete && student.status === 'active' && (
                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deactivating...' : 'Deactivate'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Payment Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">Expected Fees</p>
                        <p className="text-2xl font-semibold">₱{student.expected_fees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>

                    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                            ₱{student.total_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Balance</p>
                            <Badge className={getPaymentStatusColor(student.payment_status)}>
                                {student.payment_status.charAt(0).toUpperCase() + student.payment_status.slice(1)}
                            </Badge>
                        </div>
                        <p
                            className={`text-2xl font-semibold ${student.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                        >
                            ₱{Math.abs(student.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Student Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Information */}
                    <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Personal Information</h2>

                        <div className="grid gap-3">
                            <div className="flex items-start gap-3">
                                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{student.full_name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-muted-foreground">Grade & Section</p>
                                    <p className="font-medium">
                                        {student.grade_level} - Section {student.section}
                                    </p>
                                </div>
                            </div>

                            {student.contact_number && (
                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-muted-foreground">Contact Number</p>
                                        <p className="font-medium">{student.contact_number}</p>
                                    </div>
                                </div>
                            )}

                            {student.email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{student.email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-muted-foreground">Enrolled Since</p>
                                    <p className="font-medium">{format(new Date(student.created_at), 'MMMM d, yyyy')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parent/Guardian Information */}
                    <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Parent/Guardian Information</h2>

                        <div className="grid gap-3">
                            {student.parent_name ? (
                                <>
                                    <div className="flex items-start gap-3">
                                        <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm text-muted-foreground">Name</p>
                                            <p className="font-medium">{student.parent_name}</p>
                                        </div>
                                    </div>

                                    {student.parent_contact && (
                                        <div className="flex items-start gap-3">
                                            <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm text-muted-foreground">Contact Number</p>
                                                <p className="font-medium">{student.parent_contact}</p>
                                            </div>
                                        </div>
                                    )}

                                    {student.parent_email && (
                                        <div className="flex items-start gap-3">
                                            <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{student.parent_email}</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No parent/guardian information available.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {student.notes && (
                    <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Additional Notes</h2>
                        <p className="text-sm text-muted-foreground">{student.notes}</p>
                    </div>
                )}

                {/* Payment History */}
                <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Payment History</h2>
                        <p className="text-sm text-muted-foreground">{paymentHistory.length} transactions</p>
                    </div>

                    {paymentHistory.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">No payment history available.</p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-border/60">
                            <table className="min-w-full divide-y divide-border/70 text-left text-sm">
                                <thead className="bg-muted/40 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium">Receipt</th>
                                        <th className="px-4 py-3 font-medium">Purpose</th>
                                        <th className="px-4 py-3 font-medium">Method</th>
                                        <th className="px-4 py-3 font-medium">Cashier</th>
                                        <th className="px-4 py-3 text-right font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {paymentHistory.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-muted/40">
                                            <td className="px-4 py-3">{format(new Date(payment.payment_date), 'MMM d, yyyy')}</td>
                                            <td className="px-4 py-3">
                                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{payment.receipt_number}</code>
                                            </td>
                                            <td className="px-4 py-3">{payment.payment_purpose}</td>
                                            <td className="px-4 py-3 capitalize">{payment.payment_method}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{payment.cashier_name}</td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                ₱{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
