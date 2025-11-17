import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { about, academics, admissions, contact, home } from '@/routes';
import { Head, Link, usePage, type InertiaLinkProps } from '@inertiajs/react';
import { Menu, School } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const navigationLinks: Array<{ label: string; href: NonNullable<InertiaLinkProps['href']> }> = [
    { label: 'Home', href: home() },
    { label: 'About Us', href: about() },
    { label: 'Academics', href: academics() },
    { label: 'Admissions', href: admissions() },
    { label: 'Contact', href: contact() },
];

const primaryCta = {
    label: 'Enroll Now',
    href: admissions(),
};

const socialLinks = [
    { label: 'Facebook', href: 'https://www.facebook.com/DeiGratiaSchoolInc' },
    { label: 'Instagram', href: 'https://www.instagram.com/deigratiaschool' },
    { label: 'YouTube', href: 'https://www.youtube.com/@DeiGratiaSchool' },
];

interface MainLayoutProps {
    title?: string;
    description?: string;
    className?: string;
}

export default function MainLayout({ children, title, description, className }: PropsWithChildren<MainLayoutProps>) {
    const { props } = usePage<{ branding?: { name?: string; logo?: string } }>();
    const branding = props.branding ?? {};
    const brandName = branding.name ?? 'Dei Gratia School Inc.';
    const brandLogo = branding.logo;

    const seoTitle = title ?? `${brandName} | Excellence in Community Education`;
    const seoDescription =
        description ?? `${brandName} delivers faith-driven, community-focused K-12 education for future-ready learners in Tanza, Cavite.`;

    const renderBrandSymbol = (variant: 'default' | 'footer' = 'default') => {
        if (brandLogo) {
            return (
                <img
                    src={brandLogo}
                    alt={`${brandName} logo`}
                    className={cn('h-10 w-auto object-contain', variant === 'footer' ? 'drop-shadow-[0_6px_18px_rgba(15,23,42,0.45)]' : '')}
                />
            );
        }

        const variantClasses = variant === 'footer' ? 'bg-white/10 text-white' : 'bg-blue-100 text-blue-600';

        return (
            <span className={cn('rounded-full p-2', variantClasses)}>
                <School className="h-5 w-5" />
            </span>
        );
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Head>
                <title>{seoTitle}</title>
                <meta head-key="description" name="description" content={seoDescription} />
            </Head>

            <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 shadow-[0_1px_12px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/65">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link href={home()} className="flex items-center gap-2" prefetch>
                        {renderBrandSymbol()}
                        <span className="text-base font-semibold text-slate-900 sm:text-lg">{brandName}</span>
                    </Link>

                    <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="rounded-full px-3 py-1 transition hover:bg-blue-50 hover:text-blue-700"
                                prefetch
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Button asChild className="bg-yellow-400 text-blue-950 shadow-md ring-1 ring-yellow-300/40 hover:bg-yellow-300">
                            <Link href={primaryCta.href} prefetch>
                                {primaryCta.label}
                            </Link>
                        </Button>
                    </nav>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="bg-white/95 px-6 pt-12 pb-10">
                            <div className="mb-8 flex items-center gap-2 text-slate-900">
                                {renderBrandSymbol()}
                                <div>
                                    <p className="text-sm tracking-wide text-slate-500 uppercase">{brandName}</p>
                                    <p className="text-lg font-semibold">Main Menu</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                {navigationLinks.map((link) => (
                                    <SheetClose asChild key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="rounded-md px-3 py-2 text-base font-medium text-slate-800 transition hover:bg-slate-100"
                                            prefetch
                                        >
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                ))}
                            </div>
                            <SheetClose asChild>
                                <Button asChild className="mt-8 w-full bg-yellow-400 text-blue-950 shadow-md hover:bg-yellow-300">
                                    <Link href={primaryCta.href} prefetch>
                                        {primaryCta.label}
                                    </Link>
                                </Button>
                            </SheetClose>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            <main className={cn('flex-1', className)}>{children}</main>

            <footer className="mt-24 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 py-14 text-slate-100">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 md:grid-cols-3">
                        <div>
                            <div className="flex items-center gap-2 text-lg font-semibold">
                                {renderBrandSymbol('footer')}
                                {brandName}
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-blue-100">Blk 18&amp;19, Ph1B Carissa Homes, Bagtas, Tanza, Cavite</p>
                            <a href="tel:+63468630045" className="mt-2 block text-sm font-medium text-blue-100 hover:text-yellow-200">
                                Phone: (046) 863 0045
                            </a>
                            <a href="mailto:info@deigratia.edu.ph" className="block text-sm font-medium text-blue-100 hover:text-yellow-200">
                                Email: info@deigratia.edu.ph
                            </a>
                        </div>
                        <div>
                            <p className="text-sm font-semibold tracking-wide text-blue-200 uppercase">Quick Links</p>
                            <ul className="mt-4 space-y-2 text-sm">
                                {navigationLinks.map((link) => (
                                    <li key={`footer-${link.label}`}>
                                        <Link href={link.href} className="transition hover:text-yellow-200" prefetch>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-semibold tracking-wide text-blue-200 uppercase">Connect With Us</p>
                            <p className="mt-4 text-sm text-blue-100">
                                Follow us on social platforms for campus highlights, enrollment reminders, and community stories.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-blue-100 transition hover:border-yellow-300 hover:text-yellow-200"
                                    >
                                        {social.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-blue-200">
                        © {new Date().getFullYear()} Dei Gratia School Inc. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
