# Development Guide

## 🎯 Quick Start for New Developers

Welcome! This guide will help you understand the codebase and start contributing quickly.

## 📁 Project Structure

```
school-cashier-system/
├── app/
│   ├── Console/Commands/        # Artisan commands
│   │   └── RefreshDemoData.php  # Demo data refresh command
│   ├── Http/Controllers/        # Request handlers
│   │   ├── Auth/               # Authentication (login, register, password reset)
│   │   ├── Settings/           # User profile & settings
│   │   ├── PaymentController.php    # Payment CRUD operations
│   │   ├── StudentController.php    # Student management
│   │   └── DashboardController.php  # Dashboard with statistics
│   ├── Models/                 # Eloquent ORM models
│   │   ├── User.php           # Users with role-based permissions
│   │   ├── Student.php        # Students with balance calculations
│   │   ├── Payment.php        # Payments with receipt generation
│   │   ├── FeeStructure.php   # Fee definitions per grade level
│   │   ├── GradeLevel.php     # Grade levels with sections
│   │   └── Section.php        # Sections within grade levels
│   └── Http/Requests/         # Form request validation
│
├── database/
│   ├── migrations/            # Database schema definitions
│   ├── factories/             # Model factories for testing/seeding
│   └── seeders/              # Database seeders
│       ├── DatabaseSeeder.php        # Main seeder (runs all)
│       ├── RolePermissionSeeder.php  # Roles & permissions
│       ├── FeeStructureSeeder.php    # Sample fee structures
│       └── StudentSeeder.php         # Sample students & payments
│
├── resources/
│   ├── js/
│   │   ├── actions/           # Auto-generated controller action helpers
│   │   ├── routes/            # Auto-generated route helpers (TYPE-SAFE!)
│   │   ├── pages/             # Inertia.js page components
│   │   │   ├── auth/         # Login, register, forgot password
│   │   │   ├── dashboard.tsx # Main dashboard with charts
│   │   │   ├── payments/     # Payment management pages
│   │   │   ├── students/     # Student management pages
│   │   │   ├── settings/     # User settings pages
│   │   │   └── academics/    # Grade levels & fee structures
│   │   ├── components/        # Reusable React components
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   ├── payments/     # Payment-specific components
│   │   │   ├── app-sidebar.tsx      # Main navigation sidebar
│   │   │   └── breadcrumbs.tsx      # Breadcrumb navigation
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── use-payment-wizard.tsx  # Payment wizard state
│   │   │   └── use-appearance.tsx      # Theme management
│   │   ├── layouts/           # Page layouts
│   │   │   ├── app-layout.tsx        # Main app layout
│   │   │   └── settings/             # Settings layout
│   │   ├── lib/               # Utility functions
│   │   │   ├── utils.ts      # General utilities
│   │   │   └── payments.ts   # Payment-specific utilities
│   │   └── types/             # TypeScript type definitions
│   ├── views/
│   │   └── app.blade.php      # Root HTML template
│   └── css/
│       └── app.css            # Tailwind CSS entry point
│
├── routes/
│   ├── web.php                # Main application routes
│   ├── auth.php               # Authentication routes
│   ├── settings.php           # Settings routes
│   └── console.php            # Scheduled tasks
│
├── tests/
│   ├── Feature/               # Feature tests (user interactions)
│   └── Unit/                  # Unit tests (isolated logic)
│
├── docs/                      # Docusaurus documentation site
│   ├── docs/                  # Documentation markdown files
│   └── src/                   # Docusaurus source
│
├── config/                    # Laravel configuration files
├── public/                    # Public assets (compiled JS/CSS)
└── storage/                   # File storage, logs, cache
```

---

## 🏗️ Architecture Overview

### Backend: Laravel + Inertia.js

This project uses **Inertia.js** - a unique approach that combines:

- Laravel backend (handles routing, validation, database)
- React frontend (handles UI rendering)
- **No separate API needed!**

#### How it works:

```php
// 1. Route defined in routes/web.php
Route::get('/payments', [PaymentController::class, 'index'])
    ->name('payments.index');

// 2. Controller returns Inertia response
// app/Http/Controllers/PaymentController.php
public function index()
{
    return Inertia::render('payments/index', [
        'payments' => Payment::with(['student', 'user'])
            ->latest()
            ->paginate(15),
    ]);
}

// 3. React page receives props
// resources/js/pages/payments/index.tsx
export default function PaymentsIndex({ payments }) {
    return <div>{/* Render payments table */}</div>;
}
```

