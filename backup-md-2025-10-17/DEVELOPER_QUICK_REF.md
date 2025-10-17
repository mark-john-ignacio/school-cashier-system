# Developer Quick Reference

Quick lookup for common patterns and utilities in the codebase.

## 🚀 Quick Commands

```powershell
# Development
composer run dev              # Start PHP + Vite
composer run dev:ssr          # Start with SSR + logs

# Testing
composer test                 # Run PHP tests
npm run types                 # Check TypeScript

# Code Quality
npm run lint                  # ESLint check
npm run format:check          # Prettier check
npm run format                # Auto-format code

# Build
npm run build                 # Build client assets
npm run build:ssr             # Build SSR bundle
```

## 📦 Import Cheat Sheet

### Utilities

```typescript
// Currency & validation
import {
    formatCurrency, // Format as ₱1,234.56
    calculateFeeTotal, // Sum fee amounts
    validatePaymentAmount, // Validate payment input
    calculateBalanceAfterPayment,
    getBalanceToneClass, // Get Tailwind color class
} from '@/lib/payments';

// Class names
import { cn } from '@/lib/utils';
```

### Hooks

```typescript
// Payment wizard state
import { usePaymentWizard } from '@/hooks/use-payment-wizard';

// Inertia form handling
import { useForm, usePage, router } from '@inertiajs/react';
```

### Components

```typescript
// Payment-specific
import { Stepper, BalanceSummary, StudentCard, FeeCheckbox, FeeSelectionSummary } from '@/components/payments/payment-components';

// UI primitives (shadcn)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// ... see resources/js/components/ui/ for more
```

### Routing

```typescript
// Typed route helpers (auto-generated)
import {
    index as indexPayments,
    create as createPayments,
    store as storePayment,
    show as showPayment,
} from '@/routes/payments';

// Usage
<Link href={createPayments().url}>Create</Link>
<Link href={showPayment({ payment: 123 }).url}>View</Link>

// With query params
<Link href={indexPayments({ query: { search: 'foo' } }).url}>
    Search
</Link>

// Form actions
<Form {...storePayment.form()}>
    {/* ... */}
</Form>
```

## 🎨 Common Patterns

### Currency Formatting

```typescript
import { formatCurrency } from '@/lib/payments';

// Simple usage
<p>{formatCurrency(1234.56)}</p>  // ₱1,234.56

// With null safety
<p>{formatCurrency(student.balance)}</p>  // handles null/undefined

// In calculations
const total = formatCurrency(
    fees.reduce((sum, fee) => sum + Number(fee.amount), 0)
);
```

### Payment Wizard Hook

```typescript
import { usePaymentWizard } from '@/hooks/use-payment-wizard';

const {
    // Student state
    selectedStudent,
    searchQuery,
    setSearchQuery,
    isFetchingStudent,

    // Actions
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
} = usePaymentWizard({
    initialStudent: props.student,
    initialSearch: props.search,
    gradeLevelFees: props.gradeLevelFees,
});
```

### Inertia Form

```typescript
import { useForm } from '@inertiajs/react';
import { store as storePayment } from '@/routes/payments';

const { data, setData, post, processing, errors, reset } = useForm({
    student_id: null,
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
});

const submit = (e: FormEvent) => {
    e.preventDefault();
    post(storePayment().url, {
        onSuccess: () => reset('amount'),
        onError: (errors) => console.error(errors),
    });
};
```

### Conditional Classes

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
    'base-classes',
    condition && 'conditional-class',
    anotherCondition ? 'true-class' : 'false-class',
    {
        'dynamic-class': someValue > 10
    }
)}>
```

### Balance Display

```typescript
import { formatCurrency, getBalanceToneClass } from '@/lib/payments';
import { cn } from '@/lib/utils';

<span className={cn('font-semibold', getBalanceToneClass(balance))}>
    {formatCurrency(balance)}
</span>

