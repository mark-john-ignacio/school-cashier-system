# Quick Workflow Guide - School Cashier System

## 🚀 Quick Start: 5-Minute Overview

### The System in 3 Steps:

1. **Setup**: Define fees per grade level (e.g., Grade 7 = ₱42,000)
2. **Enroll**: Register student with grade level → system auto-calculates expected fees
3. **Collect**: Record payments → system auto-updates balance

---

## 📝 Happy Path Example: Juan's Journey

### **ACT 1: Enrollment (June 2024)**

👤 **Student**: Juan Dela Cruz  
📚 **Enrolled In**: Grade 7, Section A  
💰 **Expected Fees**: ₱42,000 (auto-calculated)

```
FeeStructure (Grade 7):
├── Tuition: ₱30,000
├── Miscellaneous: ₱6,000
├── Books: ₱4,000
└── Laboratory: ₱2,000
────────────────────────
Total: ₱42,000

Student Profile:
├── Balance: ₱42,000 ⚠️
├── Status: OUTSTANDING (red)
└── Payments: 0
```

---

### **ACT 2: First Payment (June 15)**

💵 **Payment #1**: ₱15,000 (Tuition - 1st installment)  
🧾 **Receipt**: RCP-2024-000001

```
Student Profile Updates:
├── Paid: ₱15,000
├── Balance: ₱27,000 ⚠️
├── Status: PARTIAL (yellow)
└── Payments: 1
```

---

### **ACT 3: More Payments (July-August)**

💵 **Payment #2**: ₱6,000 (Miscellaneous) - Jul 10  
💵 **Payment #3**: ₱4,000 (Books) - Aug 15  
💵 **Payment #4**: ₱17,000 (Tuition balance + Lab) - Aug 15

```
Final Student Profile:
├── Expected: ₱42,000
├── Paid: ₱42,000 ✅
├── Balance: ₱0 ✅
├── Status: PAID (green)
└── Payments: 4 transactions

Payment History:
├── Aug 15 | RCP-000013 | Tuition/Lab | ₱17,000
├── Aug 15 | RCP-000012 | Books | ₱4,000
├── Jul 10 | RCP-000002 | Misc | ₱6,000
└── Jun 15 | RCP-000001 | Tuition | ₱15,000
```

---

### **ACT 4: Optional Payment (September)**

💵 **Payment #5**: ₱2,000 (Field Trip - Optional)

```
Student Profile:
├── Expected: ₱42,000
├── Paid: ₱44,000 ✅
├── Balance: -₱2,000 (credit) ✅
├── Status: OVERPAID (green)
└── Payments: 5 transactions
```

---

### **ACT 5: Next School Year (May 2025)**

🎓 **Promotion**: Grade 7 → Grade 8

```
Admin Action:
└── Edit student → Change grade level to "Grade 8"

System Auto-Updates:
├── Grade: Grade 8
├── Expected Fees: ₱42,000 (recalculated for Grade 8)
├── Paid: ₱0 (resets for new year)
├── Balance: ₱42,000 ⚠️
└── Status: OUTSTANDING (red)

Note: Previous year's payment history is preserved
```

---

## 🎯 Common Scenarios

### Scenario A: Installment Payments

```
Student: Maria Torres (Grade 9)
Expected: ₱42,000

Timeline:
├── Jun: ₱10,000 (1st installment) → Status: PARTIAL
├── Aug: ₱15,000 (2nd installment) → Status: PARTIAL
├── Oct: ₱10,000 (3rd installment) → Status: PARTIAL
└── Dec: ₱7,000 (final) → Status: PAID ✅
```

### Scenario B: Early Full Payment

```
Student: Pedro Santos (Grade 11)
Expected: ₱50,000

Timeline:
└── Jun: ₱50,000 (full payment) → Status: PAID ✅
```

### Scenario C: Late Payment

```
Student: Ana Reyes (Grade 12)
Expected: ₱50,000

Timeline:
├── Jun-Nov: ₱0 → Status: OUTSTANDING ⚠️
├── Dec: ₱25,000 → Status: PARTIAL
└── Jan: ₱25,000 → Status: PAID ✅
```

---

## 🔄 How Fees Work

### Fee Calculation Logic:

```php
// When student is enrolled with "Grade 7"
$expectedFees = FeeStructure::where('grade_level', 'Grade 7')
    ->where('is_active', true)
    ->sum('amount');

// Returns: ₱42,000 (sum of all Grade 7 fees)
```

### Balance Calculation:

```php
$balance = $expectedFees - $totalPaid;

// Examples:
Expected ₱42,000 - Paid ₱0 = Balance ₱42,000 (OUTSTANDING)
Expected ₱42,000 - Paid ₱15,000 = Balance ₱27,000 (PARTIAL)
Expected ₱42,000 - Paid ₱42,000 = Balance ₱0 (PAID)
Expected ₱42,000 - Paid ₱44,000 = Balance -₱2,000 (OVERPAID)
```

---

## 📋 Payment Status Guide

