# 🚀 Production-Ready SaaS Transformation Roadmap

Transform the School Cashier System into a multi-tenant SaaS platform where schools can sign up, manage their own data, and process payments independently.

---

## 🎯 Vision

**From:** Single-school deployment  
**To:** Multi-tenant SaaS platform (schoolpay.com) where any school can:
- Sign up with Google/Microsoft
- Onboard in 5 minutes
- Import students via CSV
- Start processing payments immediately
- Pay via subscription ($0-$99/month based on needs)

---

## 📊 Architecture Changes

### Current State
```
Single Database
├── students (all schools mixed)
├── payments (all schools mixed)
├── users (all schools mixed)
└── fee_structures (all schools mixed)
```

### Target State (Multi-Tenant)
```
Central Database
├── organizations (schools)
├── subscriptions
└── tenants

Tenant Database (per school)
├── students
├── payments
├── users
├── fee_structures
└── grade_levels
```

---

## 🏗️ Phase 1: Multi-Tenancy Foundation

### **Priority: CRITICAL** | **Timeline: 2-3 weeks**

#### 1.1 Install Tenancy Package
```bash
composer require stancl/tenancy
php artisan tenancy:install
```

#### 1.2 Create Organizations Table
```php
// Migration: create_organizations_table.php
Schema::create('organizations', function (Blueprint $table) {
    $table->id();
    $table->string('name'); // "St. Mary's High School"
    $table->string('slug')->unique(); // "st-marys-hs"
    $table->string('subdomain')->unique(); // "stmarys" -> stmarys.schoolpay.com
    $table->string('domain')->nullable()->unique(); // custom domain
    
    // Branding
    $table->string('logo_url')->nullable();
    $table->string('primary_color')->default('#3b82f6');
    
    // Contact
    $table->string('contact_email');
    $table->string('contact_phone')->nullable();
    $table->text('address')->nullable();
    $table->string('city')->nullable();
    $table->string('state')->nullable();
    $table->string('country')->default('Philippines');
    $table->string('timezone')->default('Asia/Manila');
    
    // Subscription
    $table->enum('subscription_tier', ['free', 'basic', 'premium'])->default('free');
    $table->timestamp('trial_ends_at')->nullable();
    $table->timestamp('subscription_ends_at')->nullable();
    $table->boolean('is_active')->default(true);
    
    // Limits
    $table->integer('max_students')->nullable(); // null = unlimited
    $table->integer('max_users')->default(5);
    $table->integer('max_storage_mb')->default(100);
    
    // Metadata
    $table->json('settings')->nullable(); // School-specific settings
    $table->timestamps();
    $table->softDeletes();
});
```

#### 1.3 Update Users Table
```php
Schema::table('users', function (Blueprint $table) {
    $table->foreignId('organization_id')->after('id')->nullable()->constrained();
    
    // Social auth
    $table->string('provider')->nullable(); // 'google', 'microsoft', 'apple', 'email'
    $table->string('provider_id')->nullable();
    $table->string('avatar_url')->nullable();
    
    // 2FA
    $table->string('two_factor_secret')->nullable();
    $table->timestamp('two_factor_confirmed_at')->nullable();
});
```

#### 1.4 Add Tenant ID to All Tables
```php
// Example for students table
Schema::table('students', function (Blueprint $table) {
    $table->string('tenant_id')->after('id')->nullable();
    $table->index('tenant_id');
});

// Repeat for: payments, fee_structures, grade_levels, sections
```

#### 1.5 Tenant Middleware
```php
// app/Http/Middleware/InitializeTenancy.php
public function handle($request, Closure $next)
{
    $tenant = Tenant::findByDomain($request->getHost());
    
    if (!$tenant) {
        abort(404, 'Organization not found');
    }
    
    tenancy()->initialize($tenant);
    
    return $next($request);
}
```

---

## 🔐 Phase 2: Social Authentication

### **Priority: HIGH** | **Timeline: 1 week**

#### 2.1 Install Laravel Socialite
```bash
composer require laravel/socialite
composer require socialiteproviders/google
composer require socialiteproviders/microsoft
```

#### 2.2 Environment Variables
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_REDIRECT_URI=https://app.schoolpay.com/auth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-secret
MICROSOFT_REDIRECT_URI=https://app.schoolpay.com/auth/microsoft/callback
```

#### 2.3 Social Auth Controller
```php
// app/Http/Controllers/Auth/SocialAuthController.php
public function redirectToProvider(string $provider)
{
    return Socialite::driver($provider)->redirect();
}

