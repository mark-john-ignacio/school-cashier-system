import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { destroy as destroyStudent, edit as editStudent, index as indexStudents } from '@/routes/students';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, EditIcon, MailIcon, PhoneIcon, TrashIcon, UserIcon } from 'lucide-react';

interface Student {
    id: number;
    student_number: string;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    grade_level: string;
    section: string;
    contact_number: string | null;
    email: string | null;
    parent_name: string | null;
    parent_contact: string | null;
    parent_email: string | null;
    status: 'active' | 'inactive' | 'graduated';
    notes: string | null;
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
    notes: string | null;
    cashier_name: string;
    created_at: string;
}

interface PageProps extends Record<string, unknown> {
    student: Student;
    paymentHistory: Payment[];
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
        },
    ];

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        router.delete(destroyStudent({ student: student.id }).url, {
            onFinish: () => setIsDeleting(false),
        });
    };

    const canEditStudents = auth?.user?.can?.editStudents ?? false;
    const canDeleteStudents = auth?.user?.can?.deleteStudents ?? false;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={student.full_name} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                        <h1 className="text-2xl font-semibold">{student.full_name}</h1>
                        <p className="text-sm text-muted-foreground">{student.student_number}</p>
                    </div>

                    <div className="flex gap-2">
                        {canEditStudents && (
                            <Button variant="outline" asChild>
                                <Link href={editStudent({ student: student.id }).url}>
                                    <EditIcon className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {canDeleteStudents && (
                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                <TrashIcon className="mr-2 h-4 w-4" />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Expected Fees</CardDescription>
                            <CardTitle className="text-2xl">₱{student.expected_fees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Paid</CardDescription>
                            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                                ₱{student.total_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Balance</CardDescription>
                            <CardTitle className={`text-2xl ${student.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                ₱{Math.abs(student.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Payment Status</CardDescription>
                            <div className="pt-2">
                                <Badge className={getPaymentStatusColor(student.payment_status)}>
                                    {student.payment_status.charAt(0).toUpperCase() + student.payment_status.slice(1)}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Student Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Information</CardTitle>
                            <CardDescription>Personal and enrollment details</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-sm text-muted-foreground">Grade Level:</div>
                                <div className="col-span-2 text-sm font-medium">{student.grade_level}</div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-sm text-muted-foreground">Section:</div>
                                <div className="col-span-2 text-sm font-medium">{student.section}</div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-sm text-muted-foreground">Status:</div>
                                <div className="col-span-2">
                                    <Badge className={getStatusColor(student.status)}>{student.status.charAt(0).toUpperCase() + student.status.slice(1)}</Badge>
                                </div>
                            </div>

                            {student.contact_number && (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-sm text-muted-foreground flex items-center">
                                        <PhoneIcon className="mr-1 h-3 w-3" />
                                        Contact:
                                    </div>
                                    <div className="col-span-2 text-sm font-medium">{student.contact_number}</div>
                                </div>
                            )}

                            {student.email && (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-sm text-muted-foreground flex items-center">
                                        <MailIcon className="mr-1 h-3 w-3" />
                                        Email:
                                    </div>
                                    <div className="col-span-2 text-sm font-medium">{student.email}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-sm text-muted-foreground flex items-center">
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    Enrolled:
                                </div>
                                <div className="col-span-2 text-sm font-medium">{format(new Date(student.created_at), 'MMM d, yyyy')}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Parent/Guardian Information</CardTitle>
                            <CardDescription>Contact details for parent or guardian</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {student.parent_name ? (
                                <>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-sm text-muted-foreground flex items-center">
                                            <UserIcon className="mr-1 h-3 w-3" />
                                            Name:
                                        </div>
                                        <div className="col-span-2 text-sm font-medium">{student.parent_name}</div>
                                    </div>

                                    {student.parent_contact && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-sm text-muted-foreground flex items-center">
                                                <PhoneIcon className="mr-1 h-3 w-3" />
                                                Contact:
                                            </div>
                                            <div className="col-span-2 text-sm font-medium">{student.parent_contact}</div>
                                        </div>
                                    )}

                                    {student.parent_email && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-sm text-muted-foreground flex items-center">
                                                <MailIcon className="mr-1 h-3 w-3" />
                                                Email:
                                            </div>
                                            <div className="col-span-2 text-sm font-medium">{student.parent_email}</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">No parent/guardian information provided.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Notes */}
                {student.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{student.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Payment History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>{paymentHistory.length} payment(s) on record</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {paymentHistory.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">No payments recorded yet.</div>
                        ) : (
                            <div className="overflow-hidden rounded-lg border">
                                <table className="min-w-full divide-y divide-border text-left text-sm">
                                    <thead className="bg-muted/40 text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Receipt</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Purpose</th>
                                            <th className="px-4 py-3 font-medium">Amount</th>
                                            <th className="px-4 py-3 font-medium">Cashier</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {paymentHistory.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-muted/40">
                                                <td className="px-4 py-3 font-mono text-xs">{payment.receipt_number}</td>
                                                <td className="px-4 py-3">{format(new Date(payment.payment_date), 'MMM d, yyyy')}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="secondary">{payment.payment_purpose}</Badge>
                                                </td>
                                                <td className="px-4 py-3 font-medium">₱{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{payment.cashier_name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
