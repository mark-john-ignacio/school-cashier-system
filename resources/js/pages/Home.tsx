import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/layouts/MainLayout';
import { about, admissions } from '@/routes';
import { Link } from '@inertiajs/react';
import { Award, BookOpen, Users } from 'lucide-react';

const academicPrograms = [
    {
        title: 'Preschool',
        description: 'Play-based learning with strong literacy and numeracy foundations.',
    },
    {
        title: 'Elementary',
        description: 'Integrated STEM and values education across key learning areas.',
    },
    {
        title: 'Junior High School',
        description: 'Competency-based instruction preparing learners for senior tracks.',
    },
    {
        title: 'Senior High School',
        description: 'General Academic Strand (GAS) with college and career coaching.',
    },
];

const differentiators = [
    {
        title: 'FAPE-ESC Certified',
        description: 'Scholarship-ready programs that meet the standards of the Education Service Contracting grant.',
        icon: Award,
    },
    {
        title: 'Experienced Faculty',
        description: 'Seasoned educators dedicated to holistic formation and student mentorship.',
        icon: Users,
    },
    {
        title: 'Community-Focused',
        description: 'Active partnerships with families and barangay leaders to build a safe, nurturing environment.',
        icon: BookOpen,
    },
];

const impactStats = [
    { label: 'Years of Service', value: '26+' },
    { label: 'Learners Served', value: '1,200+' },
    { label: 'Faculty Mentors', value: '80+' },
    { label: 'Average Class Size', value: '25' },
];

export default function Home() {
    return (
        <MainLayout title="Dei Gratia School Inc. | Home" className="bg-gradient-to-b from-white via-slate-50 to-white">
            <section className="relative isolate flex min-h-[65vh] items-center overflow-hidden rounded-b-[3.5rem] bg-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.35)]">
                <img
                    src="/images/marketing/home-hero.jpg"
                    alt="Students of Dei Gratia School Inc."
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/70 to-slate-900/80" />
                <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-20 text-center text-white">
                    <p className="text-xs tracking-[0.45em] text-slate-200 uppercase">Dei Gratia School Inc.</p>
                    <h1 className="text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">Nurturing Minds, Building Futures</h1>
                    <p className="max-w-3xl text-base text-slate-100/90 sm:text-lg">
                        Providing quality, community-focused K-12 education in Tanza, Cavite since 1998.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button asChild className="bg-yellow-400 text-blue-950 shadow-lg ring-1 ring-yellow-200/40 hover:bg-yellow-300">
                            <Link href={admissions()}>Apply Now</Link>
                        </Button>
                        <Button variant="outline" asChild className="border-white/30 bg-white/5 text-white shadow-inner hover:bg-white/15">
                            <Link href={about()}>Learn More</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="mx-auto -mt-12 w-full max-w-5xl rounded-3xl border border-white/70 bg-white/90 px-6 py-8 shadow-2xl backdrop-blur">
                <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
                    {impactStats.map((stat) => (
                        <div key={stat.label} className="space-y-1">
                            <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                            <p className="text-xs font-semibold tracking-[0.4em] text-slate-500 uppercase">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="about" className="mx-auto mt-16 w-full max-w-6xl px-4">
                <div className="grid gap-10 md:grid-cols-2 md:items-center">
                    <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-100">
                        <img
                            src="/images/marketing/home-campus.jpg"
                            alt="Dei Gratia School campus"
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    </div>
                    <div className="space-y-4 text-slate-700">
                        <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">About Us</p>
                        <h2 className="text-3xl font-semibold text-slate-900">Welcome to Dei Gratia School Inc.</h2>
                        <p className="text-base leading-relaxed text-slate-600">
                            Since 1998, Dei Gratia School Inc. has delivered faith-centered, learner-driven education that empowers students to grow
                            academically, socially, and spiritually. Our mission is to champion future-ready leaders through rigorous academics,
                            compassionate mentorship, and service to the local community.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto mt-20 w-full max-w-6xl px-4">
                <div className="text-center">
                    <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Programs</p>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-900">Our Academic Programs</h2>
                    <p className="mt-2 text-base text-slate-600">
                        Comprehensive offerings from preschool to senior high that encourage curiosity and resilience.
                    </p>
                </div>
                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {academicPrograms.map((program) => (
                        <Card
                            key={program.title}
                            className="group border-slate-200/60 bg-white/95 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                        >
                            <CardContent className="space-y-3 px-6 py-8">
                                <h3 className="text-xl font-semibold text-slate-900">{program.title}</h3>
                                <p className="text-sm text-slate-600">{program.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mx-auto mt-20 w-full max-w-6xl px-4 pb-20">
                <div className="text-center">
                    <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Why Choose Us</p>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-900">Why Choose Dei Gratia?</h2>
                    <p className="mt-2 text-base text-slate-600">
                        A trusted partner for families who value excellence, character, and community care.
                    </p>
                </div>
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {differentiators.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50 p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-700 shadow-inner">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold text-slate-900">{item.title}</h3>
                            <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </MainLayout>
    );
}
