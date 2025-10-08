import FeeStructureController from '@/actions/App/Http/Controllers/Settings/FeeStructureController';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import feeStructureRoutes from '@/routes/academics/fee-structures';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

interface GradeLevelOption {
    id: number;
    name: string;
}

interface FeeStructureItem {
    id: number;
    grade_level_id: number;
    grade_level_name: string | null;
    fee_type: string;
    amount: number;
    school_year: string;
    is_required: boolean;
    is_active: boolean;
    description: string | null;
}

interface FeeStructureFilters {
    grade_level_id?: string | number | null;
    school_year?: string | null;
    status?: string | null;
}

interface PageProps extends Record<string, unknown> {
    feeStructures: FeeStructureItem[];
    gradeLevels: GradeLevelOption[];
    schoolYears: (string | number)[];
    filters: FeeStructureFilters;
}

type FeeStructureDialogState =
    | { mode: 'create' }
    | {
          mode: 'edit';
          feeStructure: FeeStructureItem;
      };

type FeeStructureFormData = {
    grade_level_id: string;
    fee_type: string;
    amount: string;
    school_year: string;
    description: string;
    is_required: boolean;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Academics', href: '/academics' },
    { title: 'Fee structures', href: feeStructureRoutes.index().url },
];

const formatCurrency = (amount: number): string => `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FeeStructuresPage() {
    const { feeStructures, gradeLevels, schoolYears, filters } = usePage<PageProps>().props;
    const [dialogState, setDialogState] = useState<FeeStructureDialogState | null>(null);

    const gradeLevelFilterValue = filters?.grade_level_id ? String(filters.grade_level_id) : 'all';
    const schoolYearFilterValue = filters?.school_year ? String(filters.school_year) : 'current';
    const statusFilterValue = filters?.status ?? 'all';

    const metrics = useMemo(() => {
        const total = feeStructures.length;
        const active = feeStructures.filter((fee) => fee.is_active).length;
        const required = feeStructures.filter((fee) => fee.is_required).length;

        return [
            { title: 'Total fees configured', value: total.toString() },
            { title: 'Active this year', value: active.toString() },
            { title: 'Required fees', value: required.toString() },
        ];
    }, [feeStructures]);

    const applyFilters = (overrides: Partial<{ grade_level_id: string; school_year: string; status: string }>) => {
        const next = {
            grade_level_id: gradeLevelFilterValue,
            school_year: schoolYearFilterValue,
            status: statusFilterValue,
            ...overrides,
        };

        const query: Record<string, string> = {};

        if (next.grade_level_id !== 'all') {
            query.grade_level_id = next.grade_level_id;
        }

        if (next.school_year !== 'current') {
            query.school_year = next.school_year;
        }

        if (next.status !== 'all') {
            query.status = next.status;
        }

        router.get(FeeStructureController.index.url({ query }), {}, { preserveScroll: true, preserveState: true });
    };

    const handleDelete = (feeStructure: FeeStructureItem) => {
        if (!confirm(`Delete fee structure "${feeStructure.fee_type}" for ${feeStructure.grade_level_name ?? 'this grade level'}?`)) {
            return;
        }

        router.delete(FeeStructureController.destroy.url({ feeStructure: feeStructure.id }), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fee structures" />

            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>Fee structures</CardTitle>
                                <CardDescription>Control tuition, miscellaneous charges, and optional fees per grade level and year.</CardDescription>
                            </div>
                            <Button type="button" onClick={() => setDialogState({ mode: 'create' })} disabled={gradeLevels.length === 0}>
                                <Plus className="h-4 w-4" />
                                New fee
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {metrics.map((metric) => (
                                <Card key={metric.title} className="shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <span className="text-2xl font-semibold text-foreground">{metric.value}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="fee-grade-filter">Grade level</Label>
                                    <Select value={gradeLevelFilterValue} onValueChange={(value) => applyFilters({ grade_level_id: value })}>
                                        <SelectTrigger id="fee-grade-filter">
                                            <SelectValue placeholder="All grade levels" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All grade levels</SelectItem>
                                            {gradeLevels.map((gradeLevel) => (
                                                <SelectItem key={gradeLevel.id} value={gradeLevel.id.toString()}>
                                                    {gradeLevel.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="fee-year-filter">School year</Label>
                                    <Select value={schoolYearFilterValue} onValueChange={(value) => applyFilters({ school_year: value })}>
                                        <SelectTrigger id="fee-year-filter">
                                            <SelectValue placeholder="All school years" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="current">Current year</SelectItem>
                                            {schoolYears.map((year) => (
                                                <SelectItem key={year} value={String(year)}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="fee-status-filter">Status</Label>
                                    <Select value={statusFilterValue} onValueChange={(value) => applyFilters({ status: value })}>
                                        <SelectTrigger id="fee-status-filter">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="active">Active only</SelectItem>
                                            <SelectItem value="inactive">Inactive only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyFilters({ grade_level_id: 'all', school_year: 'current', status: 'all' })}
                                >
                                    Reset filters
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6 rounded-lg border border-border/60 bg-muted/30 p-6">
                            <HeadingSmall title="Fee library" description="Search, filter, and update the fee catalog for each grade level." />

                            {gradeLevels.length === 0 ? (
                                <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                                    Create grade levels before configuring fees.
                                </div>
                            ) : feeStructures.length === 0 ? (
                                <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                                    No fee structures match the selected filters. Add a new fee to get started.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="w-[18%]">Grade level</TableHead>
                                                <TableHead>Fee</TableHead>
                                                <TableHead className="w-[12%] text-right">Amount</TableHead>
                                                <TableHead className="w-[15%]">School year</TableHead>
                                                <TableHead className="w-[15%]">Tags</TableHead>
                                                <TableHead className="w-[10%] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {feeStructures.map((fee) => (
                                                <TableRow key={fee.id} className="hover:bg-muted/20">
                                                    <TableCell className="font-medium text-foreground">{fee.grade_level_name ?? '—'}</TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-medium text-foreground">{fee.fee_type}</p>
                                                            {fee.description && <p className="text-xs text-muted-foreground">{fee.description}</p>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-foreground">
                                                        {formatCurrency(fee.amount)}
                                                    </TableCell>
                                                    <TableCell>{fee.school_year}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Badge variant={fee.is_required ? 'secondary' : 'outline'}>
                                                                {fee.is_required ? 'Required' : 'Optional'}
                                                            </Badge>
                                                            <Badge variant={fee.is_active ? 'secondary' : 'outline'}>
                                                                {fee.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => setDialogState({ mode: 'edit', feeStructure: fee })}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => handleDelete(fee)}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                                <span className="sr-only">Delete</span>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <FeeStructureDialog
                    state={dialogState}
                    close={() => setDialogState(null)}
                    gradeLevels={gradeLevels}
                    defaultSchoolYear={schoolYearFilterValue === 'current' ? '' : schoolYearFilterValue}
                />
            </div>
        </AppLayout>
    );
}

function FeeStructureDialog({
    state,
    close,
    gradeLevels,
    defaultSchoolYear,
}: {
    state: FeeStructureDialogState | null;
    close: () => void;
    gradeLevels: GradeLevelOption[];
    defaultSchoolYear: string;
}) {
    const mode = state?.mode ?? 'create';
    const feeStructure = state && 'feeStructure' in state ? state.feeStructure : undefined;

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm<FeeStructureFormData>({
        grade_level_id: feeStructure?.grade_level_id ? feeStructure.grade_level_id.toString() : (gradeLevels[0]?.id.toString() ?? ''),
        fee_type: feeStructure?.fee_type ?? '',
        amount: feeStructure ? String(feeStructure.amount) : '',
        school_year: feeStructure?.school_year ?? defaultSchoolYear ?? '',
        description: feeStructure?.description ?? '',
        is_required: feeStructure?.is_required ?? true,
        is_active: feeStructure?.is_active ?? true,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        transform((formData) => {
            const payload: Record<string, unknown> = {
                grade_level_id: Number(formData.grade_level_id),
                fee_type: formData.fee_type,
                amount: Number(formData.amount),
                school_year: formData.school_year,
                is_required: formData.is_required ? 1 : 0,
                is_active: formData.is_active ? 1 : 0,
            };

            payload.description = formData.description.trim() !== '' ? formData.description : null;

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
            post(FeeStructureController.store.url(), options);
            return;
        }

        if (feeStructure) {
            put(FeeStructureController.update.url({ feeStructure: feeStructure.id }), options);
        }
    };

    return (
        <Dialog open={state !== null} onOpenChange={(open) => !open && close()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create fee' : `Edit ${feeStructure?.fee_type}`}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create' ? 'Add a new fee that will appear on student ledgers.' : 'Update the details for this fee structure.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="fee-grade-level">Grade level</Label>
                        <Select value={data.grade_level_id} onValueChange={(value) => setData('grade_level_id', value)}>
                            <SelectTrigger id="fee-grade-level">
                                <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                            <SelectContent>
                                {gradeLevels.map((gradeLevel) => (
                                    <SelectItem key={gradeLevel.id} value={gradeLevel.id.toString()}>
                                        {gradeLevel.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.grade_level_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fee-name">Fee name</Label>
                        <Input
                            id="fee-name"
                            value={data.fee_type}
                            onChange={(event) => setData('fee_type', event.target.value)}
                            placeholder="e.g. Tuition"
                            required
                        />
                        <InputError message={errors.fee_type} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fee-amount">Amount</Label>
                            <Input
                                id="fee-amount"
                                type="number"
                                min={0}
                                step="0.01"
                                value={data.amount}
                                onChange={(event) => setData('amount', event.target.value)}
                                placeholder="0.00"
                                required
                            />
                            <InputError message={errors.amount} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fee-year">School year</Label>
                            <Input
                                id="fee-year"
                                value={data.school_year}
                                onChange={(event) => setData('school_year', event.target.value)}
                                placeholder="2025-2026"
                                required
                            />
                            <InputError message={errors.school_year} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fee-description">Description</Label>
                        <Textarea
                            id="fee-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            rows={4}
                            placeholder="Optional notes about this fee"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="fee-required"
                                checked={data.is_required}
                                onCheckedChange={(checked) => setData('is_required', Boolean(checked))}
                            />
                            <Label htmlFor="fee-required">Required fee</Label>
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="fee-active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                            />
                            <Label htmlFor="fee-active">Active</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : mode === 'create' ? 'Create fee' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