// Colors:
// Positive (owed) → red-600
// Negative (credit) → emerald-600
// Zero → slate-600
```

## 🧩 Component Examples

### Student Card

```typescript
<StudentCard
    student={selectedStudent}
    variant="detailed"           // or "compact"
    showBalance={true}
    onClear={() => handleClear()}
    onContinue={() => setStep(2)}
/>
```

### Fee Checkbox

```typescript
{fees.map(fee => (
    <FeeCheckbox
        key={fee.id}
        fee={fee}
        checked={selectedFeeIds.includes(fee.id)}
        onCheckedChange={(checked) => toggleFee(fee.id, checked)}
    />
))}
```

### Stepper

```typescript
const steps = [
    { id: 1, title: 'Select student', description: '...' },
    { id: 2, title: 'Payment details', description: '...' },
];

<Stepper currentStep={currentStep} steps={steps} />
```

### Balance Summary

```typescript
<BalanceSummary
    outstandingBalance={student.balance}
    expectedFees={student.expected_fees}
    totalPaid={student.total_paid}
/>
```

## 📝 Type Definitions

### Student Summary

```typescript
interface StudentSummary {
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
```

### Fee Structure

```typescript
interface FeeStructureOption {
    id: number;
    fee_type: string;
    amount: number;
    description: string | null;
    is_required: boolean;
    school_year?: string | null;
}
```

### Payment Form Data

```typescript
interface PaymentFormData {
    student_id: number | null;
    amount: string;
    payment_date: string;
    payment_purpose: string;
    payment_method: 'cash' | 'check' | 'online';
    notes: string;
}
```

## 🔍 Debugging Tips

### Check Inertia Props

```typescript
const props = usePage().props;
console.log('Page props:', props);
```

### Monitor Route Changes

```typescript
router.on('navigate', (event) => {
    console.log('Navigating to:', event.detail.page.url);
});
```

### Inspect Form State

```typescript
const form = useForm({ ... });

useEffect(() => {
    console.log('Form data:', form.data);
    console.log('Form errors:', form.errors);
    console.log('Processing:', form.processing);
}, [form.data, form.errors, form.processing]);
```

### Debug Hook State

```typescript
const wizard = usePaymentWizard({ ... });

useEffect(() => {
    console.log('Wizard state:', {
        step: wizard.step,
        student: wizard.selectedStudent,
        fees: wizard.selectedFees,
        total: wizard.calculatedTotal,
    });
}, [wizard.step, wizard.selectedStudent, wizard.selectedFees]);
```

## 🎯 Best Practices

### DO ✅

```typescript
// Use typed routes
import { create } from '@/routes/payments';
<Link href={create().url}>Create</Link>

// Use utility functions
import { formatCurrency } from '@/lib/payments';
const formatted = formatCurrency(amount);

// Use custom hooks for complex state
const wizard = usePaymentWizard({ ... });

// Extract reusable components
<StudentCard student={student} />

// Use cn() for conditional classes
className={cn('base', isActive && 'active')}
```

### DON'T ❌

```typescript
// Don't use string routes
<Link href="/payments/create">Create</Link>

// Don't inline formatting logic
const formatted = `₱${amount.toLocaleString()}`;

// Don't put complex state in components
const [selectedStudent, setSelectedStudent] = useState(null);
const [searchQuery, setSearchQuery] = useState('');
// ... 10+ more useState hooks

// Don't duplicate markup
<div className="rounded-lg border p-4">
    <p>{student.full_name}</p>
    {/* ... repeated everywhere */}
</div>

// Don't concatenate classes
className={"base " + (isActive ? "active" : "")}
```

## 📚 Additional Resources

- **CONTRIBUTING.md** - Full coding guidelines
- **ARCHITECTURE_GUIDE.md** - Visual architecture overview
- **REFACTORING_ROADMAP.md** - Improvement plan
- **Laravel Docs** - https://laravel.com/docs/12.x
- **Inertia.js** - https://inertiajs.com/
- **React + TypeScript** - https://react-typescript-cheatsheet.netlify.app/

---

**Keep this handy!** Bookmark or print for quick reference while coding.
