# Architecture Evolution

Visual guide to understanding the codebase improvements.

## Before: Monolithic Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│  payments/create.tsx (814 lines)                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  State Management (10+ useState)               │    │
│  │  • selectedStudent                              │    │
│  │  • searchQuery                                  │    │
│  │  • step                                         │    │
│  │  • selectedFeeIds                               │    │
│  │  • amountManuallyEdited                         │    │
│  │  • isFetchingStudent                            │    │
│  │  • ... more ...                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Effects (5+ useEffect)                         │    │
│  │  • Sync props                                   │    │
│  │  • Debounced search                             │    │
│  │  • Fee selection logic                          │    │
│  │  • Amount calculation                           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Inline Utilities                               │    │
│  │  • formatCurrency (duplicated)                  │    │
│  │  • arraysEqual                                  │    │
│  │  • balance tone calculation                     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Event Handlers                                 │    │
│  │  • handleSelectStudent (30 lines)               │    │
│  │  • handleClearStudent (20 lines)                │    │
│  │  • toggleFee (15 lines)                         │    │
│  │  • handleAmountInputChange (10 lines)           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  JSX (600+ lines)                               │    │
│  │  • Stepper markup                               │    │
│  │  • Student card markup                          │    │
│  │  • Fee checkbox markup                          │    │
│  │  • Balance summary markup                       │    │
│  │  • Form inputs                                  │    │
│  │  • Buttons and actions                          │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

Problems:
❌ Hard to test (everything coupled)
❌ Hard to reuse (everything inline)
❌ Hard to understand (too much in one place)
❌ Hard to maintain (change ripples everywhere)
```

## After: Modular Component Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  payments/create.tsx (~300 lines)                                │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Imports                                                 │    │
│  │  import { usePaymentWizard } from '@/hooks'              │    │
│  │  import { StudentCard, FeeCheckbox } from '@/components' │    │
│  │  import { formatCurrency } from '@/lib/payments'         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Hook Usage                                              │    │
│  │  const wizard = usePaymentWizard({ ... })                │    │
│  │                                                           │    │
│  │  // All complex state managed by hook                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Clean JSX (~200 lines)                                  │    │
│  │  <Stepper currentStep={wizard.step} />                   │    │
│  │  <StudentCard student={wizard.selectedStudent} />        │    │
│  │  {wizard.selectedFees.map(fee =>                         │    │
│  │    <FeeCheckbox fee={fee} />                             │    │
│  │  )}                                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Custom Hook  │  │  Components   │  │  Utilities    │
│               │  │               │  │               │
│ use-payment-  │  │ payment-      │  │ payments.ts   │
│ wizard.ts     │  │ components    │  │               │
│               │  │ .tsx          │  │               │
│ • State mgmt  │  │ • StudentCard │  │ • formatCurr. │
│ • Effects     │  │ • FeeCheckbox │  │ • validate    │
│ • Handlers    │  │ • Stepper     │  │ • calculate   │
│ • Inertia     │  │ • Balance     │  │ • helpers     │
│               │  │   Summary     │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
  (Reusable)         (Reusable)         (Reusable)
  (Testable)         (Testable)         (Testable)

Benefits:
✅ Easy to test (isolated units)
✅ Easy to reuse (composable pieces)
✅ Easy to understand (single responsibility)
✅ Easy to maintain (changes localized)
```

## Component Composition Flow

```
                      ┌─────────────────┐
                      │   Page Layer    │
                      │  (Inertia Page) │
                      └────────┬────────┘
                               │
                  ┌────────────┼────────────┐
                  │                         │
         ┌────────▼────────┐       ┌───────▼────────┐
         │  Business Logic │       │   UI Rendering │
         │      Layer      │       │      Layer     │
         └────────┬────────┘       └───────┬────────┘
                  │                         │
     ┌────────────┼────────────┐           │
     │                         │           │
┌────▼─────┐         ┌────────▼────┐      │
│  Hooks   │         │  Utilities  │      │
│          │         │             │      │
│ • State  │         │ • Format    │      │
│ • Effects│         │ • Validate  │      │
│ • Handlers│        │ • Calculate │      │
└──────────┘         └─────────────┘      │
                                           │
                              ┌────────────┼────────────┐
                              │                         │
                     ┌────────▼────────┐   ┌───────────▼────────┐
                     │  UI Components  │   │  shadcn/ui Base    │
                     │   (Domain)      │   │    Components      │
                     │                 │   │                    │
                     │ • StudentCard   │   │ • Card             │
                     │ • FeeCheckbox   │   │ • Button           │
                     │ • Stepper       │   │ • Input            │
                     └─────────────────┘   │ • Badge            │
                                           └────────────────────┘
```

