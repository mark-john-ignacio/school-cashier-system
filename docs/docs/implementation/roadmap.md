# Implementation Roadmap - Missing Features

This document outlines the features that need to be built to make the School Cashier System production-ready.

---

## 🎯 Priority 1: Critical Features (Build First)

### 1. Fee Structure Management UI

**Current State**: Fee structures exist in database but can only be managed via seeders  
**Problem**: No way for administrators to add/edit fees without database access  
**Impact**: Cannot adjust fees for new school years or make corrections

**Solution**: Build a complete Fee Structure CRUD interface

#### Pages to Create:

```
/fee-structures
├── /index - List all fee structures
├── /create - Add new fee structure
├── /edit/{id} - Edit existing fee
└── /bulk-clone - Clone fees from previous year
```

#### Features:

**Index Page** (`/fee-structures`):

```tsx
Filters:
├── School Year (dropdown: 2024-2025, 2025-2026, etc.)
├── Grade Level (dropdown: All, Grade 1, Grade 2, etc.)
├── Fee Type (dropdown: All, Tuition, Miscellaneous, etc.)
└── Status (Active / Inactive)

Table Columns:
├── Grade Level
├── Fee Type
├── Amount
├── School Year
├── Status (Active badge)
└── Actions (Edit, Deactivate)

Actions:
├── "Create Fee Structure" button
├── "Clone from Previous Year" button
└── Bulk activate/deactivate
```

**Create/Edit Form**:

```tsx
Fee Structure Form:
├── Grade Level (select: Grade 1-12)
├── Fee Type (select: Tuition, Miscellaneous, Books, Laboratory, Other)
├── Amount (number input with ₱ prefix)
├── School Year (select: 2024-2025, 2025-2026, etc.)
├── Description (textarea, optional)
├── Is Active (checkbox, default: true)
└── Actions: Save / Cancel

Validations:
├── Unique constraint: grade_level + fee_type + school_year
├── Amount must be > 0
└── Cannot edit if students are already enrolled for that grade/year
```

**Bulk Clone Feature**:

```tsx
Clone Fees Wizard:
Step 1: Select source school year (e.g., 2024-2025)
Step 2: Select target school year (e.g., 2025-2026)
Step 3: Preview fees to be cloned (all active fees)
Step 4: Adjust amounts (optional):
        ├── Increase by percentage (+5%, +10%)
        ├── Increase by fixed amount (+₱1,000)
        └── Or keep same
Step 5: Confirm and clone

Result: All Grade 1-12 fees duplicated for new year
```

#### Database (Already Exists):

```sql
fee_structures
├── id
├── grade_level (varchar: 'Grade 1', 'Grade 7', etc.)
├── fee_type (varchar: 'Tuition', 'Miscellaneous', etc.)
├── amount (decimal)
├── school_year (varchar: '2024-2025')
├── description (text, nullable)
├── is_active (boolean)
└── timestamps

Unique: (grade_level, fee_type, school_year)
```

#### Backend Routes:

```php
// routes/web.php
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/fee-structures', [FeeStructureController::class, 'index'])->name('fee-structures.index');
    Route::get('/fee-structures/create', [FeeStructureController::class, 'create'])->name('fee-structures.create');
    Route::post('/fee-structures', [FeeStructureController::class, 'store'])->name('fee-structures.store');
    Route::get('/fee-structures/{feeStructure}/edit', [FeeStructureController::class, 'edit'])->name('fee-structures.edit');
    Route::put('/fee-structures/{feeStructure}', [FeeStructureController::class, 'update'])->name('fee-structures.update');
    Route::delete('/fee-structures/{feeStructure}', [FeeStructureController::class, 'destroy'])->name('fee-structures.destroy');
    Route::post('/fee-structures/clone', [FeeStructureController::class, 'clone'])->name('fee-structures.clone');
});
```

#### Estimated Time: 2-3 days

---

### 2. School Year Management & Enrollment Tracking

**Current State**: No concept of "school year" - students just have a grade_level  
**Problem**: Cannot separate 2024 payments from 2025 payments for same student  
**Impact**: When student is promoted, all payment history merges together

**Solution**: Create an Enrollment system that tracks student × school year

#### New Database Tables:

