# Contributing to School Cashier System

Welcome to the development team! This guide will help you understand our codebase structure, conventions, and best practices.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Code Conventions](#code-conventions)
- [Component Patterns](#component-patterns)
- [State Management](#state-management)
- [Styling Guidelines](#styling-guidelines)
- [Testing](#testing)
- [Common Tasks](#common-tasks)

## Tech Stack

- **Backend**: Laravel 12 with Inertia.js for SPA behavior
- **Frontend**: React 19 + TypeScript
- **UI Library**: shadcn/ui (Radix UI primitives + Tailwind CSS v4)
- **Routing**: Laravel Wayfinder (typed route helpers)
- **Testing**: Pest (PHP), no frontend tests yet
- **Build**: Vite with SSR support

## Project Structure

### Backend (Laravel)

```
app/
├── Http/
│   ├── Controllers/     # Inertia page controllers
│   ├── Middleware/      # Request middleware
│   └── Requests/        # Form request validation
├── Models/              # Eloquent models
└── Providers/           # Service providers

routes/
├── web.php              # Main application routes
├── auth.php             # Authentication routes
└── settings.php         # Settings routes
```

### Frontend (React + TypeScript)

```
resources/js/
├── actions/             # Generated Inertia form helpers
├── routes/              # Generated typed route helpers
├── pages/               # Inertia page components
│   ├── auth/            # Authentication pages
│   ├── settings/        # Settings pages
│   ├── payments/        # Payment management
│   ├── students/        # Student management
│   └── academics/       # Academic data (grades, fees)
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   └── payments/        # Domain-specific components
├── layouts/             # Page layouts
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── types/               # TypeScript definitions
```

## Code Conventions

### TypeScript

- **Strict mode enabled**: No implicit `any`, handle null/undefined explicitly
- **File naming**: `kebab-case.tsx` for components, `kebab-case.ts` for utilities
- **Component naming**: PascalCase for React components
- **Export pattern**: Named exports for utilities, default exports for page components

```typescript
// ✅ Good
export function formatCurrency(value: number): string { ... }
export default function PaymentCreate() { ... }

// ❌ Avoid
export const formatCurrency = (value: any) => { ... }
module.exports = function PaymentCreate() { ... }
```

### PHP

- Follow Laravel conventions (PSR-12)
- Use type hints for method parameters and return types
- Leverage Eloquent relationships over raw queries
- Use form request validation classes for complex validation

```php
// ✅ Good
public function store(PaymentRequest $request): RedirectResponse
{
    $payment = Payment::create($request->validated());
    return redirect()->route('payments.index');
}

// ❌ Avoid
public function store(Request $request)
{
    $payment = new Payment();
    $payment->amount = $request->amount;
    // ...
}
```

## Component Patterns

### Page Components

Page components are the entry point for Inertia routes. They should:

1. Import shared types from centralized locations
2. Use custom hooks for complex state logic
3. Extract reusable UI into separate components
4. Keep JSX clean and readable

```tsx
// resources/js/pages/payments/create.tsx
import { usePaymentWizard } from '@/hooks/use-payment-wizard';
import { StudentCard, FeeCheckbox } from '@/components/payments/payment-components';
import AppLayout from '@/layouts/app-layout';

interface PageProps {
    student: StudentSummary | null;
    gradeLevelFees: FeeStructureOption[];
}

export default function CreatePayment() {
    const { student, gradeLevelFees } = usePage<PageProps>().props;

    const { selectedStudent, selectedFees, handleSelectStudent } = usePaymentWizard({ initialStudent: student, gradeLevelFees });

    return (
        <AppLayout>
            <StudentCard student={selectedStudent} />
            {/* ... */}
        </AppLayout>
    );
}
```

### Reusable Components

Extract components when:

- UI is repeated in 2+ places
- Logic is self-contained and testable
- Component has clear single responsibility

```tsx
// resources/js/components/payments/student-card.tsx
interface StudentCardProps {
    student: StudentSummary;
    onSelect?: (student: StudentSummary) => void;
}

export function StudentCard({ student, onSelect }: StudentCardProps) {
    return (
        <div className="rounded-lg border p-4">
            <p className="font-semibold">{student.full_name}</p>
            {onSelect && <Button onClick={() => onSelect(student)}>Select</Button>}
        </div>
    );
}
```

### Custom Hooks

Hooks should encapsulate:

- Complex state logic
- Data fetching patterns
- Side effects with cleanup

```typescript
// resources/js/hooks/use-payment-wizard.ts
export function usePaymentWizard(options: UsePaymentWizardOptions) {
    const [step, setStep] = useState(1);
    const [selectedFees, setSelectedFees] = useState<number[]>([]);

    // Complex logic here...

    return {
        step,
        selectedFees,
        handleNext: () => setStep(step + 1),
        toggleFee: (id: number) => {
            /* ... */
        },
    };
}
```

## State Management

### Inertia Form Helpers

Use `useForm` for form submissions:

```typescript
import { useForm } from '@inertiajs/react';
import { store as storePayment } from '@/routes/payments';

const { data, setData, post, processing, errors } = useForm({
    student_id: null,
    amount: '',
});

const submit = (e: FormEvent) => {
    e.preventDefault();
    post(storePayment().url);
};
```

### Local State vs Server State

- **Local state** (`useState`): UI-only (modals, tabs, form inputs)
- **Server state** (Inertia props): Data from backend (students, payments)
- **Derived state** (`useMemo`): Computed values (totals, filtered lists)

```typescript
// ✅ Good
const selectedFees = useMemo(
    () => fees.filter(fee => selectedIds.includes(fee.id)),
    [fees, selectedIds]
);

// ❌ Avoid duplicating derived data in state
const [selectedFees, setSelectedFees] = useState([]);
useEffect(() => {
    setSelectedFees(fees.filter(...));
}, [fees]);
```

## Styling Guidelines

### Tailwind CSS v4

- Use utility classes directly in JSX
- Extract repeated patterns into components, not custom CSS
- Use `cn()` helper for conditional classes

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
    'rounded-lg border p-4',
    isActive && 'border-primary bg-primary/10',
    isDisabled && 'opacity-50 cursor-not-allowed'
)}>
```

### Component Variants

Use `class-variance-authority` for variants:

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva('rounded-lg font-medium transition', {
    variants: {
        variant: {
            primary: 'bg-primary text-white',
            secondary: 'bg-secondary text-foreground',
        },
        size: {
            sm: 'px-3 py-1 text-sm',
            lg: 'px-6 py-3 text-lg',
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'lg',
    },
});
```

## Testing

### PHP Tests (Pest)

Run tests with:

```powershell
composer test
```

Example test:

```php
test('payment can be recorded', function () {
    $student = Student::factory()->create();

    $this->post(route('payments.store'), [
        'student_id' => $student->id,
        'amount' => 1000,
        'payment_date' => now()->format('Y-m-d'),
    ])->assertRedirect(route('payments.index'));

    expect(Payment::count())->toBe(1);
});
```

### Type Checking

Run TypeScript checks:

```powershell
npm run types
```

## Common Tasks

### Adding a New Page

1. **Create PHP route** in `routes/web.php`:

```php
Route::get('/payments/create', [PaymentController::class, 'create'])
    ->name('payments.create');
```

2. **Create controller method**:

```php
public function create(): Response
{
    return Inertia::render('payments/create', [
        'students' => Student::all(),
    ]);
}
```

3. **Create React page** at `resources/js/pages/payments/create.tsx`:

```tsx
export default function CreatePayment() {
    const { students } = usePage().props;
    return <AppLayout>...</AppLayout>;
}
```

4. **Use typed routes**:

```tsx
import { create as createPayment } from '@/routes/payments';

<Link href={createPayment().url}>New Payment</Link>;
```

### Adding Utility Functions

1. Create in `resources/js/lib/` with JSDoc comments
2. Export named functions
3. Write unit tests if complex logic

```typescript
/**
 * Format a number as Philippine Peso currency
 *
 * @param value - Amount to format
 * @returns Formatted string with ₱ symbol
 */
export function formatCurrency(value: number): string {
    return `₱${value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
```

### Creating Custom Hooks

1. Create in `resources/js/hooks/` with `use-` prefix
2. Document parameters and return value
3. Extract complex logic from components

```typescript
/**
 * Manage student search with debouncing
 */
export function useStudentSearch(initialQuery: string = '') {
    const [query, setQuery] = useState(initialQuery);

    useEffect(() => {
        const timeout = setTimeout(() => {
            // Fetch students...
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    return { query, setQuery };
}
```

## Questions?

- Check existing code for patterns
- Review Laravel and React documentation
- Ask team members in #dev-questions

Happy coding! 🚀
