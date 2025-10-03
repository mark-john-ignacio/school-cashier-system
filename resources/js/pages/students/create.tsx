import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as indexStudents, store as storeStudent } from '@/routes/students';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

interface PageProps extends Record<string, unknown> {
    gradeLevels: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: indexStudents().url,
    },
];

export default function CreateStudent() {
    const { gradeLevels } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        student_number: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        grade_level: '',
        section: '',
        contact_number: '',
        email: '',
        parent_name: '',
        parent_contact: '',
        parent_email: '',
        status: 'active' as 'active' | 'inactive' | 'graduated',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(storeStudent().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Student" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold">Add Student</h1>
                    <p className="text-sm text-muted-foreground">Create a new student record.</p>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
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
                                <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required />
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
                                <Input id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required />
                                {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="grade_level">
                                    Grade Level <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.grade_level} onValueChange={(value) => setData('grade_level', value)}>
                                    <SelectTrigger id="grade_level">
                                        <SelectValue placeholder="Select grade level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeLevels.map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {level}
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
                                <Input
                                    id="section"
                                    value={data.section}
                                    onChange={(e) => setData('section', e.target.value)}
                                    placeholder="A"
                                    required
                                />
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

                    <div className="grid gap-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
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

                    <div className="grid gap-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
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
                            <Link href={indexStudents().url}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Student'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
