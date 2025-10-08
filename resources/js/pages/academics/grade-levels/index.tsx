import GradeLevelController from '@/actions/App/Http/Controllers/Settings/GradeLevelController';
import SectionController from '@/actions/App/Http/Controllers/Settings/SectionController';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import feeStructureRoutes from '@/routes/academics/fee-structures';
import gradeLevelRoutes from '@/routes/academics/grade-levels';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

interface GradeLevelFee {
    id: number;
    fee_type: string;
    amount: number;
    is_required: boolean;
    is_active: boolean;
}

interface GradeLevelSection {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    display_order: number | null;
    grade_level_id?: number;
}

interface GradeLevelItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    display_order: number | null;
    is_active: boolean;
    sections_count: number;
    students_count: number;
    fee_total: number;
    fees: GradeLevelFee[];
    sections: GradeLevelSection[];
}

interface GradeLevelFilters {
    school_year?: string | null;
}

interface PageProps extends Record<string, unknown> {
    gradeLevels: GradeLevelItem[];
    filters: GradeLevelFilters;
    schoolYears: (string | number)[];
}

type GradeLevelDialogState =
    | { mode: 'create' }
    | {
          mode: 'edit';
          gradeLevel: GradeLevelItem;
      };

type SectionDialogState =
    | {
          mode: 'create';
          gradeLevel: GradeLevelItem;
      }
    | {
          mode: 'edit';
          gradeLevel: GradeLevelItem;
          section: GradeLevelSection;
      };

type GradeLevelFormData = {
    name: string;
    description: string;
    display_order: string;
    is_active: boolean;
};

type SectionFormData = {
    grade_level_id: string;
    name: string;
    description: string;
    display_order: string;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Academics', href: '/academics' },
    { title: 'Grade levels', href: gradeLevelRoutes.index().url },
];

