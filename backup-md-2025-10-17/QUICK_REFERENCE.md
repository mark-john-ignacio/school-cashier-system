# School Cashier System - Quick Reference Guide

## 🚀 Quick Start

### Start Development

```powershell
# Terminal 1: Backend + Frontend
composer run dev

# OR with SSR + logs
composer run dev:ssr
```

### Access Points

- **App:** http://school-cashier-system.test
- **Login:** Use test credentials below

### Test Credentials

```
Admin:
  Email: admin@school.test
  Password: password

Cashier:
  Email: cashier@school.test
  Password: password
```

---

## 📁 Project Structure

```
app/
├── Models/
│   ├── Student.php          # Student with payment calculations
│   ├── Payment.php          # Payment with auto-receipt numbering
│   ├── FeeStructure.php     # Grade-level fee configuration
│   └── User.php             # User with roles (admin/cashier)
│
├── Http/
    ├── Controllers/
    │   └── StudentController.php    # Student CRUD
    └── Requests/
        ├── StoreStudentRequest.php
        └── UpdateStudentRequest.php

database/
├── migrations/
│   ├── *_create_students_table.php
│   ├── *_create_fee_structures_table.php
│   ├── *_create_payments_table.php
│   └── *_add_role_to_users_table.php
│
├── factories/
│   ├── StudentFactory.php
│   ├── PaymentFactory.php
│   └── FeeStructureFactory.php
│
└── seeders/
    ├── DatabaseSeeder.php
    ├── FeeStructureSeeder.php
    └── StudentSeeder.php

routes/
└── web.php                  # Student routes added
```

---

## 🛣️ Available Routes

### Students

```
GET    /students                    # List students
GET    /students/create             # Create form
POST   /students                    # Store student
GET    /students/{id}               # Student detail
GET    /students/{id}/edit          # Edit form
PUT    /students/{id}               # Update student
DELETE /students/{id}               # Delete student
```

### API Parameters (Students Index)

```
?search=john                # Search by name/student number
?grade_level=Grade 7        # Filter by grade
?section=A                  # Filter by section
?status=active              # Filter by status
?sort_field=student_number  # Sort field
?sort_direction=asc         # Sort direction
```

---

## 💾 Database Commands

### Reset & Seed

```powershell
php artisan migrate:fresh --seed
```

### Migrations Only

```powershell
php artisan migrate:fresh
```

### Seed Only

```powershell
php artisan db:seed
```

### Specific Seeder

```powershell
php artisan db:seed --class=StudentSeeder
```

---

## 🎯 Model Usage Examples

### Student Model

**Query Examples:**

```php
// Get all active students
Student::active()->get();

// Search students
Student::search('John Doe')->get();

// Filter by grade
Student::gradeLevel('Grade 7')->get();

// Get student with payments
Student::with('payments')->find(1);

// Get students with balance > 0
Student::all()->filter(fn($s) => $s->balance > 0);
```

**Computed Attributes:**

```php
$student = Student::find(1);
$student->full_name;        // "John Middle Doe"
$student->total_paid;       // 25000.00
$student->expected_fees;    // 42000.00
$student->balance;          // 17000.00
$student->payment_status;   // "partial"
```

### Payment Model

**Create Payment:**

```php
$payment = Payment::create([
    'student_id' => 1,
    'user_id' => auth()->id(),
    'amount' => 5000,
    'payment_date' => now(),
    'payment_purpose' => 'Tuition Fee',
    'payment_method' => 'cash',
]);

// Receipt number auto-generated: RCP-20251003-0001
echo $payment->receipt_number;
```

**Query Examples:**

```php
// Today's payments
Payment::today()->get();

// By cashier
Payment::byCashier($userId)->get();

// Date range
Payment::dateRange('2025-10-01', '2025-10-31')->get();

// By purpose
Payment::purpose('Tuition Fee')->get();
```

### Fee Structure Model

**Get Current Year Fees:**

```php
$schoolYear = FeeStructure::currentSchoolYear(); // "2025-2026"

$fees = FeeStructure::active()
    ->schoolYear($schoolYear)
    ->gradeLevel('Grade 7')
    ->get();

$totalFees = $fees->sum('amount');
```

---

## 📊 Test Data Overview

### Students

- **Total:** 50 students
- **Grade Distribution:** Across all grades (1-12)
- **Payment Status:**
    - 15 fully paid (30%)
    - 20 partial payment (40%)
    - 15 outstanding (30%)

### Fee Structures

**Elementary (Grades 1-6):**

- Tuition: ₱25,000
- Miscellaneous: ₱5,000
- Books: ₱3,000
- **Total: ₱33,000**

**Junior High (Grades 7-10):**

