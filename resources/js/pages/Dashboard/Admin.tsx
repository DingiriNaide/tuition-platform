import { Head, Link, Deferred } from '@inertiajs/react';
import { Users, GraduationCap, ShieldCheck, BookOpen, CalendarDays, DollarSign, Ticket, BarChart2 } from 'lucide-react';
import StatsSkeleton from '@/components/skeletons/StatsSkeleton';

interface Stats {
    total_students: number;
    total_tutors: number;
    pending_verifications: number;
    total_subjects: number;
    active_courses: number;
    total_bookings: number;
    todays_sessions: number;
    total_revenue: number;
}

interface Props {
    stats?: Stats; // Made optional for Deferred loading
}

export default function AdminDashboard({ stats }: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="max-w-5xl mx-auto p-6 space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Platform overview and management.</p>
                </div>

                {/* Everything relying on Stats is deferred together */}
                <Deferred data="stats" fallback={
                    <div className="space-y-6">
                        {/* We use count 8 here so it generates two rows of 4 cards */}
                        <StatsSkeleton count={8} /> 
                    </div>
                }>
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Students',        value: stats?.total_students,        icon: Users,        color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Total Tutors',          value: stats?.total_tutors,          icon: GraduationCap,color: 'text-blue-600',    bg: 'bg-blue-50'    },
                            { label: 'Pending Verifications', value: stats?.pending_verifications, icon: ShieldCheck,  color: 'text-amber-600',   bg: 'bg-amber-50'   },
                            { label: 'Total Subjects',        value: stats?.total_subjects,        icon: BookOpen,     color: 'text-purple-600',  bg: 'bg-purple-50'  },
                            { label: 'Active Courses',        value: stats?.active_courses,        icon: BookOpen,     color: 'text-teal-600',    bg: 'bg-teal-50'    },
                            { label: 'Active Bookings',       value: stats?.total_bookings,        icon: CalendarDays, color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
                            { label: "Today's Sessions",      value: stats?.todays_sessions,       icon: CalendarDays, color: 'text-rose-600',    bg: 'bg-rose-50'    },
                            { label: 'Total Revenue',         value: stats ? `LKR ${Number(stats.total_revenue).toLocaleString('en-LK')}` : '—', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-gray-500">{label}</p>
                                    <div className={`size-7 rounded-lg ${bg} flex items-center justify-center`}>
                                        <Icon className={`size-3.5 ${color}`} />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pending verifications alert */}
                    {stats && stats.pending_verifications > 0 && (
                        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-amber-900">Tutor Verifications Pending</p>
                                <p className="text-sm text-amber-700 mt-0.5">
                                    {stats.pending_verifications} tutor{stats.pending_verifications > 1 ? 's' : ''} waiting for approval
                                </p>
                            </div>
                            <Link href="/admin/tutors"
                                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 text-sm transition-colors">
                                Review Now
                            </Link>
                        </div>
                    )}
                </Deferred>

                {/* Quick actions (static, loads instantly) */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { title: 'Verify Tutors',      desc: 'Review pending tutor applications', href: '/admin/tutors',    icon: ShieldCheck },
                            { title: 'Manage Vouchers',    desc: 'Create and manage discount codes',  href: '/admin/vouchers',  icon: Ticket      },
                            { title: 'Browse Courses',     desc: 'View all platform courses',         href: '/courses',         icon: BookOpen    },
                            { title: 'Platform Analytics', desc: 'Revenue, growth, and usage stats',  href: '#',                icon: BarChart2   },
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