## Data Flow Pattern

### Before (Tangled)

```
User Action
    │
    ▼
Component Handler (30 lines)
    │
    ├──► Inline calculation
    │
    ├──► State update
    │
    ├──► Effect triggers
    │
    └──► Inertia call
              │
              ▼
         Backend updates props
              │
              ▼
         Effect runs again
              │
              ▼
         More state updates
              │
              ▼
         Another effect
              │
              ▼
         ... cycles continue ...
```

### After (Clean)

```
User Action
    │
    ▼
Hook Handler (clear responsibility)
    │
    ├──► Utility calculates
    │      │
    │      └──► formatCurrency()
    │      └──► validatePaymentAmount()
    │
    ├──► Hook updates internal state
    │
    └──► Inertia call (if needed)
              │
              ▼
         Backend updates props
              │
              ▼
         Hook syncs (single useEffect)
              │
              ▼
         Component re-renders
              │
              ▼
         Done (predictable)
```

## File Organization Comparison

### Before: Type-Based Structure

```
resources/js/
├── pages/
│   └── payments/
│       └── create.tsx (everything here)
├── components/
│   └── ui/
│       └── (only generic shadcn components)
└── lib/
    └── utils.ts (just cn() helper)
```

### After: Feature-Based Structure (Recommended)

```
resources/js/
├── features/
│   └── payments/
│       ├── pages/
│       │   ├── index.tsx
│       │   └── create.tsx (slim)
│       ├── components/
│       │   ├── student-card.tsx
│       │   ├── fee-checkbox.tsx
│       │   └── payment-wizard.tsx
│       ├── hooks/
│       │   └── use-payment-wizard.ts
│       ├── lib/
│       │   └── payment-utils.ts
│       └── types/
│           └── index.ts
├── shared/
│   ├── components/
│   │   └── ui/ (shadcn)
│   └── lib/
│       └── utils.ts
└── layouts/
```

## Dependency Graph

### Before

```
create.tsx
    └─ No dependencies
       (everything inline)

Problems:
• Can't reuse logic
• Can't test in isolation
• Can't update without touching main file
```

### After

```
create.tsx
    ├─ usePaymentWizard
    │    ├─ @/lib/payments
    │    └─ @/routes/payments
    ├─ StudentCard
    │    ├─ BalanceSummary
    │    └─ Badge
    ├─ FeeCheckbox
    │    ├─ Checkbox
    │    └─ Badge
    └─ @/lib/payments

Benefits:
• Each piece testable
• Can reuse anywhere
• Update centrally
• Clear boundaries
```

## Testing Strategy

### Before: Impossible

```
❌ Can't test formatCurrency (inline)
❌ Can't test validation (inline)
❌ Can't test state logic (coupled to component)
❌ Can't test UI (too much logic mixed in)

→ Manual testing only
→ Bugs slip through
```

### After: Comprehensive

```
✅ Unit test utilities
   • formatCurrency.test.ts
   • validatePaymentAmount.test.ts

✅ Unit test hooks
   • use-payment-wizard.test.ts
   • Mock Inertia router
   • Test state transitions

✅ Component tests
   • StudentCard.test.tsx
   • FeeCheckbox.test.tsx
   • Test props and events

✅ Integration test page
   • create.test.tsx
   • Test full flow

→ Automated confidence
→ Safe refactoring
```

## Summary

The refactoring transforms a **monolithic 814-line component** into a **modular architecture** with clear separation of concerns:

1. **Utilities** handle pure calculations
2. **Hooks** manage complex state
3. **Components** render UI
4. **Pages** orchestrate everything

This makes the code:

- **30-40% smaller** per component
- **100% more testable** (can test each piece)
- **Infinitely more reusable** (use anywhere)
- **Much easier to understand** (single responsibility)

---

**Next**: See CONTRIBUTING.md for coding patterns, REFACTORING_ROADMAP.md for implementation plan.
