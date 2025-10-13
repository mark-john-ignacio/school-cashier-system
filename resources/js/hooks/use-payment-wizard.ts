/**
 * Payment wizard hook
 *
 * Manages multi-step payment creation flow including student selection,
 * fee catalog integration, and automatic amount calculation.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import { arraysEqual } from '@/lib/payments';
import { create as createPayments } from '@/routes/payments';
import { router } from '@inertiajs/react';

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

interface UsePaymentWizardOptions {
    initialStudent: StudentSummary | null;
    initialSearch: string;
    gradeLevelFees: FeeStructureOption[];
}

export function usePaymentWizard({ initialStudent, initialSearch, gradeLevelFees }: UsePaymentWizardOptions) {
    // Student selection state
    const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(initialStudent);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [isFetchingStudent, setIsFetchingStudent] = useState(false);

    // Wizard step state
    const [step, setStep] = useState<number>(initialStudent ? 2 : 1);

    // Fee selection state
    const [selectedFeeIds, setSelectedFeeIds] = useState<number[]>([]);
    const [amountManuallyEdited, setAmountManuallyEdited] = useState(false);

    // Refs for tracking initialization and changes
    const searchInitializedRef = useRef(false);
    const lastStudentIdRef = useRef<number | null>(initialStudent?.id ?? null);

    /**
     * Sync selected student from props (when Inertia updates)
     */
    useEffect(() => {
        setSelectedStudent(initialStudent);
        setStep(initialStudent ? 2 : 1);
    }, [initialStudent]);

    /**
     * Sync search query from props
     */
    useEffect(() => {
        setSearchQuery(initialSearch);
    }, [initialSearch]);

    /**
     * Debounced search with Inertia partial reload
     */
    useEffect(() => {
        if (!searchInitializedRef.current) {
            searchInitializedRef.current = true;
            return;
        }

        setIsFetchingStudent(true);

        const timeout = setTimeout(() => {
            router.get(
                createPayments({
                    query: {
                        search: searchQuery || undefined,
                        student_id: selectedStudent?.id ?? undefined,
                    },
                }).url,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['students', 'search', 'student', 'gradeLevelFees'],
                    onFinish: () => setIsFetchingStudent(false),
                },
            );
        }, 250);

        return () => {
            clearTimeout(timeout);
        };
    }, [searchQuery, selectedStudent?.id]);

    /**
     * Automatically select fees when student changes or grade-level fees load
     * - On student change: select all fees (required + optional)
     * - On fees update: preserve selection but ensure required fees are checked
     */
    useEffect(() => {
        if (!selectedStudent) {
            lastStudentIdRef.current = null;
            setSelectedFeeIds([]);
            return;
        }

        const nextFeeIds = gradeLevelFees.map((fee) => fee.id);

        // Student changed: reset to all fees selected
        if (lastStudentIdRef.current !== selectedStudent.id) {
            lastStudentIdRef.current = selectedStudent.id;
            setSelectedFeeIds(nextFeeIds);
            setAmountManuallyEdited(false);
            return;
        }

        // Fees updated for same student: merge with required fees
        setSelectedFeeIds((current) => {
            const requiredIds = gradeLevelFees.filter((fee) => fee.is_required).map((fee) => fee.id);
            const filtered = current.filter((id) => nextFeeIds.includes(id));
            const mergedSet = new Set([...filtered, ...requiredIds]);
            const ordered = nextFeeIds.filter((id) => mergedSet.has(id));

            if (arraysEqual(ordered, current)) {
                return current;
            }

            return ordered;
        });
    }, [selectedStudent, gradeLevelFees]);

    /**
     * Get currently selected fee structures
     */
    const selectedFees = useMemo(() => gradeLevelFees.filter((fee) => selectedFeeIds.includes(fee.id)), [gradeLevelFees, selectedFeeIds]);

    /**
     * Calculate total from selected fees
     */
    const calculatedTotal = useMemo(() => selectedFees.reduce((sum, fee) => sum + Number(fee.amount), 0), [selectedFees]);

    /**
     * Select a student and fetch their details
     */
    const handleSelectStudent = (student: StudentSummary) => {
        if (selectedStudent?.id === student.id) {
            setStep(2);
            return;
        }

        setSelectedStudent(student);
        setIsFetchingStudent(true);

        router.get(
            createPayments({
                query: {
                    student_id: student.id,
                    search: searchQuery || undefined,
                },
            }).url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                only: ['student', 'gradeLevelFees', 'students', 'search'],
                onSuccess: () => setStep(2),
                onFinish: () => setIsFetchingStudent(false),
            },
        );
    };

    /**
     * Clear selected student and return to step 1
     */
    const handleClearStudent = () => {
        setSelectedStudent(null);
        setSelectedFeeIds([]);
        setAmountManuallyEdited(false);
        setStep(1);
        setIsFetchingStudent(true);

        router.get(
            createPayments({
                query: {
                    search: searchQuery || undefined,
                },
            }).url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                only: ['student', 'gradeLevelFees', 'students', 'search'],
                onFinish: () => setIsFetchingStudent(false),
            },
        );
    };

    /**
     * Toggle a fee on/off (only for optional fees)
     */
    const toggleFee = (feeId: number, isRequired: boolean, nextState: boolean) => {
        if (isRequired) {
            return;
        }

        setSelectedFeeIds((current) => {
            if (nextState) {
                if (current.includes(feeId)) {
                    return current;
                }

                // Add and maintain order from gradeLevelFees
                const merged = [...current, feeId];
                return gradeLevelFees.filter((fee) => merged.includes(fee.id)).map((fee) => fee.id);
            }

            return current.filter((id) => id !== feeId);
        });
    };

    /**
     * Reset amount to auto-calculated total
     */
    const resetToCalculatedTotal = () => {
        setAmountManuallyEdited(false);
    };

    return {
        // Student selection
        selectedStudent,
        searchQuery,
        setSearchQuery,
        isFetchingStudent,
        handleSelectStudent,
        handleClearStudent,

        // Wizard navigation
        step,
        setStep,

        // Fee selection
        selectedFeeIds,
        selectedFees,
        calculatedTotal,
        toggleFee,

        // Amount override
        amountManuallyEdited,
        setAmountManuallyEdited,
        resetToCalculatedTotal,
    };
}