- Tuition: ₱30,000
- Miscellaneous: ₱6,000
- Books: ₱4,000
- Laboratory: ₱2,000
- **Total: ₱42,000**

**Senior High (Grades 11-12):**

- Tuition: ₱35,000
- Miscellaneous: ₱7,000
- Books: ₱5,000
- Laboratory: ₱3,000
- **Total: ₱50,000**

---

## 🔍 Useful Artisan Commands

### Development

```powershell
# View routes
php artisan route:list

# Filter routes by URI
php artisan route:list --path=students

# Tinker (REPL)
php artisan tinker

# Clear caches
php artisan optimize:clear
```

### Database

```powershell
# Check migration status
php artisan migrate:status

# Rollback last migration
php artisan migrate:rollback

# Rollback specific steps
php artisan migrate:rollback --step=2
```

### Code Generation

```powershell
# Make controller
php artisan make:controller NameController --resource

# Make model with migration
php artisan make:model ModelName -m

# Make request validation
php artisan make:request StoreNameRequest

# Make factory
php artisan make:factory NameFactory

# Make seeder
php artisan make:seeder NameSeeder
```

---

## 🧪 Testing in Tinker

### Check Student Data

```php
php artisan tinker

// Get a student with calculations
$student = Student::with('payments')->first();
echo $student->full_name;
echo $student->total_paid;
echo $student->balance;
echo $student->payment_status;

// Get all payment statuses
Student::all()->groupBy('payment_status')->map->count();
```

### Test Payment Creation

```php
$student = Student::first();
$user = User::where('role', 'cashier')->first();

$payment = Payment::create([
    'student_id' => $student->id,
    'user_id' => $user->id,
    'amount' => 1000,
    'payment_date' => now(),
    'payment_purpose' => 'Miscellaneous Fee',
    'payment_method' => 'cash',
]);

// Check receipt number
echo $payment->receipt_number;

// Check updated balance
echo $student->fresh()->balance;
```

### Test Fee Calculations

```php
$grade7Fees = FeeStructure::active()
    ->gradeLevel('Grade 7')
    ->sum('amount');

echo "Grade 7 Total Fees: ₱" . number_format($grade7Fees, 2);
```

---

## 🎨 Frontend (To Be Built - Task 4)

### Pages Needed

```
resources/js/pages/students/
├── index.tsx      # Student list with search/filters
├── create.tsx     # Add new student form
├── edit.tsx       # Edit student form
└── show.tsx       # Student detail + payment history
```

### Components Needed

```
resources/js/components/students/
├── StudentTable.tsx           # Reusable table
├── StudentFilters.tsx         # Search + filters
├── StudentForm.tsx            # Shared form
├── PaymentStatusBadge.tsx     # Status indicator
└── PaymentHistoryTable.tsx    # Payment list
```

---

## 🐛 Common Issues & Solutions

### Issue: Migration Already Exists

```powershell
# Solution: Fresh migration
php artisan migrate:fresh --seed
```

### Issue: Routes Not Found

```powershell
# Solution: Clear route cache
php artisan route:clear
php artisan optimize:clear
```

### Issue: Changes Not Reflecting

```powershell
# Solution: Restart Vite
# Stop (Ctrl+C) and run again:
composer run dev
```

### Issue: Database Connection Error

```
# Check .env file:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=school-cashier-system
```

---

## 📚 Key Files Reference

### Configuration

- `.env` - Environment variables
- `config/database.php` - Database config
- `config/inertia.php` - Inertia settings
- `vite.config.ts` - Frontend build config

### Entry Points

- `routes/web.php` - Web routes
- `app/Http/Kernel.php` - Middleware
- `resources/js/app.tsx` - Frontend bootstrap
- `resources/views/app.blade.php` - HTML layout

### Database

- `database/database.sqlite` - Database file (if using SQLite)
- `database/migrations/` - Schema definitions
- `database/seeders/` - Test data

---

## 💡 Pro Tips

1. **Keep Vite Running:** Changes won't reflect without Vite running
2. **Use Tinker:** Great for testing models and queries
3. **Check Logs:** `storage/logs/laravel.log` for errors
4. **Route Cache:** Clear with `php artisan route:clear` if routes change
5. **Eager Loading:** Always use `->with()` to prevent N+1 queries
6. **Soft Deletes:** Data is never truly deleted, good for auditing

---

## 📞 Next Actions

**Immediate:**

1. Start dev server: `composer run dev`
2. Access app: http://school-cashier-system.test
3. Build Student Management UI (Task 4)

**After UI Built:** 4. Test complete student CRUD workflow 5. Build payment processing 6. Create dashboard 7. Add reports

---

This quick reference will be updated as more features are implemented!
