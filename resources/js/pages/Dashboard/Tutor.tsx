import { Head, Link, Deferred } from '@inertiajs/react';
import { Users, CalendarDays, FileText, BookOpen, DollarSign, Clock, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { create, edit } from '@/actions/App/Http/Controllers/ProfileController/TutorProfileController';
import { index, create as createCourse } from '@/actions/App/Http/Controllers/CourseController';
import { index as paymentsIndex } from '@/actions/App/Http/Controllers/PaymentController';
import StatsSkeleton from '@/components/skeletons/StatsSkeleton';
import EarningsSkeleton from '@/components/skeletons/EarningsSkeleton';

interface Subject {
    id: number;
    name: string;
}

interface TutorProfile {
    id: number;
    full_name: string;
    is_verified: boolean;
    is_active: boolean;
    rating: number;
    total_reviews: number;
    hourly_rate: number;
    medium: string;
    subjects: Subject[];
}

interface Stats {
    total_students: number;
    upcoming_classes: number;
    pending_reviews: number;
    active_courses: number;
}

interface Props {
    profile: TutorProfile | null;
    stats?: Stats;
    pendingPayouts?: number;
    totalEarnings?: number;
}

export default function TutorDashboard({ profile, stats, pendingPayouts, totalEarnings }: Props) {
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
                            <p className="text-amber-800 text-sm font-medium">Complete your tutor profile to start teaching.</p>
                            <Link href={create.url()}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                                Create Profile
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pending verification */}
                {profile && !profile.is_verified && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                        <p className="text-blue-800 text-sm font-medium">
                            ⏳ Your profile is pending admin verification. You'll be notified once approved.
                        </p>
                    </div>
                )}

                {/* Welcome */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back{profile ? `, ${profile.full_name.split(' ')[0]}` : ''}!
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Here's your teaching overview.</p>
                    </div>
                    {profile?.is_verified && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">
                            ✓ Verified Tutor
                        </span>
                    )}
                </div>

                {/* Stats — deferred */}
                <Deferred data="stats" fallback={<StatsSkeleton count={4} />}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Students',   value: stats?.total_students,   icon: Users,        color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Upcoming Classes', value: stats?.upcoming_classes, icon: CalendarDays, color: 'text-blue-600',    bg: 'bg-blue-50'    },
                            { label: 'Pending Reviews',  value: stats?.pending_reviews,  icon: FileText,     color: 'text-amber-600',   bg: 'bg-amber-50'   },
                            { label: 'Active Courses',   value: stats?.active_courses,   icon: BookOpen,     color: 'text-purple-600',  bg: 'bg-purple-50'  },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-gray-500">{label}</p>
                                    <div className={`size-7 rounded-lg ${bg} flex items-center justify-center`}>
                                        <Icon className={`size-3.5 ${color}`} />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{value}</p>
                            </div>
                        ))}
                    </div>
                </Deferred>

                {/* Earnings — deferred */}
                <Deferred data={['pendingPayouts', 'totalEarnings']} fallback={<EarningsSkeleton />}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="size-4 text-amber-600" />
                                <p className="text-sm text-amber-700 font-medium">Pending Payouts</p>
                            </div>
                            <p className="text-2xl font-bold text-amber-900">
                                LKR {Number(pendingPayouts ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="size-4 text-emerald-600" />
                                <p className="text-sm text-emerald-700 font-medium">Total Earnings</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-900">
                                LKR {Number(totalEarnings ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
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
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            {[
                                { label: 'Rating',      value: `${Number(profile.rating ?? 0).toFixed(1)} ★ (${profile.total_reviews ?? 0} reviews)` },
                                { label: 'Hourly Rate', value: profile.hourly_rate ? `LKR ${profile.hourly_rate}` : '—' },
                                { label: 'Medium',      value: profile.medium },
                                { label: 'Status',      value: profile.is_active ? 'Active' : 'Inactive' },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                                    <p className="font-medium text-gray-800 capitalize">{value}</p>
                                </div>
                            ))}
                        </div>
                        {profile.subjects?.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Subjects</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.subjects.map(subject => (
                                        <span key={subject.id}
                                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                                            {subject.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { title: 'Create Course',    desc: 'List a new course for students',    href: createCourse.url(),   icon: PlusCircle  },
                            { title: 'My Courses',       desc: 'View and manage your courses',      href: `${index.url()}?mine=1`,         icon: BookOpen    },
                            { title: 'View Earnings',    desc: 'Check your payment history',        href: paymentsIndex.url(), icon: DollarSign  },
                            { title: 'Schedule Class',   desc: 'Set up an upcoming session',        href: '/schedules/create', icon: CalendarDays},
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