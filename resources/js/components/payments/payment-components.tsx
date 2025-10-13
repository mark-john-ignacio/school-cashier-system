/**
 * Reusable payment components
 *
 * Shared UI components for payment workflows
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, getBalanceToneClass } from '@/lib/payments';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export interface StudentSummary {
    id: number;
    student_number: string;
    full_name: string;
    grade_level_id?: number | null;
    grade_level: string | null;
    section: string | null;
    balance: number;
    total_paid?: number;
    expected_fees?: number;
}

export interface FeeStructureOption {
    id: number;
    fee_type: string;
    amount: number;
    description: string | null;
    is_required: boolean;
    school_year?: string | null;
}

interface StepperProps {
    currentStep: number;
    steps: Array<{
        id: number;
        title: string;
        description: string;
    }>;
}

export function Stepper({ currentStep, steps }: StepperProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                {steps.map((step) => {
                    const isComplete = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div key={step.id} className="flex items-start gap-3">
                            <div
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition',
                                    isComplete
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : isActive
                                          ? 'border-primary text-primary'
                                          : 'border-border text-muted-foreground',
                                )}
                            >
                                {isComplete ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                            </div>
                            <div className="space-y-1">
                                <p className={cn('text-sm font-medium', isActive || isComplete ? 'text-foreground' : 'text-muted-foreground')}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <Separator />
        </div>
    );
}

interface BalanceSummaryProps {
    outstandingBalance: number;
    expectedFees?: number;
    totalPaid?: number;
}

export function BalanceSummary({ outstandingBalance, expectedFees = 0, totalPaid = 0 }: BalanceSummaryProps) {
    const balanceTone = getBalanceToneClass(outstandingBalance);

    return (
        <div className="grid gap-3 rounded-lg border border-border/40 bg-muted/30 p-4 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Outstanding balance</span>
                <span className={cn('font-semibold', balanceTone)}>{formatCurrency(outstandingBalance)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total expected this year</span>
                <span className="font-medium text-foreground">{formatCurrency(expectedFees)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total paid so far</span>
                <span className="font-medium text-foreground">{formatCurrency(totalPaid)}</span>
            </div>
        </div>
    );
}

interface StudentCardProps {
    student: StudentSummary;
    variant?: 'compact' | 'detailed';
    showBalance?: boolean;
    onClear?: () => void;
    onContinue?: () => void;
}

export function StudentCard({ student, variant = 'detailed', showBalance = true, onClear, onContinue }: StudentCardProps) {
    return (
        <div className="flex flex-col gap-4 rounded-lg border border-border/50 bg-muted/40 p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-base font-semibold text-foreground">{student.full_name}</p>
                    <p className="text-sm text-muted-foreground">{student.student_number}</p>
                    {variant === 'detailed' && <p className="text-xs text-muted-foreground">Section {student.section ?? '—'}</p>}
                </div>
                <Badge variant="secondary">{student.grade_level ?? 'Unassigned'}</Badge>
            </div>

            {showBalance && (
                <BalanceSummary outstandingBalance={student.balance} expectedFees={student.expected_fees} totalPaid={student.total_paid} />
            )}

            {(onClear || onContinue) && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {onClear && (
                        <Button type="button" variant="ghost" onClick={onClear}>
                            Clear selection
                        </Button>
                    )}
                    {onContinue && (
                        <Button type="button" onClick={onContinue}>
                            Continue to payment
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

interface FeeCheckboxProps {
    fee: FeeStructureOption;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export function FeeCheckbox({ fee, checked, onCheckedChange }: FeeCheckboxProps) {
    return (
        <label
            className={cn(
                'flex items-start gap-3 rounded-lg border border-border/40 bg-card/60 p-4 transition hover:border-primary/40 hover:bg-primary/5',
                checked && 'border-primary bg-primary/10',
            )}
        >
            <Checkbox checked={checked} disabled={fee.is_required} onCheckedChange={onCheckedChange} className="mt-1" />
            <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{fee.fee_type}</p>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(fee.amount)}</span>
                </div>
                {fee.description && <p className="text-xs text-muted-foreground">{fee.description}</p>}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant={fee.is_required ? 'secondary' : 'outline'}>{fee.is_required ? 'Required' : 'Optional'}</Badge>
                    {fee.school_year && <Badge variant="outline">SY {fee.school_year}</Badge>}
                </div>
            </div>
        </label>
    );
}

interface FeeSelectionSummaryProps {
    selectedFees: FeeStructureOption[];
    totalAmount: number;
}

export function FeeSelectionSummary({ selectedFees, totalAmount }: FeeSelectionSummaryProps) {
    return (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Selected fees ({selectedFees.length})</span>
                <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
            </div>
            {selectedFees.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {selectedFees.map((fee) => (
                        <Badge key={fee.id} variant="outline">
                            {fee.fee_type}
                        </Badge>
                    ))}
                </div>
            ) : (
                <p className="mt-2 text-xs text-muted-foreground">No fees selected. You can still record a payment by entering a custom amount.</p>
            )}
        </div>
    );
}
