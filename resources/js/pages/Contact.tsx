import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/layouts/MainLayout';
import { admissions } from '@/routes';
import { Link } from '@inertiajs/react';
import { Mail, MapPin, Phone, Send, UserCheck } from 'lucide-react';

const offices = [
    {
        title: 'Registrar & Records',
        contact: 'registrar@deigratia.edu.ph',
        schedule: 'Mon-Fri • 8:00 AM - 4:30 PM',
        description: 'Enrollment documents, student records, and credential requests.',
    },
    {
        title: 'Guidance & Wellness',
        contact: 'guidance@deigratia.edu.ph',
        schedule: 'Mon-Fri • 8:00 AM - 4:00 PM',
        description: 'Counseling appointments, referrals, and parent conferences.',
    },
    {
        title: 'Finance Office',
        contact: 'finance@deigratia.edu.ph',
        schedule: 'Mon-Fri • 8:00 AM - 5:00 PM',
        description: 'Payment schedules, scholarship queries, and official receipts.',
    },
];

const socialLinks = [
    { label: 'Facebook', href: 'https://www.facebook.com/DeiGratiaSchoolInc' },
    { label: 'Instagram', href: 'https://www.instagram.com/deigratiaschool' },
    { label: 'YouTube', href: 'https://www.youtube.com/@DeiGratiaSchool' },
];

export default function Contact() {
    return (
        <MainLayout title="Contact | Dei Gratia School Inc." className="bg-white">
            <section className="mx-auto w-full max-w-6xl px-4 py-16">
                <div className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr]">
                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-4xl border border-blue-200 bg-blue-50/70 p-8">
                            <div className="absolute inset-0">
                                <img
                                    src="/images/marketing/contact-support.jpg"
                                    alt="Admissions counselors supporting a family"
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/70 to-sky-500/70" />
                            </div>
                            <div className="relative space-y-4 text-white">
                                <p className="text-sm font-semibold tracking-[0.4em] text-sky-200 uppercase">Contact</p>
                                <h1 className="text-4xl font-semibold">We are here to serve your family.</h1>
                                <p className="text-base leading-relaxed text-white/80">
                                    Call, message, or visit us for enrollment assistance, campus tours, and student support. We respond within the
                                    same business day for inquiries sent before 4 PM.
                                </p>
                                <Link
                                    href={admissions()}
                                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/30"
                                >
                                    <UserCheck className="h-5 w-5" />
                                    Connect with Admissions
                                </Link>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card className="border-slate-200/60 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                                <CardContent className="space-y-2 px-6 py-6">
                                    <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Call Us</p>
                                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                        <Phone className="h-4 w-4 text-blue-600" />
                                        <a href="tel:+63468630045">(046) 863 0045</a>
                                    </div>
                                    <p className="text-sm text-slate-500">Mon-Fri • 7:30 AM - 5:00 PM</p>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200/60 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                                <CardContent className="space-y-2 px-6 py-6">
                                    <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Email Us</p>
                                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        <a href="mailto:info@deigratia.edu.ph">info@deigratia.edu.ph</a>
                                    </div>
                                    <p className="text-sm text-slate-500">We reply within the day.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="rounded-4xl border border-slate-200/70 bg-white/95 p-6 shadow-xl">
                        <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Visit Us</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Blk 18&19, Ph1B Carissa Homes, Bagtas, Tanza, Cavite</h2>
                        <p className="mt-3 text-sm text-slate-600">
                            Guarded campus with secure drop-off and ample parking. Please bring a valid ID when entering the school grounds.
                        </p>
                        <div className="mt-6 overflow-hidden rounded-2xl">
                            {/* <img
                                src="https://placehold.co/700x400/0f172a/e2e8f0?text=Campus+Map"
                                alt="Map to Dei Gratia School Inc."
                                className="h-full w-full object-cover"
                                loading="lazy"
                            /> */}
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3676.9906906978554!2d120.84474023766656!3d14.342412163330053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33962afc3c48ea69%3A0xf6c3186f0d845d4!2sDei%20Gratia%20School%2C%20Inc.!5e1!3m2!1sen!2ssg!4v1763377047190!5m2!1sen!2ssg"
                                width="1200"
                                height="450"
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16">
                <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Key Offices</p>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                    {offices.map((office) => (
                        <Card
                            key={office.title}
                            className="border-slate-200/60 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                        >
                            <CardContent className="space-y-3 px-6 py-6">
                                <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{office.title}</p>
                                <p className="text-sm text-slate-600">{office.description}</p>
                                <p className="text-sm font-semibold text-slate-900">{office.schedule}</p>
                                <a href={`mailto:${office.contact}`} className="text-sm font-semibold text-blue-700 hover:underline">
                                    {office.contact}
                                </a>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-24">
                <div className="rounded-4xl border border-slate-200/70 bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 shadow-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Stay Connected</p>
                            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Follow campus stories and announcements.</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/30 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-blue-500 hover:bg-white/60 hover:text-blue-600"
                                >
                                    <Send className="h-4 w-4" />
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                    <Separator className="my-8" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            Monday to Friday • 7:30 AM - 5:30 PM | Saturday (Office Only) • 8:00 AM - 12:00 NN
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Phone className="h-4 w-4 text-blue-600" />
                            Emergency hotline:{' '}
                            <a href="tel:+639178880045" className="font-semibold text-blue-700">
                                +63 917 888 0045
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