```sql
-- Master list of school years
school_years
├── id
├── year (varchar: '2024-2025', '2025-2026')
├── start_date (date: '2024-06-01')
├── end_date (date: '2025-05-31')
├── is_current (boolean) -- Only one can be true
├── status (enum: 'upcoming', 'active', 'closed')
└── timestamps

-- Student enrollment per school year
enrollments
├── id
├── student_id (foreign key)
├── school_year_id (foreign key)
├── grade_level (varchar: 'Grade 7')
├── section (varchar: 'Section A')
├── enrollment_date (date)
├── status (enum: 'active', 'graduated', 'transferred', 'dropped')
├── notes (text, nullable)
└── timestamps

Unique: (student_id, school_year_id)

-- Link payments to specific enrollment
payments (modify existing)
├── id
├── enrollment_id (foreign key) -- CHANGE from student_id
├── user_id (cashier)
├── receipt_number
├── amount
├── payment_date
├── payment_purpose
├── payment_method
├── notes
└── timestamps
```

#### Migration Strategy:

```php
// Migration: Add enrollments table
Schema::create('enrollments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('student_id')->constrained()->onDelete('cascade');
    $table->foreignId('school_year_id')->constrained();
    $table->string('grade_level');
    $table->string('section');
    $table->date('enrollment_date');
    $table->enum('status', ['active', 'graduated', 'transferred', 'dropped'])->default('active');
    $table->text('notes')->nullable();
    $table->timestamps();

    $table->unique(['student_id', 'school_year_id']);
    $table->index('school_year_id');
});

// Migration: Modify payments table
Schema::table('payments', function (Blueprint $table) {
    $table->foreignId('enrollment_id')->nullable()->after('id')->constrained();
    // Keep student_id for backward compatibility, but prefer enrollment_id
});

// Data Migration: Create current enrollments from existing students
$currentYear = SchoolYear::where('is_current', true)->first();
Student::all()->each(function ($student) use ($currentYear) {
    Enrollment::create([
        'student_id' => $student->id,
        'school_year_id' => $currentYear->id,
        'grade_level' => $student->grade_level,
        'section' => $student->section,
        'enrollment_date' => $student->created_at,
        'status' => 'active',
    ]);
});
```

#### Updated Models:

```php
// app/Models/Enrollment.php
class Enrollment extends Model
{
    protected $fillable = [
        'student_id',
        'school_year_id',
        'grade_level',
        'section',
        'enrollment_date',
        'status',
        'notes',
    ];

    public function student() {
        return $this->belongsTo(Student::class);
    }

    public function schoolYear() {
        return $this->belongsTo(SchoolYear::class);
    }

    public function payments() {
        return $this->hasMany(Payment::class);
    }

    // Calculate expected fees for this enrollment
    public function getExpectedFeesAttribute(): float {
        return FeeStructure::where('grade_level', $this->grade_level)
            ->where('school_year', $this->schoolYear->year)
            ->where('is_active', true)
            ->sum('amount');
    }

    // Calculate total paid for this enrollment
    public function getTotalPaidAttribute(): float {
        return $this->payments()->sum('amount');
    }

    // Calculate balance
    public function getBalanceAttribute(): float {
        return $this->expected_fees - $this->total_paid;
    }
}

// app/Models/Student.php (updated)
class Student extends Model
{
    // ... existing code ...

    public function enrollments() {
        return $this->hasMany(Enrollment::class);
    }

    public function currentEnrollment() {
        $currentYear = SchoolYear::where('is_current', true)->first();
        return $this->enrollments()
            ->where('school_year_id', $currentYear->id)
            ->where('status', 'active')
            ->first();
    }

    // Deprecated: Use currentEnrollment()->expected_fees instead
    public function getExpectedFeesAttribute(): float {
        return $this->currentEnrollment()?->expected_fees ?? 0;
    }
}
```

#### New Pages:

```
/school-years
├── /index - List all school years
├── /create - Create new school year
└── /edit/{id} - Edit school year settings

/enrollments
├── /index - List all enrollments (filterable by year)
├── /create - Enroll student for a year
└── /bulk-promote - Promote multiple students to next grade
```

#### Year-End Rollover Workflow:

```tsx
End of School Year Process:
Step 1: Close current school year (2024-2025)
        └── Mark as 'closed', set is_current = false

Step 2: Create new school year (2025-2026)
        └── Set dates, fees, is_current = true

Step 3: Bulk student promotion
        ├── Select students to promote (Grade 1 → Grade 2, etc.)
        ├── Select students graduating (Grade 12 → graduated)
        ├── Preview promotion list
        └── Execute:
            ├── Create new enrollments for promoted students
            ├── Mark old enrollments as 'graduated' or 'promoted'
            └── Students start new year with ₱0 balance

Step 4: System now tracks:
        ├── 2024-2025 enrollment: Juan Grade 7 (₱42,000 paid, ₱0 balance) ✅
        └── 2025-2026 enrollment: Juan Grade 8 (₱0 paid, ₱42,000 balance) ⚠️
```

