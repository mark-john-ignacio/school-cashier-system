import { useEffect, useRef, useState } from 'react';

import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { create as createStudent, index as indexStudents, show as showStudent } from '@/routes/students';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface StudentSummary {
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

interface PaginatedStudents {
    data: StudentSummary[];
    links: { url: string | null; label: string; active: boolean }[];
    from?: number;
    to?: number;
    total?: number;
}

interface PageProps extends Record<string, unknown> {
    students: PaginatedStudents;
    filters: {
        search?: string;
        grade_level?: string;
        section?: string;
        status?: string;
    };
    gradeLevels: string[];
    sections: string[];
    auth: {
        user?: {
            can?: {
                createStudents?: boolean;
            };
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: indexStudents().url,
    },
];

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

export default function StudentsIndex() {
    const { students, filters, gradeLevels, sections, auth } = usePage<PageProps>().props;

    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [gradeLevel, setGradeLevel] = useState<string>(filters.grade_level ?? '');
    const [section, setSection] = useState<string>(filters.section ?? '');
    const [status, setStatus] = useState<string>(filters.status ?? '');

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                indexStudents({
                    query: {
                        search: search || undefined,
                        grade_level: gradeLevel || undefined,
                        section: section || undefined,
                        status: status || undefined,
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
    }, [search, gradeLevel, section, status]);

    const clearFilters = () => {
        setSearch('');
        setGradeLevel('');
        setSection('');
        setStatus('');
        router.get(indexStudents().url, {}, { preserveScroll: true, replace: true });
    };

    const canCreateStudents = auth?.user?.can?.createStudents ?? false;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Students</h1>
                        <p className="text-sm text-muted-foreground">Manage student records and track payment status.</p>
                    </div>

                    {canCreateStudents && (
                        <Button asChild>
                            <Link href={createStudent().url}>Add student</Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name or student number"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="grade-level-filter">Grade level</Label>
                            <Select value={gradeLevel} onValueChange={setGradeLevel}>
                                <SelectTrigger id="grade-level-filter">
                                    <SelectValue placeholder="All grades" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All grades</SelectItem>
                                    {gradeLevels.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="section-filter">Section</Label>
                            <Select value={section} onValueChange={setSection}>
                                <SelectTrigger id="section-filter">
                                    <SelectValue placeholder="All sections" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All sections</SelectItem>
                                    {sections.map((sec) => (
                                        <SelectItem key={sec} value={sec}>
                                            Section {sec}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="status-filter">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger id="status-filter">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="graduated">Graduated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={clearFilters} className="ml-auto">
                            Reset filters
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                    <table className="min-w-full divide-y divide-border/70 text-left text-sm">
                        <thead className="bg-muted/40 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Student</th>
                                <th className="px-4 py-3 font-medium">Grade &amp; Section</th>
                                <th className="px-4 py-3 font-medium">Balance</th>
                                <th className="px-4 py-3 font-medium">Payment Status</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {students.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                        No students found. Try adjusting your filters or add a new student.
                                    </td>
                                </tr>
                            )}

                            {students.data.map((student) => (
                                <tr key={student.id} className="hover:bg-muted/40">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{student.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{student.student_number}</span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{student.grade_level}</Badge>
                                            <span className="text-sm text-muted-foreground">Section {student.section}</span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span
                                                className={`font-medium ${student.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                                            >
                                                ₱{Math.abs(student.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Paid: ₱{student.total_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <Badge className={getPaymentStatusColor(student.payment_status)}>
                                            {student.payment_status.charAt(0).toUpperCase() + student.payment_status.slice(1)}
                                        </Badge>
                                    </td>

                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(student.status)}>
                                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                        </Badge>
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <Button variant="outline" asChild size="sm">
                                            <Link href={showStudent({ student: student.id }).url}>View</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{students.from ?? 0}</span> to{' '}
                        <span className="font-medium text-foreground">{students.to ?? 0}</span> of{' '}
                        <span className="font-medium text-foreground">{students.total ?? 0}</span> students
                    </div>

                    <Pagination links={students.links} />
                </div>
            </div>
        </AppLayout>
    );
}
