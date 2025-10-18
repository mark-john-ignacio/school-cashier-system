/**
 * Application Constants
 *
 * Centralized configuration constants used throughout the application.
 * Extracting these values improves maintainability and provides a single
 * source of truth for application-wide settings.
 *
 * @module lib/constants
 */

/**
 * Pagination Configuration
 *
 * Default values for paginated lists throughout the application.
 */
export const PAGINATION = {
    /** Default number of items per page */
    DEFAULT_PER_PAGE: 15,

    /** Available options for items per page */
    OPTIONS: [10, 15, 25, 50] as const,
} as const;

/**
 * Date Format Configuration
 *
 * Standard date formats used across the application.
 * Based on date-fns format tokens.
 *
 * @see https://date-fns.org/docs/format
 */
export const DATE_FORMATS = {
    /** Human-readable display format: "Oct 18, 2025" */
    DISPLAY: 'MMM dd, yyyy',

    /** HTML input format: "2025-10-18" */
    INPUT: 'yyyy-MM-dd',

    /** Receipt format: "October 18, 2025" */
    RECEIPT: 'MMMM dd, yyyy',

    /** Short format: "10/18/25" */
    SHORT: 'MM/dd/yy',

    /** Full format with time: "Oct 18, 2025 2:30 PM" */
    FULL: 'MMM dd, yyyy h:mm a',
} as const;

/**
 * Currency Configuration
 *
 * Philippine Peso currency settings for consistent formatting.
 */
export const CURRENCY = {
    /** Currency code */
    CODE: 'PHP',

    /** Currency symbol */
    SYMBOL: '₱',

    /** Locale for number formatting */
    LOCALE: 'en-PH',

    /** Decimal places for currency display */
    DECIMAL_PLACES: 2,
} as const;

/**
 * Payment Method Options
 *
 * Available payment methods in the system.
 */
export const PAYMENT_METHODS = {
    CASH: 'cash',
    CHECK: 'check',
    ONLINE: 'online',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

/**
 * Payment method display labels
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PAYMENT_METHODS.CASH]: 'Cash',
    [PAYMENT_METHODS.CHECK]: 'Check',
    [PAYMENT_METHODS.ONLINE]: 'Online',
} as const;

/**
 * Student Status Options
 *
 * Possible statuses for student records.
 */
export const STUDENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    GRADUATED: 'graduated',
    TRANSFERRED: 'transferred',
} as const;

export type StudentStatus = (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];

/**
 * Student status display labels and colors
 */
export const STUDENT_STATUS_CONFIG: Record<StudentStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    [STUDENT_STATUS.ACTIVE]: { label: 'Active', variant: 'default' },
    [STUDENT_STATUS.INACTIVE]: { label: 'Inactive', variant: 'secondary' },
    [STUDENT_STATUS.GRADUATED]: { label: 'Graduated', variant: 'outline' },
    [STUDENT_STATUS.TRANSFERRED]: { label: 'Transferred', variant: 'destructive' },
} as const;

/**
 * Payment Status Thresholds
 *
 * Thresholds for determining payment status based on balance.
 */
export const PAYMENT_THRESHOLDS = {
    /** Balance below this is considered "Paid" */
    PAID_THRESHOLD: 0.01,

    /** Balance below this but above paid threshold is considered "Partially Paid" */
    PARTIAL_THRESHOLD: 1.0,
} as const;

/**
 * Payment Status Labels
 *
 * Display labels for payment statuses.
 */
export const PAYMENT_STATUS = {
    PAID: 'Paid',
    PARTIAL: 'Partially Paid',
    UNPAID: 'Unpaid',
    OVERPAID: 'Overpaid',
} as const;

/**
 * User Role Constants
 *
 * Available user roles in the system.
 * Must match roles defined in RolePermissionSeeder.
 */
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ACCOUNTANT: 'accountant',
    CASHIER: 'cashier',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/**
 * Fee Type Options
 *
 * Standard fee types used in the system.
 */
export const FEE_TYPES = {
    TUITION: 'Tuition Fee',
    MISCELLANEOUS: 'Miscellaneous Fee',
    LABORATORY: 'Laboratory Fee',
    LIBRARY: 'Library Fee',
    ATHLETIC: 'Athletic Fee',
    DEVELOPMENT: 'Development Fee',
    REGISTRATION: 'Registration Fee',
} as const;

/**
 * Form Validation Constants
 *
 * Common validation limits and constraints.
 */