#### Estimated Time: 4-5 days

---

### 3. Required vs Optional Fees

**Current State**: All fees in FeeStructure are treated as required  
**Problem**: Optional fees (field trips, extra books) inflate the expected balance  
**Impact**: Students appear "outstanding" when they've paid all required fees

**Solution**: Add `is_required` flag to fee structures

#### Database Change:

```sql
ALTER TABLE fee_structures ADD COLUMN is_required BOOLEAN DEFAULT true;

Examples:
├── Tuition - Required ✓
├── Miscellaneous - Required ✓
├── Books - Required ✓
├── Laboratory - Required ✓
├── Field Trip - Optional ✗
└── Extra Curriculum - Optional ✗
```

#### Updated Logic:

```php
// app/Models/Enrollment.php
public function getRequiredFeesAttribute(): float {
    return FeeStructure::where('grade_level', $this->grade_level)
        ->where('school_year', $this->schoolYear->year)
        ->where('is_active', true)
        ->where('is_required', true) // Only required
        ->sum('amount');
}

public function getOptionalFeesAttribute(): float {
    return FeeStructure::where('grade_level', $this->grade_level)
        ->where('school_year', $this->schoolYear->year)
        ->where('is_active', true)
        ->where('is_required', false) // Only optional
        ->sum('amount');
}

public function getBalanceAttribute(): float {
    // Balance based on required fees only
    return $this->required_fees - $this->total_paid;
}

public function getPaymentStatusAttribute(): string {
    $balance = $this->balance;

    if ($balance <= 0) {
        return 'paid'; // All required fees paid
    }

    if ($this->total_paid > 0) {
        return 'partial';
    }

    return 'outstanding';
}
```

#### UI Changes:

```tsx
Student Profile:
┌────────────────────────────────────┐
│ Required Fees       ₱42,000        │
│ Optional Fees       ₱3,000         │
│ ───────────────────────────────    │
│ Total Fees          ₱45,000        │
├────────────────────────────────────┤
│ Paid (Required)     ₱42,000 ✅    │
│ Paid (Optional)     ₱2,000         │
│ ───────────────────────────────    │
│ Total Paid          ₱44,000        │
├────────────────────────────────────┤
│ Balance (Required)  ₱0 ✅          │
│ Balance (Optional)  ₱1,000 ⚠️      │
└────────────────────────────────────┘

Status: PAID (required fees complete)
Note: ₱1,000 optional fees unpaid (Field Trip)
```

#### Estimated Time: 1 day

---

## 🎯 Priority 2: Important Features (Build Next)

### 4. Payment Plans / Installment Management

**Problem**: No way to set payment schedules or track installment due dates  
**Solution**: Create a payment plan system

#### New Tables:

```sql
payment_plans
├── id
├── enrollment_id
├── plan_name (varchar: '4 Installments', 'Quarterly', etc.)
├── total_amount (decimal)
├── created_by (user_id)
├── status (enum: 'active', 'completed', 'defaulted')
└── timestamps

payment_plan_items
├── id
├── payment_plan_id
├── installment_number (int: 1, 2, 3, 4)
├── due_date (date)
├── amount (decimal)
├── status (enum: 'pending', 'paid', 'overdue')
├── paid_on (date, nullable)
└── timestamps
```

#### Features:

```tsx
Create Payment Plan:
├── Select Enrollment
├── Total Amount: ₱42,000
├── Plan Type:
│   ├── Monthly (12 installments)
│   ├── Quarterly (4 installments)
│   ├── Semi-Annual (2 installments)
│   └── Custom
├── Start Date: June 1, 2024
└── Auto-generate schedule

Result:
┌────────────────────────────────────┐
│ Installment 1: Jun 1  - ₱10,500   │ Paid ✅
│ Installment 2: Sep 1  - ₱10,500   │ Paid ✅
│ Installment 3: Dec 1  - ₱10,500   │ Pending ⚠️
│ Installment 4: Mar 1  - ₱10,500   │ Pending
└────────────────────────────────────┘
```

#### Estimated Time: 3 days

---

### 5. Discount & Scholarship Management

**Problem**: No way to apply discounts or track scholarships  
**Solution**: Add discount system to enrollments

#### New Tables:

```sql
discounts
├── id
├── enrollment_id
├── discount_type (enum: 'scholarship', 'sibling', 'early_payment', 'other')
├── discount_name (varchar: 'Academic Scholarship', '50% Discount')
├── amount (decimal) OR percentage (decimal)
├── is_percentage (boolean)
├── approved_by (user_id)
├── notes (text)
└── timestamps
```

