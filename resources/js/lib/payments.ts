/**
 * Payment utilities
 *
 * Centralized business logic for payment processing, fee calculations,
 * and currency formatting to ensure consistency across the application.
 */

/**
 * Format a numeric value as Philippine Peso currency
 *
 * @param value - The amount to format (number, string, null, or undefined)
 * @returns Formatted currency string with ₱ symbol (e.g., "₱1,234.56")
 *
 * @example
 * formatCurrency(1234.56) // "₱1,234.56"
 * formatCurrency(-100) // "-₱100.00"
 * formatCurrency(null) // "₱0.00"
 */
export function formatCurrency(value: number | string | null | undefined): string {
    const numeric = typeof value === 'string' ? Number(value) : (value ?? 0);

    if (!Number.isFinite(numeric)) {
        return '₱0.00';
    }

    const sign = numeric < 0 ? '-' : '';
    const absolute = Math.abs(numeric);

    return `${sign}₱${absolute.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Calculate the total amount from selected fee structures
 *
 * @param fees - Array of fee structures with amount properties
 * @returns Sum of all fee amounts
 */
export function calculateFeeTotal(fees: Array<{ amount: number | string }>): number {
    return fees.reduce((sum, fee) => {
        const amount = typeof fee.amount === 'string' ? Number(fee.amount) : fee.amount;
        return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
}

/**
 * Validate a payment amount
 *
 * @param amount - The amount to validate (string or number)
 * @returns Object with isValid flag and optional error message
 */
export function validatePaymentAmount(amount: string | number): {
    isValid: boolean;
    error?: string;
} {
    const numeric = typeof amount === 'string' ? Number(amount) : amount;

    if (!amount || amount === '') {
        return { isValid: false, error: 'Amount is required' };
    }

    if (!Number.isFinite(numeric)) {
        return { isValid: false, error: 'Amount must be a valid number' };
    }

    if (numeric <= 0) {
        return { isValid: false, error: 'Amount must be greater than zero' };
    }

    return { isValid: true };
}

/**
 * Calculate balance after payment
 *
 * @param currentBalance - The current outstanding balance
 * @param paymentAmount - The amount being paid
 * @returns New balance after payment (negative indicates overpayment/credit)
 */
export function calculateBalanceAfterPayment(currentBalance: number, paymentAmount: number | string): number {
    const amount = typeof paymentAmount === 'string' ? Number(paymentAmount) : paymentAmount;
    return currentBalance - (Number.isFinite(amount) ? amount : 0);
}

/**
 * Get balance tone class based on value
 *
 * @param balance - The balance amount
 * @returns Tailwind classes for text color
 */
export function getBalanceToneClass(balance: number): string {
    if (balance > 0) {
        return 'text-red-600 dark:text-red-400';
    }
    if (balance < 0) {
        return 'text-emerald-600 dark:text-emerald-400';
    }
    return 'text-slate-600 dark:text-slate-300';
}

/**
 * Check if two arrays of IDs are equal
 *
 * @param a - First array
 * @param b - Second array
 * @returns True if arrays contain the same elements in the same order
 */
export function arraysEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index]);
}
