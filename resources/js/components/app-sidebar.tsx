import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { APP } from '@/lib/constants';
import { dashboard } from '@/routes';
import feeStructureRoutes from '@/routes/academics/fee-structures';
import gradeLevelRoutes from '@/routes/academics/grade-levels';
import { index as paymentsIndex } from '@/routes/payments';
import { index as studentsIndex } from '@/routes/students';
import { type NavGroup, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CreditCard, Folder, GraduationCap, LayoutGrid, Receipt, Users } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

/**
 * Footer navigation items
 *
 * Links shown at the bottom of the sidebar.
 */
const footerNavItems: NavItem[] = [
    {
        title: 'GitHub',
        href: APP.GITHUB_URL,
        icon: Folder,
    },
];

/**
 * Application Sidebar Component
 *
 * Main navigation sidebar with role-based menu items.
 *
 * Features:
 * - Collapsible design with icon-only mode
 * - Role-based access control (admin-only sections)
 * - User profile menu at bottom
 * - GitHub link in footer
 *
 * @remarks
 * Navigation items are generated dynamically based on user role.
 * Admin users see additional "Academics" section with grade levels and fee structures.
 *
 * @component
 */
export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth?.user?.role === 'admin';

    /**
     * Generate navigation groups based on user role
     *
     * Memoized to prevent unnecessary recalculation on re-renders.
     */
    const mainNavGroups = useMemo<NavGroup[]>(() => {
        // Core platform navigation (available to all users)
        const platformItems: NavItem[] = [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Students',
                href: studentsIndex(),
                icon: Users,
            },
            {
                title: 'Payments',
                href: paymentsIndex(),
                icon: CreditCard,
            },
        ];

        const groups: NavGroup[] = [
            {
                title: 'Platform',
                items: platformItems,
            },
        ];

        // Admin-only: Academic management section
        if (isAdmin) {
            groups.push({
                title: 'Academics',
                items: [
                    {
                        title: 'Grade levels',
                        href: gradeLevelRoutes.index(),
                        icon: GraduationCap,
                    },
                    {
                        title: 'Fee structures',
                        href: feeStructureRoutes.index(),
                        icon: Receipt,
                    },
                ],
            });
        }

        return groups;
    }, [isAdmin]);

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
                <NavMain groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