export const VALIDATION = {
    /** Minimum payment amount */
    MIN_PAYMENT_AMOUNT: 0.01,

    /** Maximum payment amount (₱1,000,000) */
    MAX_PAYMENT_AMOUNT: 1000000,

    /** Maximum length for student notes */
    MAX_NOTES_LENGTH: 500,

    /** Maximum length for student names */
    MAX_NAME_LENGTH: 100,

    /** Valid student number pattern */
    STUDENT_NUMBER_PATTERN: /^\d{4}-\d{4}$/,
} as const;

/**
 * UI Configuration
 *
 * UI-related constants for consistent user experience.
 */
export const UI = {
    /** Debounce delay for search inputs (ms) */
    SEARCH_DEBOUNCE_MS: 300,

    /** Toast notification duration (ms) */
    TOAST_DURATION_MS: 3000,

    /** Animation duration for transitions (ms) */
    ANIMATION_DURATION_MS: 200,

    /** Number of recent items to show */
    RECENT_ITEMS_COUNT: 10,
} as const;

/**
 * Chart Configuration
 *
 * Configuration for charts and data visualization.
 */
export const CHARTS = {
    /** Default colors for pie/bar charts */
    COLORS: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'],

    /** Fallback colors if chart variables not defined */
    FALLBACK_COLORS: [
        '#3b82f6', // blue
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#f59e0b', // amber
        '#10b981', // green
        '#06b6d4', // cyan
    ],
} as const;

/**
 * Receipt Configuration
 *
 * Constants related to receipt generation.
 */
export const RECEIPT = {
    /** Receipt number prefix */
    PREFIX: 'RCP',

    /** Receipt number format: RCP-YYYYMMDD-NNNN */
    FORMAT: 'RCP-%s-%04d',

    /** Number of digits in sequence number */
    SEQUENCE_DIGITS: 4,
} as const;

/**
 * Application Metadata
 *
 * General application information.
 */
export const APP = {
    /** Application name */
    NAME: 'School Cashier System',

    /** Short name for limited space */
    SHORT_NAME: 'SCS',

    /** Current version */
    VERSION: '1.0.0',

    /** GitHub repository */
    GITHUB_URL: 'https://github.com/mark-john-ignacio/school-cashier-system',
} as const;

/**
 * Helper function to get payment method label
 *
 * @param method - Payment method value
 * @returns Display label for the payment method
 *
 * @example
 * ```ts
 * getPaymentMethodLabel('cash') // "Cash"
 * getPaymentMethodLabel('online') // "Online"
 * ```
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method] || method;
}

/**
 * Helper function to get student status configuration
 *
 * @param status - Student status value
 * @returns Configuration object with label and variant
 *
 * @example
 * ```ts
 * getStudentStatusConfig('active') // { label: "Active", variant: "default" }
 * ```
 */
export function getStudentStatusConfig(status: StudentStatus) {
    return STUDENT_STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
}

/**
 * Helper function to determine payment status from balance
 *
 * @param balance - Current balance (positive = owes, negative = overpaid)
 * @param expectedFees - Total expected fees
 * @returns Payment status label
 *
 * @example
 * ```ts
 * getPaymentStatus(0, 10000) // "Paid"
 * getPaymentStatus(5000, 10000) // "Partially Paid"
 * getPaymentStatus(10000, 10000) // "Unpaid"
 * getPaymentStatus(-100, 10000) // "Overpaid"
 * ```
 */
export function getPaymentStatus(balance: number, expectedFees: number): string {
    if (balance < 0) {
        return PAYMENT_STATUS.OVERPAID;
    }

    if (balance < PAYMENT_THRESHOLDS.PAID_THRESHOLD) {
        return PAYMENT_STATUS.PAID;
    }

    if (balance < expectedFees) {
        return PAYMENT_STATUS.PARTIAL;
    }

    return PAYMENT_STATUS.UNPAID;
}

/**
 * Helper function to validate student number format
 *
 * @param studentNumber - Student number to validate
 * @returns True if valid format (YYYY-NNNN)
 *
 * @example
 * ```ts
 * isValidStudentNumber('2024-0001') // true
 * isValidStudentNumber('2024-01') // false
 * isValidStudentNumber('invalid') // false
 * ```
 */
export function isValidStudentNumber(studentNumber: string): boolean {
    return VALIDATION.STUDENT_NUMBER_PATTERN.test(studentNumber);
}