#### Features:

```tsx
Apply Discount:
├── Student: Juan Dela Cruz (Grade 7)
├── Discount Type: Scholarship
├── Amount: 50% OR ₱21,000
├── Reason: "Academic Excellence Award"
└── Approved By: Principal Maria Santos

Result:
┌────────────────────────────────────┐
│ Original Fees       ₱42,000        │
│ Scholarship (50%)   -₱21,000       │
│ ───────────────────────────────    │
│ Adjusted Fees       ₱21,000 ✅    │
└────────────────────────────────────┘

Balance calculation now uses ₱21,000 as expected fees
```

#### Estimated Time: 2 days

---

### 6. Reports & Analytics

**Problem**: No reporting features for administrators  
**Solution**: Build comprehensive reports

#### Reports to Build:

1. **Collection Report** (by date range)
    - Total collections per day/month
    - Breakdown by payment method (cash, check, online)
    - Breakdown by payment purpose (tuition, misc, etc.)
    - Per-cashier performance

2. **Outstanding Balance Report**
    - Students with unpaid balances
    - Grouped by grade level
    - Filterable by amount range
    - Export to CSV/Excel

3. **Fee Analysis Report**
    - Fee collection rate per grade level
    - Most/least paid fee types
    - Optional vs required fee uptake

4. **Student Financial Summary**
    - Individual student ledger
    - Payment history with running balance
    - Printable statement

#### Estimated Time: 4-5 days

---

## 🎯 Priority 3: Nice-to-Have Features (Build Later)

### 7. Receipt Customization & PDF Generation

- Printable PDF receipts with school logo
- Customizable receipt template
- Batch receipt printing
- Email receipt to parent

**Estimated Time**: 2-3 days

---

### 8. Parent Portal

- Parents can view student balance
- Payment history
- Online payment integration (PayMongo, GCash)
- Payment reminders

**Estimated Time**: 5-7 days

---

### 9. SMS/Email Notifications

- Payment confirmation
- Balance reminders
- Due date alerts
- Receipt delivery

**Estimated Time**: 2 days

---

### 10. Advanced Features

- Multi-currency support
- Payment reversals/refunds
- Audit log for all financial transactions
- Integration with accounting software

**Estimated Time**: Variable

---

## 📅 Recommended Implementation Timeline

### Week 1-2: Fee Structure Management

- Day 1-3: Fee Structure CRUD
- Day 4-5: Bulk clone feature
- Day 6-7: Testing & refinement

### Week 3-4: School Year & Enrollment System

- Day 1-2: Database migrations & models
- Day 3-4: School year management UI
- Day 5-6: Enrollment tracking
- Day 7-8: Year-end rollover process
- Day 9-10: Testing & data migration

### Week 5: Required/Optional Fees & Payment Plans

- Day 1-2: Required/optional fee system
- Day 3-5: Payment plan management

### Week 6: Discounts & Reports

- Day 1-2: Discount system
- Day 3-5: Basic reports

### Week 7: Polish & Production Prep

- Testing
- Bug fixes
- Documentation
- User training

---

## 🚀 Minimum Viable Product (MVP)

If you need to launch quickly, the absolute minimum features are:

### Must-Have (4 weeks):

1. ✅ Student CRUD (already done)
2. ✅ Payment recording (already done)
3. ✅ Payment tracking (already done)
4. 🔨 Fee Structure Management (2 weeks)
5. 🔨 School Year & Enrollment System (2 weeks)

### Can Wait:

- Payment plans
- Discounts
- Reports (can use database queries initially)
- PDF receipts
- Parent portal

---

## 💡 Quick Wins (Implement These First)

1. **Add "Current School Year" Setting** (2 hours)
    - Simple settings table
    - Admin can set current year
    - Display on dashboard

2. **Fee Structure Clone Feature** (1 day)
    - One button to copy all fees to next year
    - Saves hours of manual data entry

3. **Basic Reports** (2 days)
    - Daily collection total
    - Outstanding balance list
    - Export to CSV

4. **Receipt PDF** (1 day)
    - Use Laravel Snappy or DomPDF
    - Simple receipt template
    - Download button on payment view

---

**Total Estimated Time for All Priority 1 Features: ~2-3 weeks**  
**Total Estimated Time for MVP + Priority 1 + Priority 2: ~6-8 weeks**

Choose features based on your school's immediate needs and available development time.