public function handleProviderCallback(string $provider)
{
    $socialUser = Socialite::driver($provider)->user();
    
    $user = User::updateOrCreate(
        ['provider' => $provider, 'provider_id' => $socialUser->getId()],
        [
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'avatar_url' => $socialUser->getAvatar(),
            'email_verified_at' => now(),
        ]
    );
    
    Auth::login($user);
    
    return redirect()->route('dashboard');
}
```

#### 2.4 Login Page Updates
Add buttons to `resources/js/pages/auth/login.tsx`:
```tsx
<Button variant="outline" onClick={() => router.visit('/auth/google')}>
    <GoogleIcon /> Continue with Google
</Button>

<Button variant="outline" onClick={() => router.visit('/auth/microsoft')}>
    <MicrosoftIcon /> Continue with Microsoft
</Button>
```

---

## 🛡️ Phase 3: Security & DDoS Protection

### **Priority: CRITICAL** | **Timeline: 2-3 days**

#### 3.1 Cloudflare Setup
1. **Sign up:** https://cloudflare.com
2. **Add domain:** schoolpay.com
3. **Update nameservers** at your domain registrar
4. **Enable:**
   - ✅ DDoS protection (automatic)
   - ✅ WAF (Web Application Firewall)
   - ✅ Rate limiting: 100 req/min per IP
   - ✅ Bot Fight Mode
   - ✅ Always Use HTTPS

#### 3.2 Laravel Rate Limiting
```php
// app/Providers/RouteServiceProvider.php
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)->by($request->email . $request->ip());
});

RateLimiter::for('payments', function (Request $request) {
    return Limit::perMinute(10)->by($request->user()->organization_id);
});
```

#### 3.3 Security Headers
```bash
composer require bepsvpt/secure-headers
php artisan vendor:publish --provider="Bepsvpt\SecureHeaders\SecureHeadersServiceProvider"
```

```php
// config/secure-headers.php
'csp' => [
    'default-src' => ['self'],
    'script-src' => ['self', 'unsafe-inline'], // Required for Inertia
    'style-src' => ['self', 'unsafe-inline'],
    'img-src' => ['self', 'data:', 'https:'],
],
```

#### 3.4 XSS Protection
```bash
composer require mews/purifier
```

```php
// Before saving user input
$clean = clean($request->input('notes'));
```

#### 3.5 SQL Injection Prevention
- ✅ Already using Eloquent ORM (secure by default)
- ✅ Never use `DB::raw()` with user input
- ✅ Always use parameter binding

---

## 💳 Phase 4: Payment Gateway Integration

### **Priority: HIGH** | **Timeline: 1 week**

#### 4.1 Install Stripe
```bash
composer require stripe/stripe-php
```

#### 4.2 Environment Config
```env
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 4.3 Update Payments Table
```php
Schema::table('payments', function (Blueprint $table) {
    $table->string('gateway')->nullable()->after('payment_method'); // 'stripe', 'paypal', 'manual'
    $table->string('transaction_id')->nullable();
    $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
    $table->timestamp('gateway_completed_at')->nullable();
    $table->json('gateway_response')->nullable();
});
```

#### 4.4 Payment Processing
```php
// app/Services/StripePaymentService.php
public function createPaymentIntent(Payment $payment): PaymentIntent
{
    Stripe::setApiKey(config('services.stripe.secret'));
    
    return PaymentIntent::create([
        'amount' => $payment->amount * 100, // Convert to cents
        'currency' => 'php',
        'metadata' => [
            'payment_id' => $payment->id,
            'student_id' => $payment->student_id,
            'organization_id' => $payment->student->organization_id,
        ],
    ]);
}
```

#### 4.5 Webhook Handler
```php
// routes/web.php
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->middleware('verify-stripe-signature');

// app/Http/Controllers/StripeWebhookController.php
public function handle(Request $request)
{
    $event = $request->all();
    
    switch ($event['type']) {
        case 'payment_intent.succeeded':
            Payment::where('transaction_id', $event['data']['object']['id'])
                ->update(['status' => 'completed', 'gateway_completed_at' => now()]);
            break;
            
        case 'payment_intent.payment_failed':
            Payment::where('transaction_id', $event['data']['object']['id'])
                ->update(['status' => 'failed']);
            break;
    }
    
    return response()->json(['success' => true]);
}
```