const formatCurrency = (amount: number): string => `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function GradeLevelsPage() {
    const { gradeLevels, filters, schoolYears } = usePage<PageProps>().props;

    const [gradeLevelDialog, setGradeLevelDialog] = useState<GradeLevelDialogState | null>(null);
    const [sectionDialog, setSectionDialog] = useState<SectionDialogState | null>(null);

    const schoolYearValue = filters?.school_year ? String(filters.school_year) : 'current';

    const stats = useMemo(() => {
        const totalSections = gradeLevels.reduce((sum, gradeLevel) => sum + gradeLevel.sections_count, 0);
        const totalStudents = gradeLevels.reduce((sum, gradeLevel) => sum + gradeLevel.students_count, 0);

        return [
            {
                title: 'Grade levels',
                value: gradeLevels.length.toString(),
            },
            {
                title: 'Sections',
                value: totalSections.toString(),
            },
            {
                title: 'Active students',
                value: totalStudents.toString(),
            },
        ];
    }, [gradeLevels]);

    const handleSchoolYearChange = (value: string) => {
        if (value === 'current') {
            router.get(GradeLevelController.index.url(), {}, { preserveScroll: true, preserveState: true });
            return;
        }

        router.get(GradeLevelController.index.url({ query: { school_year: value } }), {}, { preserveScroll: true, preserveState: true });
    };

    const handleDeleteGradeLevel = (gradeLevel: GradeLevelItem) => {
        if (!confirm(`Delete grade level "${gradeLevel.name}"? This action cannot be undone.`)) {
            return;
        }

        router.delete(GradeLevelController.destroy.url({ gradeLevel: gradeLevel.id }), {
            preserveScroll: true,
        });
    };

    const handleDeleteSection = (gradeLevel: GradeLevelItem, section: GradeLevelSection) => {
        if (!confirm(`Delete section "${section.name}" from ${gradeLevel.name}?`)) {
            return;
        }

        router.delete(SectionController.destroy.url({ section: section.id }), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grade levels" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>Grade levels</CardTitle>
                                <CardDescription>
                                    Define the academic hierarchy, attach sections, and monitor active enrollment per level.
                                </CardDescription>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                                <Select value={schoolYearValue} onValueChange={handleSchoolYearChange}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="School year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="current">Current school year</SelectItem>
                                        {schoolYears.map((year) => (
                                            <SelectItem key={year} value={String(year)}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button type="button" onClick={() => setGradeLevelDialog({ mode: 'create' })} className="w-full sm:w-auto">
                                    <Plus className="h-4 w-4" />
                                    New grade level
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {stats.map((stat) => (
                                <Card key={stat.title} className="shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-6 rounded-lg border border-border/60 bg-muted/30 p-6">
                            <HeadingSmall
                                title="Grade level directory"
                                description="Open a grade level to manage sections, description, and fee snapshot."
                            />

                            {gradeLevels.length === 0 ? (
                                <div className="rounded-lg border border-dashed py-12 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No grade levels yet. Add your first level to start organizing the academic structure.
                                    </p>
                                </div>
                            ) : (
                                <Accordion type="single" collapsible className="space-y-3">
                                    {gradeLevels.map((gradeLevel) => (
                                        <AccordionItem key={gradeLevel.id} value={gradeLevel.slug} className="overflow-hidden rounded-lg border">
                                            <AccordionTrigger className="flex items-center justify-between bg-muted/40 px-4 py-3 text-left text-base font-medium hover:no-underline">
                                                <div className="flex flex-col gap-1 text-left">
                                                    <div className="flex items-center gap-2">
                                                        <span>{gradeLevel.name}</span>
                                                        <Badge variant={gradeLevel.is_active ? 'secondary' : 'outline'}>
                                                            {gradeLevel.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {gradeLevel.description ? gradeLevel.description : 'No description provided yet.'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{gradeLevel.sections_count} sections</span>
                                                    <span>{gradeLevel.students_count} students</span>
                                                    <span>{formatCurrency(gradeLevel.fee_total)} fees</span>
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="space-y-6 bg-background px-4 py-6">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setGradeLevelDialog({ mode: 'edit', gradeLevel })}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Edit grade level
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSectionDialog({ mode: 'create', gradeLevel })}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add section
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteGradeLevel(gradeLevel)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                        Archive
                                                    </Button>
                                                </div>

                                                <div className="grid gap-6 lg:grid-cols-2">
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                                            Sections
                                                        </h3>
                                                        {gradeLevel.sections.length === 0 ? (
                                                            <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                                                No sections yet. Add sections to manage homerooms or strands.
                                                            </div>
                                                        ) : (
                                                            <div className="divide-y rounded-lg border">
                                                                {gradeLevel.sections.map((section) => (
                                                                    <div
                                                                        key={section.id}
                                                                        className="flex items-start justify-between gap-4 px-4 py-3"
                                                                    >
                                                                        <div>
                                                                            <p className="font-medium text-foreground">{section.name}</p>
                                                                            {section.description && (
                                                                                <p className="text-xs text-muted-foreground">{section.description}</p>
                                                                            )}
                                                                            <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                                                                                <Badge variant={section.is_active ? 'secondary' : 'outline'}>
                                                                                    {section.is_active ? 'Active' : 'Inactive'}
                                                                                </Badge>
                                                                                {section.display_order !== null && (
                                                                                    <span>Order {section.display_order}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                onClick={() =>
                                                                                    setSectionDialog({
                                                                                        mode: 'edit',
                                                                                        gradeLevel,
                                                                                        section: { ...section, grade_level_id: gradeLevel.id },
                                                                                    })
                                                                                }
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                                <span className="sr-only">Edit section</span>
                                                                            </Button>
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="text-destructive hover:text-destructive"
                                                                                onClick={() => handleDeleteSection(gradeLevel, section)}
                                                                            >
                                                                                <Trash className="h-4 w-4" />
                                                                                <span className="sr-only">Delete section</span>
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                                            Fee snapshot
                                                        </h3>
                                                        {gradeLevel.fees.length === 0 ? (
                                                            <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                                                No fees are assigned for this school year. Visit the fee structure tab to configure
                                                                amounts.
                                                            </div>
                                                        ) : (
                                                            <div className="grid gap-3">
                                                                {gradeLevel.fees.map((fee) => (
                                                                    <div
                                                                        key={fee.id}
                                                                        className="flex items-center justify-between rounded-lg border px-4 py-3"
                                                                    >
                                                                        <div>
                                                                            <p className="font-medium text-foreground">{fee.fee_type}</p>
                                                                            <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                                                                                <Badge variant={fee.is_required ? 'secondary' : 'outline'}>
                                                                                    {fee.is_required ? 'Required' : 'Optional'}
                                                                                </Badge>
                                                                                {!fee.is_active && <span>Inactive</span>}
                                                                            </div>
                                                                        </div>
                                                                        <span className="font-semibold text-foreground">
                                                                            {formatCurrency(fee.amount)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                <Button asChild variant="outline">
                                                                    <a href={feeStructureRoutes.index().url}>Open fee structures</a>
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <GradeLevelDialog state={gradeLevelDialog} close={() => setGradeLevelDialog(null)} />
                <SectionDialog state={sectionDialog} close={() => setSectionDialog(null)} gradeLevels={gradeLevels} />
            </div>
        </AppLayout>
    );
}

function GradeLevelDialog({ state, close }: { state: GradeLevelDialogState | null; close: () => void }) {
    const mode = state?.mode ?? 'create';
    const gradeLevel = state && 'gradeLevel' in state ? state.gradeLevel : undefined;

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<GradeLevelFormData>({
        name: gradeLevel?.name ?? '',
        description: gradeLevel?.description ?? '',
        display_order: gradeLevel?.display_order !== undefined && gradeLevel?.display_order !== null ? String(gradeLevel.display_order) : '',
        is_active: gradeLevel?.is_active ?? true,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        transform((formData) => {
            const payload: Record<string, unknown> = {
                name: formData.name,
                is_active: formData.is_active ? 1 : 0,
            };

            payload.description = formData.description.trim() !== '' ? formData.description : null;

            if (formData.display_order !== '') {
                payload.display_order = Number(formData.display_order);
            }

            return payload;
        });

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                close();
            },
        } as const;

        if (mode === 'create') {
            post(GradeLevelController.store.url(), options);
            return;
        }

        if (gradeLevel) {
            put(GradeLevelController.update.url({ gradeLevel: gradeLevel.id }), options);
        }
    };

    return (
        <Dialog open={state !== null} onOpenChange={(open) => !open && close()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create grade level' : `Edit ${gradeLevel?.name}`}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Introduce a new grade level to the academic catalog.'
                            : 'Adjust the details for this grade level. Changes apply immediately to new enrollments.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="grade-level-name">Name</Label>
                        <Input
                            id="grade-level-name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="e.g. Grade 7"
                            required
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="grade-level-description">Description</Label>
                        <Textarea
                            id="grade-level-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            rows={4}
                            placeholder="Optional context or learning objectives"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="grade-level-order">Display order</Label>
                            <Input
                                id="grade-level-order"
                                type="number"
                                min={0}
                                value={data.display_order}
                                onChange={(event) => setData('display_order', event.target.value)}
                                placeholder="Auto"
                            />
                            <InputError message={errors.display_order} />
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                            <Checkbox
                                id="grade-level-active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                            />
                            <Label htmlFor="grade-level-active">Active grade level</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : mode === 'create' ? 'Create' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SectionDialog({ state, close, gradeLevels }: { state: SectionDialogState | null; close: () => void; gradeLevels: GradeLevelItem[] }) {
    const gradeLevel = state?.gradeLevel;
    const section = state && 'section' in state ? state.section : undefined;
    const mode = state?.mode ?? 'create';

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<SectionFormData>({
        grade_level_id: (section?.grade_level_id ?? gradeLevel?.id ?? '').toString(),
        name: section?.name ?? '',
        description: section?.description ?? '',
        display_order: section?.display_order !== undefined && section?.display_order !== null ? String(section.display_order) : '',
        is_active: section?.is_active ?? true,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        transform((formData) => {
            const payload: Record<string, unknown> = {
                grade_level_id: Number(formData.grade_level_id),
                name: formData.name,
                is_active: formData.is_active ? 1 : 0,
            };

            payload.description = formData.description.trim() !== '' ? formData.description : null;

            if (formData.display_order !== '') {
                payload.display_order = Number(formData.display_order);
            }

            return payload;
        });

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                close();
            },
        } as const;

        if (mode === 'create') {
            post(SectionController.store.url(), options);
            return;
        }

        if (section) {
            put(SectionController.update.url({ section: section.id }), options);
        }
    };

    return (
        <Dialog open={state !== null} onOpenChange={(open) => !open && close()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? `Add a section${gradeLevel ? ` to ${gradeLevel.name}` : ''}` : `Edit ${section?.name}`}
                    </DialogTitle>
                    <DialogDescription>Sections help you organise homerooms, strands, or tracks under each grade level.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="section-grade-level">Grade level</Label>
                        <Select value={data.grade_level_id} onValueChange={(value) => setData('grade_level_id', value)}>
                            <SelectTrigger id="section-grade-level">
                                <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                            <SelectContent>
                                {gradeLevels.map((option) => (
                                    <SelectItem key={option.id} value={option.id.toString()}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.grade_level_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="section-name">Section name</Label>
                        <Input
                            id="section-name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="e.g. Section A"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="section-description">Description</Label>
                        <Textarea
                            id="section-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            rows={4}
                            placeholder="Optional notes about this section"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="section-order">Display order</Label>
                            <Input
                                id="section-order"
                                type="number"
                                min={0}
                                value={data.display_order}
                                onChange={(event) => setData('display_order', event.target.value)}
                                placeholder="Auto"
                            />
                            <InputError message={errors.display_order} />
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                            <Checkbox
                                id="section-active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                            />
                            <Label htmlFor="section-active">Active section</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : mode === 'create' ? 'Create section' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
