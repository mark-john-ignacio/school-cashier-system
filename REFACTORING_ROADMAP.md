# Refactoring Roadmap

This document outlines how to gradually improve the codebase for better maintainability and developer experience.

## Completed ✅

### 1. Centralized Payment Utilities

**File**: `resources/js/lib/payments.ts`

Extracted business logic into reusable, testable functions:

- `formatCurrency()` - Consistent PHP peso formatting
- `calculateFeeTotal()` - Fee amount summation
- `validatePaymentAmount()` - Payment validation with error messages
- `calculateBalanceAfterPayment()` - Balance calculations
- `getBalanceToneClass()` - UI helper for balance display
- `arraysEqual()` - Array comparison utility

**Benefits**:

- Single source of truth for payment logic
- Easier to test and maintain
- Prevents inconsistencies across pages

### 2. Payment Wizard Hook

**File**: `resources/js/hooks/use-payment-wizard.ts`

Extracted complex wizard state management (~200 lines) from page component:

- Student selection with Inertia integration
- Fee selection with required/optional logic
- Debounced search
- Step navigation
- Amount override tracking

**Benefits**:

- Page component reduced from 814 to ~400 lines (estimated)
- Hook is reusable for similar wizards
- Logic can be tested independently
- Easier to reason about state flow

### 3. Reusable Payment Components

**File**: `resources/js/components/payments/payment-components.tsx`

Created composable UI components:

- `Stepper` - Multi-step progress indicator
- `BalanceSummary` - Student balance breakdown
- `StudentCard` - Student info display with variants
- `FeeCheckbox` - Selectable fee item
- `FeeSelectionSummary` - Selected fees overview

**Benefits**:

- Consistent UI across payment flows
- Easier to update design system-wide
- Reduced duplication in JSX

### 4. Developer Documentation

**File**: `CONTRIBUTING.md`

Comprehensive guide covering:

- Tech stack overview
- Project structure
- Code conventions (TypeScript, PHP)
- Component patterns
- State management best practices
- Styling guidelines
- Testing procedures
- Common tasks with examples

**Benefits**:

- Faster onboarding for new developers
- Clear patterns to follow
- Reduced "how do I..." questions

## Recommended Next Steps

### Phase 1: Refactor Existing Payment Page

**Effort**: 2-4 hours  
**Priority**: High

Update `resources/js/pages/payments/create.tsx` to use new utilities and hook:

```tsx
// Before: 814 lines with inline logic
export default function CreatePayment() {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedFeeIds, setSelectedFeeIds] = useState([]);
    // ... 50+ lines of useState/useEffect

    const formatCurrency = (value) => { /* inline */ };
    const handleSelectStudent = (student) => { /* 30 lines */ };
    // ... more handlers

    return (
        <Card>
            {/* 600+ lines of JSX */}
        </Card>
    );
}

// After: ~300 lines, cleaner separation
import { usePaymentWizard } from '@/hooks/use-payment-wizard';
import { StudentCard, FeeCheckbox, Stepper } from '@/components/payments/payment-components';
import { formatCurrency } from '@/lib/payments';

export default function CreatePayment() {
    const {
        selectedStudent,
        step,
        selectedFees,
        handleSelectStudent,
        toggleFee,
    } = usePaymentWizard({ ... });

    return (
        <Card>
            <Stepper currentStep={step} steps={wizardSteps} />
            {step === 1 && <StudentCard student={selectedStudent} />}
            {step === 2 && selectedFees.map(fee =>
                <FeeCheckbox key={fee.id} fee={fee} />
            )}
        </Card>
    );
}
```

**Benefits**:

- 60% reduction in component size
- Improved readability
- Demonstrates patterns for team

### Phase 2: Shared Type Definitions

**Effort**: 1-2 hours  
**Priority**: Medium

Create `resources/js/types/payments.ts`:

```typescript
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

export interface PaymentFormData {
    student_id: number | null;
    amount: string;
    payment_date: string;
    payment_purpose: string;
    payment_method: 'cash' | 'check' | 'online';
    notes: string;
}
```

Update imports across codebase:

```typescript
import { StudentSummary, FeeStructureOption } from '@/types/payments';
```

**Benefits**:

- No duplicate type definitions
- Easier to update schemas
- Better IntelliSense

### Phase 3: Feature-Based Folder Structure

**Effort**: 4-6 hours  
**Priority**: Low (breaking change)

Reorganize by domain instead of file type:

