import { FormEventHandler, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as indexStudents, show as showStudent, update as updateStudent } from '@/routes/students';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

interface Student {
    id: number;
    student_number: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    grade_level: number | string;
    section: number | string;
    contact_number?: string | null;
    email?: string | null;
    parent_name?: string | null;
    parent_contact?: string | null;
    parent_email?: string | null;
    status: 'active' | 'inactive' | 'graduated';
    notes?: string | null;
}

interface GradeOption {
    id: number;
    name: string;
}

interface SectionOption {
    id: number;
    name: string;
}

interface PageProps extends Record<string, unknown> {
    student: Student;
    gradeLevels: GradeOption[];
    sectionsByGrade: Record<string, SectionOption[]>;
}

export default function EditStudent() {
    const { student, gradeLevels, sectionsByGrade } = usePage<PageProps>().props;

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

    const { data, setData, put, processing, errors } = useForm({
        student_number: student.student_number,
        first_name: student.first_name,
        middle_name: student.middle_name || '',
        last_name: student.last_name,
        grade_level: student.grade_level,
        section: student.section,
        contact_number: student.contact_number || '',
        email: student.email || '',
        parent_name: student.parent_name || '',
        parent_contact: student.parent_contact || '',
        parent_email: student.parent_email || '',
        status: student.status,
        notes: student.notes || '',
    });

    const filteredSections = useMemo(() => {
        if (!data.grade_level) {
            return [] as SectionOption[];
        }

        return sectionsByGrade?.[String(data.grade_level)] ?? [];
    }, [data.grade_level, sectionsByGrade]);

    useEffect(() => {
        if (data.section) {
            const found = filteredSections.some((s) => String(s.id) === String(data.section));
            if (!found) setData('section', '');
        }
    }, [data.section, filteredSections, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(updateStudent({ student: student.id }).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${student.student_number}`} />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Student</CardTitle>
                        <CardDescription>Update student information for {student.student_number}.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Student Information</h2>
                                    <p className="text-sm text-muted-foreground">Basic information about the student.</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="student_number">
                                            Student Number <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="student_number"
                                            value={data.student_number}
                                            onChange={(e) => setData('student_number', e.target.value)}
                                            placeholder="STU-2025-0001"
                                            required
                                        />
                                        {errors.student_number && <p className="text-sm text-red-500">{errors.student_number}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value as 'active' | 'inactive' | 'graduated')}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="graduated">Graduated</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="first_name">
                                            First Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            required
                                        />
                                        {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="middle_name">Middle Name</Label>
                                        <Input id="middle_name" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="last_name">
                                            Last Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            required
                                        />
                                        {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="grade_level">
                                            Grade Level <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={String(data.grade_level || '')}
                                            onValueChange={(value) => setData('grade_level', Number(value) || '')}
                                        >
                                            <SelectTrigger id="grade_level">
                                                <SelectValue placeholder="Select grade level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gradeLevels.map((level: GradeOption) => (
                                                    <SelectItem key={level.id} value={String(level.id)}>
                                                        {level.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.grade_level && <p className="text-sm text-red-500">{errors.grade_level}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="section">
                                            Section <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={String(data.section || '')}
                                            onValueChange={(value) => setData('section', Number(value) || '')}
                                            disabled={!data.grade_level || filteredSections.length === 0}
                                        >
                                            <SelectTrigger id="section">
                                                <SelectValue
                                                    placeholder={
                                                        !data.grade_level
                                                            ? 'Select grade level first'
                                                            : filteredSections.length === 0
                                                              ? 'No sections available'
                                                              : 'Select section'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredSections.length > 0 ? (
                                                    <SelectGroup>
                                                        {filteredSections.map((sectionOption: SectionOption) => (
                                                            <SelectItem key={sectionOption.id} value={String(sectionOption.id)}>
                                                                Section {sectionOption.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ) : (
                                                    <SelectGroup>
                                                        <SelectLabel className="text-muted-foreground">
                                                            {data.grade_level ? 'No sections available' : 'Select a grade level first'}
                                                        </SelectLabel>
                                                    </SelectGroup>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.section && <p className="text-sm text-red-500">{errors.section}</p>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="contact_number">Contact Number</Label>
                                        <Input
                                            id="contact_number"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            placeholder="09123456789"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="student@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Parent/Guardian Information</h2>
                                    <p className="text-sm text-muted-foreground">Contact information for the student's parent or guardian.</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                                        <Input id="parent_name" value={data.parent_name} onChange={(e) => setData('parent_name', e.target.value)} />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="parent_contact">Parent/Guardian Contact</Label>
                                        <Input
                                            id="parent_contact"
                                            value={data.parent_contact}
                                            onChange={(e) => setData('parent_contact', e.target.value)}
                                            placeholder="09123456789"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <Label htmlFor="parent_email">Parent/Guardian Email</Label>
                                        <Input
                                            id="parent_email"
                                            type="email"
                                            value={data.parent_email}
                                            onChange={(e) => setData('parent_email', e.target.value)}
                                            placeholder="parent@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Additional Notes</h2>
                                    <p className="text-sm text-muted-foreground">Any additional information about the student.</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={4}
                                        placeholder="Enter any additional notes..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" asChild type="button">
                                    <Link href={showStudent({ student: student.id }).url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
