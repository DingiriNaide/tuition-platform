import { Head, Link, Deferred } from '@inertiajs/react';
import { CalendarDays, CheckSquare, BookOpen, CreditCard, BarChart2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { create, edit } from '@/actions/App/Http/Controllers/ProfileController/StudentProfileController';
import { index as paymentsIndex } from '@/actions/App/Http/Controllers/PaymentController';
import { index as coursesIndex } from '@/actions/App/Http/Controllers/CourseController';
import StatsSkeleton from '@/components/skeletons/StatsSkeleton';
import PaymentsBannerSkeleton from '@/components/skeletons/PaymentsBannerSkeleton';

interface StudentProfile {
    id: number;
    full_name: string;
    grade: string;
    medium: string;
    school: string;
    district: string;
}

interface Stats {
    upcoming_classes: number;
    completed_classes: number;
    attended_sessions: number;
}

interface Props {
    profile: StudentProfile | null;
    stats?: Stats;
    pendingPaymentsCount?: number;
    pendingPaymentsAmount?: number;
}

export default function StudentDashboard({ profile, stats, pendingPaymentsCount, pendingPaymentsAmount }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="max-w-5xl mx-auto p-6 space-y-6">

                {/* Profile incomplete warning */}
                <AnimatePresence>
                    {!profile && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between overflow-hidden"
                        >
                            <p className="text-amber-800 text-sm font-medium">Complete your student profile to get started.</p>
                            <Link href={create.url()}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                                Create Profile
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pending payments banner — deferred */}
                <Deferred data={['pendingPaymentsCount', 'pendingPaymentsAmount']} fallback={<PaymentsBannerSkeleton />}>
                    <AnimatePresence>
                        {pendingPaymentsCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -12, height: 0 }}
                                animate={{
                                    opacity: 1, y: 0, height: 'auto',
                                    boxShadow: '0 0 0 4px rgba(245,158,11,0.15)',
                                }}
                                exit={{
                                    opacity: 0, y: -12, height: 0,
                                    boxShadow: '0 0 0 0 rgba(245,158,11,0)',
                                    transition: { duration: 0.3 },
                                }}
                                transition={{
                                    default: { duration: 0.3 },
                                    boxShadow: {
                                        duration: 1.2,
                                        repeat: Infinity,
                                        repeatType: 'mirror',
                                        ease: 'easeInOut',
                                    },
                                }}
                                className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between overflow-hidden"
                            >
                                <div>
                                    <p className="font-semibold text-amber-900">Outstanding Payments</p>
                                    <p className="text-sm text-amber-700 mt-0.5">
                                        {pendingPaymentsCount} session{(pendingPaymentsCount ?? 0) > 1 ? 's' : ''} attended —
                                        LKR {Number(pendingPaymentsAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })} due
                                    </p>
                                </div>
                                <Link href={paymentsIndex.url()}
                                    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 text-sm transition-colors">
                                    Pay Now
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Deferred>

                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back{profile ? `, ${profile.full_name.split(' ')[0]}` : ''}!
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Here's what's happening with your studies.</p>
                </div>

                {/* Stats — deferred */}
                <Deferred data="stats" fallback={<StatsSkeleton />}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Upcoming Classes',   value: stats?.upcoming_classes,  icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Completed Classes',  value: stats?.completed_classes, icon: CheckSquare,  color: 'text-blue-600',    bg: 'bg-blue-50'    },
                            { label: 'Sessions Attended',  value: stats?.attended_sessions, icon: BarChart2,    color: 'text-purple-600',  bg: 'bg-purple-50'  },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-gray-500">{label}</p>
                                    <div className={`size-8 rounded-lg ${bg} flex items-center justify-center`}>
                                        <Icon className={`size-4 ${color}`} />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{value}</p>
                            </div>
                        ))}
                    </div>
                </Deferred>

                {/* Profile card */}
                {profile && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-900">My Profile</h2>
                            <Link href={edit.url()} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                Edit
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {[
                                { label: 'Grade',    value: profile.grade?.replace('_', ' ') },
                                { label: 'Medium',   value: profile.medium },
                                { label: 'School',   value: profile.school },
                                { label: 'District', value: profile.district },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                                    <p className="font-medium text-gray-800 capitalize">{value ?? '—'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { title: 'Browse Courses',   desc: 'Find tutors by subject and grade', href: coursesIndex.url(), icon: BookOpen    },
                            { title: 'My Payments',      desc: 'View and pay outstanding bills',   href: paymentsIndex.url(), icon: CreditCard },
                            { title: 'Past Papers',      desc: 'Practice with exam resources',     href: '#',                icon: BarChart2  },
                            { title: 'Mock Exams',       desc: 'Test yourself under exam conditions', href: '#',             icon: Clock      },
                        ].map(({ title, desc, href, icon: Icon }) => (
                            <Link key={title} href={href}
                                className="flex items-start gap-3 border border-gray-100 rounded-xl p-4
                                           hover:bg-emerald-50 hover:border-emerald-200 transition-colors group">
                                <div className="size-8 rounded-lg bg-gray-100 group-hover:bg-emerald-100
                                                flex items-center justify-center shrink-0 mt-0.5">
                                    <Icon className="size-4 text-gray-500 group-hover:text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-gray-900">{title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}