```
resources/js/
├── features/
│   ├── payments/
│   │   ├── components/
│   │   │   ├── payment-wizard.tsx
│   │   │   ├── student-card.tsx
│   │   │   └── fee-checkbox.tsx
│   │   ├── hooks/
│   │   │   └── use-payment-wizard.ts
│   │   ├── lib/
│   │   │   └── payment-utils.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── pages/
│   │       ├── index.tsx
│   │       └── create.tsx
│   ├── students/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   └── academics/
│       └── ...
└── shared/
    ├── components/
    │   └── ui/
    └── lib/
```

**Benefits**:

- Co-located related code
- Easier to find files
- Clear feature boundaries
- Scales better for large teams

**Migration strategy**:

1. Create new structure alongside old
2. Move one feature at a time
3. Update imports incrementally
4. Delete old structure when done

### Phase 4: Component Library Documentation

**Effort**: 2-3 hours  
**Priority**: Medium

Create Storybook or simple docs page showing:

- Available components with props
- Usage examples
- Visual variations

Example structure:

````markdown
# Payment Components

## StudentCard

Display student information with optional actions.

### Props

- `student: StudentSummary` - Student data
- `variant?: 'compact' | 'detailed'` - Display mode
- `showBalance?: boolean` - Show balance summary
- `onClear?: () => void` - Clear action handler
- `onContinue?: () => void` - Continue action handler

### Examples

```tsx
// Compact view for lists
<StudentCard
    student={student}
    variant="compact"
    showBalance={false}
/>

// Detailed view with actions
<StudentCard
    student={student}
    variant="detailed"
    onClear={handleClear}
    onContinue={handleNext}
/>
```
````

````

### Phase 5: TypeScript Strictness

**Effort**: 6-8 hours
**Priority**: Medium

Enable stricter TypeScript checks in `tsconfig.json`:

```json
{
    "compilerOptions": {
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true
    }
}
````

Fix resulting errors:

- Add explicit return types
- Handle undefined array access
- Remove unnecessary type assertions

**Benefits**:

- Catch more bugs at compile time
- Better IDE support
- Clearer function contracts

### Phase 6: Testing Infrastructure

**Effort**: 8-12 hours  
**Priority**: High

Set up frontend testing:

1. **Install dependencies**:

```powershell
npm install -D @testing-library/react @testing-library/jest-dom vitest jsdom
```

2. **Create test setup**:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./resources/js/test-setup.ts'],
    },
});
```

3. **Write component tests**:

```typescript
// resources/js/components/payments/__tests__/student-card.test.tsx
import { render, screen } from '@testing-library/react';
import { StudentCard } from '../payment-components';

describe('StudentCard', () => {
    it('renders student information', () => {
        const student = {
            id: 1,
            full_name: 'Juan Dela Cruz',
            student_number: 'STU-2025-0001',
            balance: 5000,
        };

        render(<StudentCard student={student} />);

        expect(screen.getByText('Juan Dela Cruz')).toBeInTheDocument();
        expect(screen.getByText('STU-2025-0001')).toBeInTheDocument();
    });
});
```

4. **Write utility tests**:

```typescript
// resources/js/lib/__tests__/payments.test.ts
import { formatCurrency, validatePaymentAmount } from '../payments';

describe('formatCurrency', () => {
    it('formats positive amounts', () => {
        expect(formatCurrency(1234.56)).toBe('₱1,234.56');
    });

    it('handles negative amounts', () => {
        expect(formatCurrency(-100)).toBe('-₱100.00');
    });

    it('handles null/undefined', () => {
        expect(formatCurrency(null)).toBe('₱0.00');
        expect(formatCurrency(undefined)).toBe('₱0.00');
    });
});

describe('validatePaymentAmount', () => {
    it('validates positive numbers', () => {
        const result = validatePaymentAmount(100);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('rejects zero', () => {
        const result = validatePaymentAmount(0);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Amount must be greater than zero');
    });
});
```

**Benefits**:

- Catch regressions early
- Safer refactoring
- Living documentation

## Measuring Success

Track these metrics to gauge improvement:

| Metric                   | Before     | Target         | Current |
| ------------------------ | ---------- | -------------- | ------- |
| Avg component size       | 500+ lines | <300 lines     | -       |
| Test coverage            | 0%         | 60%+           | 0%      |
| Type errors              | 3          | 0              | 3       |
| Duplicate code instances | Many       | <3 per pattern | -       |
| Onboarding time          | 2 weeks    | 1 week         | -       |

## Questions?

Reach out to the team lead or open a discussion in #architecture.