**Key benefit**: Full-stack type safety with auto-generated route helpers!

---

## 🎯 Key Concepts

### 1. Type-Safe Routing with Wayfinder

❌ **Traditional way** (error-prone):

```tsx
<Link href="/payments/create">Create Payment</Link>
```

✅ **Our way** (type-safe, auto-complete):

```tsx
import { create as createPayments } from '@/routes/payments';

<Link href={createPayments()}>Create Payment</Link>;
```

**How it works:**

- PHP routes are scanned by `@laravel/vite-plugin-wayfinder`
- TypeScript helpers are auto-generated in `resources/js/routes/`
- Full IDE autocomplete and type checking!
- Updates automatically when Vite dev server is running

**With parameters:**

```tsx
import { show as showStudent } from '@/routes/students';

// Generates: /students/123
<Link href={showStudent({ student: 123 })}>View Student</Link>;
```

---

### 2. Inertia Form Handling

Inertia provides `useForm` hook for server-side validation:

```tsx
import { useForm } from '@inertiajs/react';
import { store as storePayment } from '@/routes/payments';

const { data, setData, post, processing, errors } = useForm({
    student_id: null,
    amount: '',
    payment_date: '',
});

const submit = (e) => {
    e.preventDefault();
    post(storePayment()); // Type-safe route helper
};

return (
    <form onSubmit={submit}>
        <input value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
        {errors.amount && <span>{errors.amount}</span>}

        <button disabled={processing}>Submit</button>
    </form>
);
```

**Benefits:**

- Automatic CSRF protection
- Server-side validation errors
- Loading states
- Preserves scroll position
- No manual API calls needed!

---

### 3. Role-Based Access Control (RBAC)

Uses **Spatie Laravel Permission** package:

#### Defined Roles:

- **Admin**: Full system access
- **Manager**: View reports, manage fee structures
- **Accountant**: View financial reports
- **Cashier**: Process payments, view assigned students

#### In Controllers:

```php
public function store(Request $request)
{
    // Check permission
    $this->authorize('create', Payment::class);

    // Or use Gate
    if (! Gate::allows('createPayments')) {
        abort(403);
    }
}
```

#### In React:

```tsx
import { usePage } from '@inertiajs/react';

const { auth } = usePage().props;

{
    auth.user?.can?.createPayments && <Button>Create Payment</Button>;
}
```

---

### 4. Eloquent Relationships

Models use Eloquent relationships for clean data access:

```php
// Student model has many payments
class Student extends Model
{
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Computed attribute for balance
    public function getBalanceAttribute(): float
    {
        return $this->expected_fees - $this->total_paid;
    }
}

// Usage
$student = Student::with('payments')->find(1);
$balance = $student->balance; // Computed automatically
```

**Eager Loading (Important!):**

```php
// ❌ N+1 query problem
$payments = Payment::all();
foreach ($payments as $payment) {
    echo $payment->student->name; // Each triggers a query!
}

// ✅ Efficient eager loading
$payments = Payment::with('student')->all();
foreach ($payments as $payment) {
    echo $payment->student->name; // Already loaded!
}
```

---

## 🚀 Common Development Tasks

### Adding a New Page

**Example: Create a "Reports" page**

#### Step 1: Backend Route & Controller

```php
// routes/web.php
Route::get('/reports', [ReportController::class, 'index'])
    ->name('reports.index');

// Create controller
php artisan make:controller ReportController
```

```php
// app/Http/Controllers/ReportController.php
public function index()
{
    return Inertia::render('reports/index', [
        'reports' => Report::latest()->paginate(15),
    ]);
}
```

#### Step 2: Frontend React Page

```tsx
// resources/js/pages/reports/index.tsx
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function ReportsIndex({ reports }) {
    return (
        <AppLayout>
            <Head title="Reports" />
            <h1>Reports</h1>
            {/* Your UI here */}
        </AppLayout>
    );
}
```

#### Step 3: Add to Navigation

```tsx
// resources/js/components/app-sidebar.tsx
import { index as reportsIndex } from '@/routes/reports';

const navItems = [
    // ... existing items
    {
        title: 'Reports',
        href: reportsIndex(),
        icon: FileText,
    },
];
```

**That's it!** Wayfinder will auto-generate the route helper.

---

### Creating a New Database Table

```bash
# Create migration
php artisan make:migration create_reports_table

# Create model with migration
php artisan make:model Report -m

# Create model with migration, factory, and seeder
php artisan make:model Report -mfs
```

Edit migration file:

