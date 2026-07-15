import { Head, Link } from '@inertiajs/react';
import { Users, CalendarDays, CreditCard, BookOpen, BarChart2, UserPlus } from 'lucide-react';
import { create, edit } from '@/actions/App/Http/Controllers/ProfileController/ParentProfileController';
import { index as coursesIndex } from '@/actions/App/Http/Controllers/CourseController';

interface ParentProfile {
    id: number;
    full_name: string;
    phone: string;
    district: string;
    city: string;
}

interface Stats {
    linked_students: number;
    upcoming_classes: number;
    pending_payments: number;
}

interface Props {
    profile: ParentProfile | null;
    stats: Stats;
}

export default function ParentDashboard({ profile, stats }: Props) {
    return (
        <>
            <Head title="Parent Dashboard" />
            <div className="max-w-5xl mx-auto p-6 space-y-6">

                {!profile && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between">
                        <p className="text-amber-800 text-sm font-medium">
                            Complete your parent profile to monitor your children's progress.
                        </p>
                        <Link href={create.url()}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                            Create Profile
                        </Link>
                    </div>
                )}

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back{profile ? `, ${profile.full_name.split(' ')[0]}` : ''}!
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Monitor your children's learning progress.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Linked Students',  value: stats.linked_students,  icon: Users,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Upcoming Classes', value: stats.upcoming_classes, icon: CalendarDays, color: 'text-blue-600',   bg: 'bg-blue-50'    },
                        { label: 'Pending Payments', value: stats.pending_payments, icon: CreditCard,  color: 'text-amber-600',  bg: 'bg-amber-50'   },
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
                                { label: 'Phone',    value: profile.phone    },
                                { label: 'District', value: profile.district },
                                { label: 'City',     value: profile.city     },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                                    <p className="font-medium text-gray-800">{value ?? '—'}</p>
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
                            { title: 'Link a Student',  desc: "Connect your child's account",    href: '#',                icon: UserPlus    },
                            { title: 'View Progress',   desc: 'Check attendance and grades',     href: '#',                icon: BarChart2   },
                            { title: 'Browse Courses',  desc: 'Find tutors for your child',      href: coursesIndex.url(), icon: BookOpen    },
                            { title: 'Payments',        desc: 'Manage fees and invoices',        href: '#',                icon: CreditCard  },
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