import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BanknoteIcon,
    CheckCircle2Icon,
    ClockIcon,
    FileTextIcon,
    GraduationCapIcon,
    LayoutDashboardIcon,
    LockIcon,
    ReceiptIcon,
    SearchIcon,
    ShieldCheckIcon,
    TrendingUpIcon,
    UsersIcon,
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: UsersIcon,
            title: 'Student Management',
            description:
                'Efficiently manage student records, enrollment status, and contact information in one centralized system.',
        },
        {
            icon: BanknoteIcon,
            title: 'Payment Processing',
            description:
                'Process tuition fees, miscellaneous charges, and other school payments with multiple payment methods support.',
        },
        {
            icon: ReceiptIcon,
            title: 'Receipt Generation',
            description:
                'Automatically generate and print official receipts for all payment transactions with unique receipt numbers.',
        },
        {
            icon: TrendingUpIcon,
            title: 'Financial Reports',
            description:
                'View comprehensive financial analytics, payment trends, and collection summaries in real-time.',
        },
        {
            icon: SearchIcon,
            title: 'Advanced Search',
            description:
                'Quickly find student records and payment history with powerful search and filtering capabilities.',
        },
        {
            icon: FileTextIcon,
            title: 'Fee Structures',
            description: 'Configure and manage fee structures by grade level, payment types, and school year.',
        },
    ];

    const benefits = [
        {
            icon: ClockIcon,
            title: 'Time-Saving',
            description: 'Reduce payment processing time from minutes to seconds',
        },
        {
            icon: CheckCircle2Icon,
            title: 'Accuracy',
            description: 'Eliminate manual errors with automated calculations',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Security',
            description: 'Role-based access control and audit trails',
        },
        {
            icon: LayoutDashboardIcon,
            title: 'Insights',
            description: 'Real-time dashboard with actionable analytics',
        },
    ];

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <GraduationCapIcon className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">School Cashier System</span>
                    </div>
                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Button asChild>
                                <Link href={dashboard()}>
                                    <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href={login()}>Log in</Link>
                                </Button>
                                <Button asChild>
                                    <Link href={register()}>Get Started</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="container space-y-6 px-4 py-12 md:py-20 md:px-6 lg:py-24">
                    <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-6 text-center">
                        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
                            <ShieldCheckIcon className="mr-2 h-4 w-4" />
                            <span>Secure & Reliable Payment Management</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Modern Payment System for
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {' '}
                                Educational Institutions
                            </span>
                        </h1>
                        <p className="max-w-[42rem] text-lg leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                            Streamline your school's cashier operations with our comprehensive payment management
                            system. Process payments faster, track collections efficiently, and generate detailed
                            financial reportsall in one platform.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {auth.user ? (
                                <Button size="lg" asChild>
                                    <Link href={dashboard()}>
                                        <LayoutDashboardIcon className="mr-2 h-5 w-5" />
                                        Go to Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button size="lg" asChild>
                                        <Link href={register()}>
                                            Get Started
                                            <span className="ml-2"></span>
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild>
                                        <Link href={login()}>
                                            <LockIcon className="mr-2 h-4 w-4" />
                                            Sign In
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="border-t bg-muted/50 py-12 md:py-20">
                    <div className="container px-4 md:px-6">
                        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                                Everything You Need
                            </h2>
                            <p className="max-w-[85%] text-muted-foreground sm:text-lg">
                                A complete solution designed specifically for school cashier operations
                            </p>
                        </div>
                        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, index) => (
                                <Card key={index} className="relative overflow-hidden">
                                    <CardHeader>
                                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                            <feature.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base">{feature.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-12 md:py-20">
                    <div className="container px-4 md:px-6">
                        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                                Why Choose Our System?
                            </h2>
                            <p className="max-w-[85%] text-muted-foreground sm:text-lg">
                                Built with modern technology and best practices for educational institutions
                            </p>
                        </div>
                        <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex flex-col items-center text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <benefit.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
                                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="border-t bg-muted/50 py-12 md:py-20">
                    <div className="container px-4 md:px-6">
                        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-6 text-center">
                            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                                Ready to Get Started?
                            </h2>
                            <p className="max-w-[85%] text-muted-foreground sm:text-lg">
                                Join schools that are modernizing their payment operations
                            </p>
                            {!auth.user && (
                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    <Button size="lg" asChild>
                                        <Link href={register()}>
                                            Create Account
                                            <span className="ml-2"></span>
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild>
                                        <Link href={login()}>Sign In</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-6 md:py-8">
                <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
                    <div className="flex items-center gap-2">
                        <GraduationCapIcon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">School Cashier System</span>
                    </div>
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        Built with Laravel, React, and TypeScript.  2025 All rights reserved.
                    </p>
                </div>
            </footer>
        </>
    );
}
