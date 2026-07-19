import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutGrid, BookOpen, CalendarDays, CheckSquare,
    BarChart2, CreditCard, GraduationCap, Users,
    ShieldCheck, Ticket, FileText, DollarSign,
    Menu, X, ChevronDown, LogOut, Settings, User,
    BookOpenCheck
} from 'lucide-react';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';

interface Props {
    children: React.ReactNode;
    breadcrumbs?: { title: string; href?: string }[];
}

const studentNav: NavItem[] = [
    { title: 'Dashboard',        href: dashboard(),      icon: LayoutGrid   },
    { title: 'Browse Courses',   href: '/courses',       icon: BookOpen     },
    { title: 'My Bookings',      href: '/bookings',      icon: CalendarDays },
    { title: 'Attendance',       href: '/attendance',    icon: CheckSquare  },
    { title: 'Progress Reports', href: '/my-progress',   icon: BarChart2    },
    { title: 'Payments',         href: '/my-payments',   icon: CreditCard   },
];

const tutorNav: NavItem[] = [
    { title: 'Dashboard',        href: dashboard(),         icon: LayoutGrid  },
    { title: 'All Courses',       href: '/courses',          icon: BookOpen   },
    { title: 'Bookings',         href: '/tutor/bookings',   icon: CalendarDays},
    { title: 'Schedules',        href: '/schedules',        icon: CalendarDays},
    { title: 'Progress Reports', href: '/progress-reports', icon: FileText    },
    { title: 'Earnings',         href: '/tutor/earnings',   icon: DollarSign  },
];

const adminNav: NavItem[] = [
    { title: 'Dashboard',          href: dashboard(),       icon: LayoutGrid    },
    { title: 'Tutor Verification', href: '/admin/tutors',   icon: ShieldCheck   },
    { title: 'Manage Subjects',    href: '/admin/subjects', icon: BookOpenCheck },
    { title: 'Vouchers',           href: '/admin/vouchers', icon: Ticket        },
    { title: 'Courses',            href: '/courses',        icon: BookOpen      },
    { title: 'Payments',           href: '/admin/payments', icon: CreditCard    },
];

const parentNav: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
];

export default function AppLayout({ children, breadcrumbs = [] }: Props) {
    const { auth, url } = usePage().props as any;
    const currentUrl = usePage().url;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const roles: string[] = auth?.user?.roles ?? [];
    const isAdmin   = roles.includes('admin') || roles.includes('super-admin');
    const isTutor   = roles.includes('tutor');
    const isStudent = roles.includes('student');
    const isParent  = roles.includes('parent');

    const navItems = isAdmin   ? adminNav
        : isTutor   ? tutorNav
        : isStudent ? studentNav
        : isParent  ? parentNav
        : [{ title: 'Dashboard', href: dashboard(), icon: LayoutGrid }];

    const isActive = (href: string) =>
        currentUrl === href || currentUrl.startsWith(href + '/');

    const user = auth?.user;
    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    return (
        <div className="flex h-screen bg-background overflow-hidden">

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <>
                {/* Mobile overlay */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                <aside className={`
                    fixed inset-y-0 left-0 z-30 w-56 bg-sidebar flex flex-col
                    transform transition-transform duration-200 ease-in-out
                    lg:static lg:translate-x-0
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-5 py-5 border-b border-emerald-800">
                        <div className="size-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 p-0">
                            <AppLogoIcon className="w-full h-full text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-tight">Ulama</p>
                            <p className="text-emerald-400 text-xs">Learning Platform</p>
                        </div>
                    </div>

                    {/* Nav items */}
                    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                        ${active
                                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                        }`}
                                >
                                    {item.icon && (
                                        <item.icon className={`size-4 shrink-0 ${active ? 'text-emerald-300' : 'text-emerald-400'}`} />
                                    )}
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-emerald-800 px-3 py-3">
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                           text-emerald-100 hover:bg-emerald-800 transition-colors"
                            >
                                <div className="size-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-bold">{initials}</span>
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-emerald-400 capitalize mt-0.5">{roles[0] ?? 'user'}</p>
                                </div>
                                <ChevronDown className="size-3.5 text-emerald-400 shrink-0" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl
                                                shadow-lg border border-gray-100 overflow-hidden z-50">
                                    <Link href="/settings/profile"
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700
                                                   hover:bg-gray-50 transition-colors">
                                        <User className="size-4 text-gray-400" />
                                        Profile Settings
                                    </Link>
                                    <div className="border-t border-gray-100" />
                                    <Link href="/logout" method="post" as="button"
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm
                                                   text-red-600 hover:bg-red-50 transition-colors">
                                        <LogOut className="size-4" />
                                        Log out
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </>

            {/* ── Main area ────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top navbar */}
                <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0">
                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <Menu className="size-5" />
                    </button>

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-2">
                                {i > 0 && <span className="text-gray-300">/</span>}
                                {crumb.href
                                    ? <Link href={crumb.href} className="hover:text-gray-900 transition-colors truncate">{crumb.title}</Link>
                                    : <span className="text-gray-900 font-medium truncate">{crumb.title}</span>
                                }
                            </span>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>
                        <div className="size-8 rounded-full bg-emerald-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{initials}</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}