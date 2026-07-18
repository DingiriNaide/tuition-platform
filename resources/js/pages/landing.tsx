import { Head, Link } from '@inertiajs/react';
import { BookOpen, Users, GraduationCap, ChevronRight, Star } from 'lucide-react';
import { login, register } from '@/routes';
import { index as coursesIndex } from '@/actions/App/Http/Controllers/CourseController';
import AppLogoIcon from '@/components/app-logo-icon';

interface Course {
    id: number;
    title: string;
    subject: string;
    tutor_name: string;
    grade: string;
    medium: string;
    syllabus: string;
    price_per_session: string;
    price_monthly: string;
    is_group: boolean;
}

interface Props {
    featuredCourses: Course[];
    stats: { tutors: number; courses: number; students: number };
}

const MEDIUM_LABELS: Record<string, string> = {
    sinhala: 'සිංහල',
    tamil:   'தமிழ்',
    english: 'English',
};

const SYLLABUS_LABELS: Record<string, string> = {
    ol:         'O/L',
    al:         'A/L',
    foundation: 'Foundation',
    general:    'General',
};

export default function Landing({ featuredCourses, stats }: Props) {
    return (
        <>
            <Head title="Ulama — Sri Lanka's Premier Tutoring Platform" />

            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 p-0">
                            <AppLogoIcon className="w-full h-full text-white" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">Ulama</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={login()}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors">
                            Log in
                        </Link>
                        <Link href={register()}
                            className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700
                                       text-white px-4 py-2 rounded-lg transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background image */}
                <img
                    src="/images/hero-illustration.jpeg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-left"
                />
                {/* Gradient overlay — heavier than the auth page since this photo is busier */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/55 via-emerald-900/90 to-emerald-800/85" />

                <div className="relative max-w-6xl mx-auto px-6 text-center">
                    <span className="inline-block bg-emerald-700/50 text-emerald-200 text-xs font-semibold
                                    px-3 py-1 rounded-full mb-6 tracking-wider uppercase">
                        Sri Lanka's #1 Tutoring Platform
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                        Learn Smarter<br />
                        <span className="text-emerald-400">with Ulama</span>
                    </h1>
                    <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        Connect with qualified tutors for O/L, A/L, and foundation courses.
                        Available in Sinhala, Tamil, and English — learn at your own pace.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={register()}
                            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400
                                    text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base">
                            Start Learning Free
                            <ChevronRight className="size-4" />
                        </Link>
                        <Link href="#courses"
                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20
                                    text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base">
                            Browse Courses
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                        {[
                            { icon: Users,          label: 'Verified Tutors', value: stats.tutors   },
                            { icon: BookOpen,       label: 'Active Courses',  value: stats.courses  },
                            { icon: GraduationCap,  label: 'Students',        value: stats.students },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="text-center">
                                <Icon className="size-5 text-emerald-400 mx-auto mb-2" />
                                <p className="text-3xl font-bold text-white">{value}+</p>
                                <p className="text-emerald-300 text-sm mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">How Ulama Works</h2>
                        <p className="text-gray-500 mt-3">Get started in three simple steps</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Create an Account',
                                description: 'Sign up as a student, parent, or tutor. Set up your profile in minutes.',
                            },
                            {
                                step: '02',
                                title: 'Find Your Course',
                                description: 'Browse courses by subject, grade, medium, and syllabus. Filter by O/L, A/L, or Foundation.',
                            },
                            {
                                step: '03',
                                title: 'Start Learning',
                                description: 'Book sessions, attend live classes, track progress, and pay per session or monthly.',
                            },
                        ].map((item) => (
                            <div key={item.step} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                                <span className="text-4xl font-black text-emerald-100">{item.step}</span>
                                <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            <section id="courses" className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
                            <p className="text-gray-500 mt-2">Explore our most popular tutoring sessions</p>
                        </div>
                        <Link href={coursesIndex.url()}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                            View all <ChevronRight className="size-4" />
                        </Link>
                    </div>

                    {featuredCourses.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            No courses available yet. Check back soon!
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredCourses.map((course) => (
                                <div key={course.id}
                                    className="rounded-2xl border border-gray-100 bg-white shadow-sm
                                               hover:shadow-md transition-shadow overflow-hidden">
                                    {/* Card header */}
                                    <div className="bg-emerald-50 px-5 py-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                                                {course.subject}
                                            </span>
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                                {SYLLABUS_LABELS[course.syllabus] ?? course.syllabus}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 leading-snug">{course.title}</h3>
                                    </div>

                                    {/* Card body */}
                                    <div className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                            <Star className="size-3.5 text-amber-400 fill-amber-400" />
                                            <span className="font-medium text-gray-700">{course.tutor_name}</span>
                                        </div>
                                        <div className="flex gap-2 flex-wrap mb-4">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                                {course.grade?.toUpperCase()}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                                {MEDIUM_LABELS[course.medium] ?? course.medium}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                                {course.is_group ? 'Group' : '1-on-1'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400">From</p>
                                                <p className="font-bold text-emerald-700">
                                                    LKR {Number(course.price_per_session).toLocaleString('en-LK')}
                                                    <span className="text-xs font-normal text-gray-400"> /session</span>
                                                </p>
                                            </div>
                                            <Link href={register()}
                                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white
                                                           font-semibold px-4 py-2 rounded-lg transition-colors">
                                                Enroll
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-20 bg-emerald-800">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Excel in Your Exams?
                    </h2>
                    <p className="text-emerald-200 mb-8">
                        Join thousands of Sri Lankan students achieving their academic goals with Ulama.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={register()}
                            className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold
                                       px-8 py-3.5 rounded-xl transition-colors">
                            Register as Student
                        </Link>
                        <Link href={register()}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold
                                       px-8 py-3.5 rounded-xl transition-colors border border-emerald-500">
                            Register as Tutor
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-emerald-950 py-10">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 p-0">
                            <AppLogoIcon className="w-full h-full text-white" />
                        </div>
                        <span className="font-bold text-white">Ulama</span>
                    </div>
                    <p className="text-emerald-400 text-sm">
                        © {new Date().getFullYear()} Ulama. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-emerald-400">
                        <Link href={login()} className="hover:text-white transition-colors">Log in</Link>
                        <Link href={register()} className="hover:text-white transition-colors">Register</Link>
                    </div>
                </div>
            </footer>
        </>
    );
}