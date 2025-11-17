import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/MainLayout';
import { admissions, contact } from '@/routes';
import { Link } from '@inertiajs/react';
import { CalendarCheck, ClipboardList, FileCheck2, PhoneCall, Sparkles, Users } from 'lucide-react';

const steps = [
    {
        title: '1. Inquiry & Campus Tour',
        description: 'Book a campus visit or virtual consultation. Our admissions team will walk you through programs, fees, and schedules.',
        icon: CalendarCheck,
    },
    {
        title: '2. Application Submission',
        description: 'Complete the online form and submit requirements (PSA birth certificate, latest report card, good moral certificate).',
        icon: ClipboardList,
    },
    {
        title: '3. Readiness Assessment',
        description: 'Students take a short diagnostic and interview so we understand learning styles, goals, and support needs.',
        icon: Sparkles,
    },
    {
        title: '4. Enrollment & Orientation',
        description: 'Secure reservation, finalize fees, and join our Bridging Week to get to know teachers and classmates.',
        icon: Users,
    },
];

const requirements = [
    'PSA Birth Certificate (photocopy)',
    'Report Card / Form 138 (latest)',
    'Certificate of Good Moral Character',
    '2 pcs 2x2 ID photo (white background)',
    'For transferees: Form 137 / SF10',
];

const tuitionHighlights = [
    { label: 'Preschool', detail: 'Starts at ₱35,000 / year' },
    { label: 'Elementary', detail: 'Starts at ₱42,000 / year' },
    { label: 'Junior High', detail: 'Starts at ₱48,000 / year' },
    { label: 'Senior High (GAS)', detail: 'Starts at ₱52,000 / year' },
];

export default function Admissions() {
    return (
        <MainLayout title="Admissions | Dei Gratia School Inc." className="bg-white">
            <section className="mx-auto w-full max-w-6xl px-4 py-16">
                <div className="relative overflow-hidden rounded-4xl border border-amber-100 bg-amber-50/70 px-8 py-12 text-blue-950 shadow-[0_30px_80px_-40px_rgba(15,23,42,.7)]">
                    <div className="absolute inset-0">
                        <img
                            src="/images/marketing/admissions-team.jpg"
                            alt="Admissions team assisting families"
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-amber-500/70" />
                    </div>
                    <div className="relative">
                        <p className="text-sm font-semibold tracking-[0.4em] text-amber-200 uppercase">Admissions</p>
                        <h1 className="mt-4 text-4xl font-semibold text-white">Enrollment designed around families.</h1>
                        <p className="mt-4 max-w-3xl text-base text-white/80">
                            We keep the process clear, compassionate, and responsive. Whether you are a returning family or a transferee, our team is
                            ready to guide you every step of the way.
                        </p>
                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <Link
                                href={contact()}
                                className="inline-flex items-center justify-center rounded-full bg-white/90 px-6 py-3 text-base font-semibold text-blue-950 shadow-lg transition hover:bg-white"
                            >
                                Schedule a Visit
                            </Link>
                            <a
                                href="https://forms.gle/DeiGratiaEnrollment"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-full border border-white/80 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                            >
                                Apply Online
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16">
                <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Enrollment Steps</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Simple, guided process.</h2>
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <Card
                                key={step.title}
                                className="border-slate-200/60 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                            >
                                <CardContent className="space-y-4 px-6 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-blue-50 p-2 text-blue-700">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                                    </div>
                                    <p className="text-sm text-slate-600">{step.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16">
                <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
                    <Card className="border-slate-200/60 bg-gradient-to-br from-white via-white to-blue-50 shadow-sm">
                        <CardContent className="space-y-5 px-6 py-8">
                            <h2 className="text-2xl font-semibold text-slate-900">Requirements</h2>
                            <div className="grid gap-3 text-sm text-slate-600">
                                {requirements.map((item) => (
                                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3">
                                        <FileCheck2 className="mt-0.5 h-4 w-4 text-blue-600" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-100 bg-gradient-to-b from-blue-900 to-blue-700 text-white shadow-lg">
                        <CardContent className="space-y-4 px-6 py-8">
                            <h2 className="text-2xl font-semibold">FAPE-ESC & Discounts</h2>
                            <p className="text-sm text-white/80">
                                Preschool to JHS learners may avail of sibling discounts. Junior High and Senior High students can apply for FAPE-ESC
                                and SHS vouchers during enrollment.
                            </p>
                            <Link
                                href={admissions()}
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                            >
                                <ClipboardList className="h-4 w-4" />
                                View Tuition Matrix
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-24">
                <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Tuition Highlights</p>
                <div className="mt-6 grid gap-6 md:grid-cols-4">
                    {tuitionHighlights.map((item) => (
                        <Card
                            key={item.label}
                            className="border-slate-200/60 bg-white/95 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                        >
                            <CardContent className="space-y-2 px-6 py-6">
                                <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{item.label}</p>
                                <p className="text-xl font-semibold text-slate-900">{item.detail}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-blue-100 px-8 py-10 text-center shadow-lg">
                    <div className="rounded-full bg-white/70 p-3 text-blue-600 shadow-inner">
                        <PhoneCall className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900">Need assistance with requirements or scholarships?</p>
                    <p className="text-sm text-slate-600">Call us at (046) 863 0045 or email admissions@deigratia.edu.ph</p>
                </div>
            </section>
        </MainLayout>
    );
}
