import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid, BookOpen, CalendarDays, CheckSquare,
    BarChart2, CreditCard, GraduationCap, Users,
    ShieldCheck, Ticket, FileText, DollarSign
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar, SidebarContent, SidebarFooter,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const roles: string[] = auth?.user?.roles ?? [];

    const isStudent  = roles.includes('student');
    const isTutor    = roles.includes('tutor');
    const isAdmin    = roles.includes('admin') || roles.includes('super-admin');
    const isParent   = roles.includes('parent');

    const studentNav: NavItem[] = [
        { title: 'Dashboard',        href: dashboard(),      icon: LayoutGrid   },
        { title: 'Browse Courses',   href: '/courses',       icon: BookOpen     },
        { title: 'My Bookings',      href: '/bookings',      icon: CalendarDays },
        { title: 'Attendance',       href: '/attendance',    icon: CheckSquare  },
        { title: 'Progress Reports', href: '/my-progress',   icon: BarChart2    },
        { title: 'Payments',         href: '/my-payments',   icon: CreditCard   },
    ];

    const tutorNav: NavItem[] = [
        { title: 'Dashboard',        href: dashboard(),          icon: LayoutGrid   },
        { title: 'My Courses',       href: '/courses',           icon: BookOpen     },
        { title: 'Bookings',         href: '/tutor/bookings',    icon: CalendarDays },
        { title: 'Schedules',        href: '/schedules',         icon: CalendarDays },
        { title: 'Progress Reports', href: '/progress-reports',  icon: FileText     },
        { title: 'Earnings',         href: '/my-payments',       icon: DollarSign   },
    ];

    const adminNav: NavItem[] = [
        { title: 'Dashboard',          href: dashboard(),           icon: LayoutGrid  },
        { title: 'Tutor Verification', href: '/admin/tutors',       icon: ShieldCheck },
        { title: 'Vouchers',           href: '/admin/vouchers',     icon: Ticket      },
        { title: 'Courses',            href: '/courses',            icon: BookOpen    },
    ];

    const parentNav: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    ];

    const navItems = isAdmin ? adminNav
        : isTutor   ? tutorNav
        : isStudent  ? studentNav
        : isParent   ? parentNav
        : [{ title: 'Dashboard', href: dashboard(), icon: LayoutGrid }];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}