---

## 💰 Phase 5: Subscription & Billing

### **Priority: MEDIUM** | **Timeline: 1 week**

#### 5.1 Install Laravel Cashier
```bash
composer require laravel/cashier
php artisan cashier:install
php artisan migrate
```

#### 5.2 Subscription Plans
```php
// config/subscriptions.php
return [
    'plans' => [
        'free' => [
            'name' => 'Free',
            'price' => 0,
            'stripe_id' => null,
            'features' => [
                'students' => 50,
                'users' => 3,
                'storage_mb' => 100,
                'support' => 'Community',
            ],
        ],
        'basic' => [
            'name' => 'Basic',
            'price' => 29,
            'stripe_id' => 'price_basic_monthly',
            'features' => [
                'students' => 500,
                'users' => 10,
                'storage_mb' => 1000,
                'online_payments' => true,
                'export_csv' => true,
                'support' => 'Email',
            ],
        ],
        'premium' => [
            'name' => 'Premium',
            'price' => 99,
            'stripe_id' => 'price_premium_monthly',
            'features' => [
                'students' => null, // Unlimited
                'users' => null,
                'storage_mb' => 10000,
                'online_payments' => true,
                'export_csv' => true,
                'api_access' => true,
                'webhooks' => true,
                'support' => 'Priority',
            ],
        ],
    ],
];
```

#### 5.3 Organization Model Updates
```php
// app/Models/Organization.php
use Laravel\Cashier\Billable;

class Organization extends Model
{
    use Billable;
    
    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }
    
    public function canAddStudent(): bool
    {
        $plan = config("subscriptions.plans.{$this->subscription_tier}");
        
        if ($plan['features']['students'] === null) {
            return true; // Unlimited
        }
        
        return $this->students()->count() < $plan['features']['students'];
    }
}
```

---

## 🎓 Phase 6: School Onboarding Flow

### **Priority: HIGH** | **Timeline: 1 week**

#### 6.1 Registration Route
```php
// routes/web.php
Route::get('/register/school', [SchoolRegistrationController::class, 'create'])
    ->name('schools.register');
    
Route::post('/register/school', [SchoolRegistrationController::class, 'store']);
```

#### 6.2 Onboarding Steps
```tsx
// resources/js/pages/onboarding/register.tsx
const steps = [
    {
        title: 'School Details',
        fields: ['name', 'subdomain', 'contact_email', 'address'],
    },
    {
        title: 'Admin Account',
        fields: ['admin_name', 'admin_email', 'password'],
        socialAuth: ['google', 'microsoft'],
    },
    {
        title: 'Choose Plan',
        component: <PricingTable />,
    },
    {
        title: 'Payment Method',
        component: <StripeCheckout />,
        skip: (plan) => plan === 'free',
    },
    {
        title: 'Import Students (Optional)',
        component: <CSVUploader />,
    },
];
```

#### 6.3 Subdomain Validation
```php
// app/Http/Requests/SchoolRegistrationRequest.php
public function rules(): array
{
    return [
        'name' => 'required|string|max:255',
        'subdomain' => [
            'required',
            'alpha_dash',
            'min:3',
            'max:63',
            'unique:organizations,subdomain',
            'not_in:www,api,admin,app,mail,dashboard', // Reserved subdomains
        ],
        'contact_email' => 'required|email|unique:organizations,contact_email',
    ];
}
```

#### 6.4 Auto-Setup After Registration
```php
// app/Services/SchoolSetupService.php
public function setupNewSchool(Organization $organization): void
{
    // 1. Create tenant database
    $tenant = Tenant::create(['organization_id' => $organization->id]);
    
    // 2. Run migrations for tenant
    $tenant->run(fn () => Artisan::call('migrate', ['--force' => true]));
    
    // 3. Seed default data
    $tenant->run(function () {
        GradeLevel::insert([
            ['name' => 'Kindergarten', 'slug' => 'kindergarten'],
            ['name' => 'Grade 1', 'slug' => 'grade-1'],
            // ... up to Grade 12
        ]);
    });
    
    // 4. Create admin user
    $admin = User::create([
        'organization_id' => $organization->id,
        'name' => request('admin_name'),
        'email' => request('admin_email'),
        'password' => Hash::make(request('password')),
    ]);
    $admin->assignRole('admin');
    
    // 5. Send welcome email
    Mail::to($admin)->send(new WelcomeToSchoolPay($organization));
}
```