```php
public function up()
{
    Schema::create('reports', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->text('description')->nullable();
        $table->foreignId('user_id')->constrained();
        $table->timestamps();
    });
}
```

Run migration:

```bash
php artisan migrate
```

---

### Adding Form Validation

Create a Form Request:

```bash
php artisan make:request StoreReportRequest
```

```php
// app/Http/Requests/StoreReportRequest.php
public function rules()
{
    return [
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'user_id' => 'required|exists:users,id',
    ];
}

public function messages()
{
    return [
        'title.required' => 'Report title is required.',
        'user_id.exists' => 'Selected user does not exist.',
    ];
}
```

Use in controller:

```php
public function store(StoreReportRequest $request)
{
    $validated = $request->validated();
    Report::create($validated);

    return redirect()->route('reports.index');
}
```

---

### Running Tests

```bash
# Run all tests
composer test

# Run specific test file
php artisan test tests/Feature/PaymentTest.php

# Run with coverage
composer test -- --coverage

# Run specific test method
php artisan test --filter test_user_can_create_payment
```

---

### Code Quality Checks

```bash
# PHP formatting (Laravel Pint)
./vendor/bin/pint

# Check without fixing
./vendor/bin/pint --test

# TypeScript linting
npm run lint

# TypeScript type checking
npm run types

# Format code (Prettier)
npm run format

# Check formatting
npm run format:check
```

---

## 🐛 Debugging Tips

### Backend Debugging

```php
// Quick debug dump
dd($variable); // Dump and die

// Debug with context
dump($variable); // Continue execution

// Database query log
DB::enableQueryLog();
// ... your queries
dd(DB::getQueryLog());

// Log to file
Log::info('Debug message', ['context' => $data]);
// Check: storage/logs/laravel.log
```

### Frontend Debugging

```tsx
// View all page props
const props = usePage().props;
console.log('All props:', props);

// Debug Inertia requests
// Open browser DevTools → Network → XHR
// Look for requests with 'X-Inertia' header

// React DevTools
// Install React DevTools browser extension
// Inspect component tree and props
```

### Common Issues

#### Issue: Route helper not found

```
Cannot find module '@/routes/payments'
```

**Solution**: Keep Vite dev server running. It auto-generates route helpers.

```bash
npm run dev
```

#### Issue: 419 CSRF token mismatch

**Solution**: Inertia handles CSRF automatically. Check:

1. `resources/views/app.blade.php` has `@csrf` meta tag
2. Form is submitted via Inertia's `post()`/`put()`/`delete()` methods

#### Issue: Props not updating

**Solution**: Check controller is returning updated data:

```php
return redirect()->back()->with('success', 'Updated!');
```

---

## 📚 Learning Resources

### Essential Reading

- [Laravel Documentation](https://laravel.com/docs) - Comprehensive Laravel guide
- [Inertia.js Documentation](https://inertiajs.com) - Understanding Inertia
- [React 19 Documentation](https://react.dev) - React fundamentals
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide

### Video Tutorials

- [Laracasts - Laravel from Scratch](https://laracasts.com)
- [Inertia.js Crash Course](https://www.youtube.com/results?search_query=inertia+js+tutorial)

### This Project's Docs

```bash
# Start documentation site
npm run docs:dev
# Visit http://localhost:3000
```

---

## 🎯 Development Workflow

### Standard Development

```bash
composer run dev
```

This runs:

- PHP development server (port 8000)
- Queue worker
- Vite dev server (hot reload)

### With Server-Side Rendering

```bash
composer run dev:ssr
```

This runs:

- PHP development server
- Queue worker
- Vite SSR server
- Laravel Pail (real-time logs)

### Building for Production

```bash
# Build client assets
npm run build

# Build with SSR
npm run build:ssr

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 🤝 Contributing

1. **Branch naming**: `feature/your-feature-name` or `fix/bug-description`
2. **Commit messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
    ```
    feat(payments): add receipt PDF export
    fix(students): resolve search filter issue
    docs: update API documentation
    ```
3. **Before committing**:

    ```bash
    ./vendor/bin/pint
    npm run lint
    npm run types
    composer test
    ```

4. **Pull Request**: Provide clear description and screenshots if UI changes

---

## ❓ Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check `docs/` folder or run `npm run docs:dev`

---

## 🎉 You're Ready!

You now understand:

- ✅ Project structure
- ✅ How Inertia.js works
- ✅ Type-safe routing
- ✅ Form handling
- ✅ RBAC system
- ✅ Common development tasks

**Start exploring the code and happy coding!** 🚀
