import { useEffect, useMemo, useRef, useState } from 'react';

import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { create as createStudent, index as indexStudents } from '@/routes/students';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { studentsColumns, type StudentSummary } from './columns';

interface PaginatedStudents {
    data: StudentSummary[];
    links: { url: string | null; label: string; active: boolean }[];
    from?: number;
    to?: number;
    total?: number;
}

interface GradeLevelOption {
    id: number;
    name: string;
}

interface SectionOption {
    id: number;
    name: string;
}

interface PageProps extends Record<string, unknown> {
    students: PaginatedStudents;
    filters: {
        search?: string | null;
        grade_level?: string | null;
        section?: string | null;
        status?: string | null;
        per_page?: string | null;
    };
    gradeLevels: GradeLevelOption[];
    sectionsByGrade: Record<string, SectionOption[]>;
    perPageOptions: number[];
    perPage: number;
    defaultPerPage: number;
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

export default function StudentsIndex() {
    const {
        students,
        filters,
        gradeLevels,
        sectionsByGrade,
        auth,
        perPageOptions,
        perPage: currentPerPage,
        defaultPerPage,
    } = usePage<PageProps>().props;

    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [gradeLevel, setGradeLevel] = useState<string>(filters.grade_level ?? '');
    const [section, setSection] = useState<string>(filters.section ?? '');
    const [status, setStatus] = useState<string>(filters.status ?? '');
    const [perPage, setPerPage] = useState<string>(filters.per_page ?? String(currentPerPage ?? defaultPerPage));

    const isFirstRender = useRef(true);

    const allSections = useMemo(() => {
        const uniqueSections = new Map<string, SectionOption>();
        Object.values(sectionsByGrade ?? {})
            .flat()
            .forEach((sectionOption) => {
                uniqueSections.set(String(sectionOption.id), sectionOption);
            });

        return Array.from(uniqueSections.values());
    }, [sectionsByGrade]);

    const filteredSections = useMemo(() => {
        if (gradeLevel) {
            return sectionsByGrade?.[gradeLevel] ?? [];
        }

        return allSections;
    }, [allSections, gradeLevel, sectionsByGrade]);

    useEffect(() => {
        if (section && !filteredSections.some((sectionOption) => String(sectionOption.id) === section)) {
            setSection('');
        }
    }, [filteredSections, section]);

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
                indexStudents({
                    query: {
                        search: search || undefined,
                        grade_level: gradeLevel || undefined,
                        section: section || undefined,
                        status: status || undefined,
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
    }, [search, gradeLevel, section, status, perPage]);

    const clearFilters = () => {
        setSearch('');
        setGradeLevel('');
        setSection('');
        setStatus('');
        setPerPage(String(defaultPerPage));
    };

    const canCreateStudents = auth?.user?.can?.createStudents ?? false;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>Students</CardTitle>
                                <CardDescription>Manage student records and track payment status.</CardDescription>
                            </div>
                            {canCreateStudents && (
                                <Button asChild>
                                    <Link href={createStudent().url}>Add Student</Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="grid gap-4 md:grid-cols-4">
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
                                    <Select value={gradeLevel || undefined} onValueChange={(value) => setGradeLevel(value)}>
                                        <SelectTrigger id="grade-level-filter">
                                            <SelectValue placeholder="All grades" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeLevels.map((level) => (
                                                <SelectItem key={level.id} value={String(level.id)}>
                                                    {level.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="section-filter">Section</Label>
                                    <Select
                                        value={section || undefined}
                                        onValueChange={(value) => setSection(value)}
                                        disabled={gradeLevel ? filteredSections.length === 0 : allSections.length === 0}
                                    >
                                        <SelectTrigger id="section-filter">
                                            <SelectValue placeholder="All sections" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredSections.length > 0 ? (
                                                filteredSections.map((sectionOption) => (
                                                    <SelectItem key={sectionOption.id} value={String(sectionOption.id)}>
                                                        Section {sectionOption.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="" disabled>
                                                    {gradeLevel ? 'No sections available' : 'No sections available'}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="status-filter">Status</Label>
                                    <Select value={status || undefined} onValueChange={(value) => setStatus(value)}>
                                        <SelectTrigger id="status-filter">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="graduated">Graduated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Button variant="outline" onClick={clearFilters} size="sm">
                                    Reset filters
                                </Button>
                            </div>
                        </div>

                        <DataTable columns={studentsColumns} data={students.data} />

                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-center">
                            <div className="text-center text-sm text-muted-foreground md:text-left">
                                Showing <span className="font-medium text-foreground">{students.from ?? 0}</span> to{' '}
                                <span className="font-medium text-foreground">{students.to ?? 0}</span> of{' '}
                                <span className="font-medium text-foreground">{students.total ?? 0}</span> students
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
                            <Pagination links={students.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