---

## 📧 Phase 7: Email & Notifications

### **Priority: MEDIUM** | **Timeline: 3-4 days**

#### 7.1 Mail Service
```bash
# Mailgun (recommended)
composer require symfony/mailgun-mailer
```

```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mg.schoolpay.com
MAILGUN_SECRET=key-...
MAIL_FROM_ADDRESS=noreply@schoolpay.com
MAIL_FROM_NAME="SchoolPay"
```

#### 7.2 Email Templates
```php
// app/Mail/PaymentReceipt.php
public function build()
{
    return $this->subject('Payment Receipt - ' . $this->payment->receipt_number)
        ->markdown('emails.payments.receipt')
        ->attachData($this->generatePDF(), 'receipt.pdf');
}

// app/Mail/BalanceReminder.php
// app/Mail/WelcomeToSchoolPay.php
// app/Mail/SubscriptionRenewal.php
```

#### 7.3 Queue Jobs
```php
// app/Jobs/SendPaymentReceipt.php
dispatch(new SendPaymentReceipt($payment))->onQueue('emails');
```

---

## 🚀 Phase 8: Deployment & Infrastructure

### **Priority: CRITICAL** | **Timeline: 1 week**

#### 8.1 Recommended Stack
**Laravel Forge + DigitalOcean**

**Costs:**
- Laravel Forge: $12/month (server management)
- DigitalOcean Droplet (4GB): $24/month
- Managed PostgreSQL (1GB): $15/month
- DigitalOcean Spaces (storage): $5/month
- **Total: ~$56/month** (supports hundreds of schools)

#### 8.2 Forge Setup Steps
1. Connect Forge to DigitalOcean
2. Create new server (PHP 8.2, PostgreSQL, Redis)
3. Deploy site from GitHub
4. Configure environment variables
5. Enable SSL (Let's Encrypt - free)
6. Set up queue workers
7. Configure scheduled tasks

#### 8.3 Database Strategy
```bash
# Central database (on Forge server)
- organizations
- users
- subscriptions

# Tenant databases (separate PostgreSQL schemas OR databases)
- school_1: students, payments, fee_structures
- school_2: students, payments, fee_structures
```

#### 8.4 Monitoring
```bash
# Error tracking
composer require sentry/sentry-laravel

# Uptime monitoring
# Use UptimeRobot (free) or Forge monitoring
```

---

## 📱 Phase 9: Progressive Web App

### **Priority: MEDIUM** | **Timeline: 2-3 days**

```bash
npm install vite-plugin-pwa -D
```

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'SchoolPay',
                short_name: 'SchoolPay',
                theme_color: '#3b82f6',
                icons: [
                    {
                        src: 'icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
})
```

---

## 🎯 Implementation Timeline

### **Month 1: Foundation**
- Week 1: Multi-tenancy setup
- Week 2: Social auth (Google/Microsoft)
- Week 3: Security hardening + Cloudflare
- Week 4: School onboarding flow

### **Month 2: Payments**
- Week 1: Stripe integration
- Week 2: Subscription billing (Cashier)
- Week 3: Email notifications
- Week 4: Testing + bug fixes

### **Month 3: Launch Prep**
- Week 1: Deployment to production
- Week 2: Documentation + help center
- Week 3: Beta testing with 5 schools
- Week 4: Public launch 🚀

---

## 💡 Quick Wins (This Week)

### 1. Add Cloudflare (30 minutes)
- Sign up, add domain, update DNS
- Instant DDoS protection

### 2. Add Google Sign-In (1 hour)
- Install Socialite
- Create Google OAuth app
- Add login button

### 3. Rate Limiting (15 minutes)
- Add throttle middleware to routes
- Protect against brute force

### 4. Security Headers (30 minutes)
- Install bepsvpt/secure-headers
- Configure CSP

---

## 📚 Resources

- **Multi-tenancy:** https://tenancyforlaravel.com
- **Socialite:** https://laravel.com/docs/socialite
- **Cashier:** https://laravel.com/docs/billing
- **Cloudflare:** https://cloudflare.com
- **Stripe:** https://stripe.com/docs/payments
- **Laravel Forge:** https://forge.laravel.com

---

## 🤝 Support

Need help implementing? Consider:
- Laravel consulting: https://larajobs.com
- DevOps support: Laravel Forge support
- Payment integration: Stripe support team

---

**Last Updated:** October 24, 2025  
**Status:** Ready for implementation