| Balance               | Status      | Badge Color | Meaning              |
| --------------------- | ----------- | ----------- | -------------------- |
| > ₱0 and no payments  | Outstanding | 🔴 Red      | Hasn't paid anything |
| > ₱0 and has payments | Partial     | 🟡 Yellow   | Paid some, not all   |
| = ₱0                  | Paid        | 🟢 Green    | Fully paid           |
| < ₱0                  | Overpaid    | 🟢 Green    | Paid extra (credit)  |

---

## 👥 User Roles

### Cashier

✅ Record payments  
✅ Search students  
✅ View payment history  
✅ Mark receipts as printed  
❌ Cannot edit student info  
❌ Cannot delete payments

### Registrar

✅ Create/edit students  
✅ View all students  
✅ Promote students  
❌ Cannot record payments

### Admin

✅ All permissions  
✅ Manage users  
✅ Void payments  
✅ Access all features

---

## ⚠️ Important Notes

### What Happens When Student is Promoted?

```
Before Promotion (Grade 7):
├── Expected: ₱42,000
├── Paid: ₱42,000
└── Balance: ₱0

After Promotion (Grade 8):
├── Expected: ₱42,000 (recalculated for Grade 8)
├── Paid: ₱0 (resets)
└── Balance: ₱42,000 (new school year)

⚠️ Old payment history is preserved but doesn't count toward new year
```

### Optional vs Required Fees

```
Currently: All fees in FeeStructure are treated as required
Missing: No way to mark fees as "optional"

Workaround:
├── Record optional payments (field trips, etc.)
├── Student will show as "Overpaid"
└── Track via payment purpose notes
```

### Multiple Students, Same Payment

```
Not Supported: Can't split one payment across multiple students
Workaround: Record separate payment per student
```

---

## 🎓 Real-World Example: First Day Workflow

**Date**: June 3, 2024 (First day of enrollment)  
**Role**: Cashier Maria

### 8:00 AM - Student #1 Arrives

```
1. Registrar creates student: Juan Dela Cruz (Grade 7)
2. Student goes to cashier window
3. Cashier searches "Juan" → Selects student
4. Records payment: ₱15,000 (enrollment fee)
5. System generates receipt: RCP-2024-000001
6. Cashier clicks "Mark as Printed"
7. Hands receipt to parent
8. Done! (30 seconds)
```

### 8:15 AM - Student #2 Arrives

```
1. Search "Maria Torres" (already registered last year)
2. Records payment: ₱42,000 (full payment)
3. Receipt: RCP-2024-000002
4. Mark as printed
5. Done!
```

### 10:30 AM - Parent Returns

```
Parent: "Can I see my child's payment history?"

Cashier:
1. Search student "Pedro Santos"
2. Click student name → View profile
3. Scroll to "Payment History" section
4. Shows all payments with receipts
5. Parent satisfied!
```

### 2:00 PM - End of Day Report

```
Cashier View:
├── Total Collected Today: ₱125,000
├── Number of Transactions: 15
├── Pending Receipts: 2 (not yet printed)
└── Top Payment Purpose: Tuition (80%)
```

---

## 📊 Student Profile at a Glance

```
╔════════════════════════════════════════════════════════╗
║ JUAN DELA CRUZ                            [PARTIAL] 🟡 ║
║ STU-2024-0001 | Grade 7 - Section A                   ║
╠════════════════════════════════════════════════════════╣
║                                                         ║
║  💰 FINANCIAL SUMMARY                                  ║
║  ┌────────────────────────────────────────────────┐  ║
║  │ Expected Fees      ₱42,000                     │  ║
║  │ Total Paid         ₱21,000 🟢                  │  ║
║  │ Balance            ₱21,000 ⚠️                  │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                         ║
║  📋 PAYMENT HISTORY (3 transactions)                   ║
║  ┌────────────────────────────────────────────────┐  ║
║  │ Aug 15 | RCP-000012 | Books     | ₱4,000      │  ║
║  │ Jul 10 | RCP-000002 | Misc      | ₱6,000      │  ║
║  │ Jun 15 | RCP-000001 | Tuition   | ₱15,000     │  ║
║  └────────────────────────────────────────────────┘  ║
║                                                         ║
║  👤 STUDENT INFO                                       ║
║  Contact: 0917-123-4567                                ║
║  Parent: Maria Dela Cruz (0918-765-4321)              ║
║  Enrolled: June 1, 2024                                ║
╚════════════════════════════════════════════════════════╝
```

---

## 🔧 System Limitations & Workarounds

| Limitation              | Impact                           | Workaround                     |
| ----------------------- | -------------------------------- | ------------------------------ |
| No Fee Structure UI     | Must use database seeder         | Build CRUD interface (future)  |
| No school year tracking | Can't separate 2024 vs 2025      | Manual notes or custom field   |
| No payment plans        | Can't set installment schedules  | Track manually, record as paid |
| No scholarships         | Can't apply discounts            | Adjust fee structure or notes  |
| No batch promotion      | Must promote students one-by-one | Build batch update feature     |

---

**For detailed technical documentation, see `SYSTEM_WORKFLOW.md`**
