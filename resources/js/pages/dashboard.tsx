import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BanknoteIcon, CreditCardIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Dashboard Page
 *
 * Displays comprehensive analytics and insights for the school cashier system.
 * Shows real-time statistics, trends, and visualizations of payments, students,
 * and financial data.
 *
 * @component
 *
 * @features
 * - Real-time statistics (students, daily/monthly/yearly payments)
 * - 7-day payment trend with area chart
 * - Monthly payment trend with bar chart
 * - Payment method distribution (pie chart)
 * - Payment purpose breakdown (pie chart)
 * - Recent payment transactions table
 * - Role-based access control (all authenticated users)
 *
 * @remarks
 * - All monetary values formatted as Philippine Peso (PHP)
 * - Charts use responsive Recharts library with custom theme colors
 * - Statistics calculated server-side in DashboardController
 * - Data automatically refreshed on navigation
 *
 * @example
 * // Accessed via root route
 * router.visit(dashboard())
 *
 * @see {@link AppLayout} for shared layout structure
 * @see {@link DashboardController} for statistics calculation
 */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

/**
 * Props for the Dashboard component
 *
 * @interface DashboardProps
 * @property {Object} statistics - Aggregated statistics and analytics data
 * @property {Object} statistics.students - Student enrollment counts
 * @property {number} statistics.students.total - Total number of students
 * @property {number} statistics.students.active - Number of active students
 * @property {Object} statistics.payments - Payment financial data
 * @property {number} statistics.payments.today - Total amount collected today
 * @property {number} statistics.payments.todayCount - Number of payments today
 * @property {number} statistics.payments.monthly - Total amount collected this month
 * @property {number} statistics.payments.yearly - Total amount collected this year
 * @property {Array} statistics.last7Days - Daily payment data for the last 7 days
 * @property {Array} statistics.monthlyTrend - Monthly payment data for trend analysis
 * @property {Array} statistics.paymentMethods - Distribution of payment methods used
 * @property {Array} statistics.paymentPurposes - Distribution of payment purposes
 * @property {Array} statistics.recentPayments - Latest payment transactions
 */
interface DashboardProps {
    statistics: {
        students: {
            total: number;
            active: number;
        };
        payments: {
            today: number;
            todayCount: number;
            monthly: number;
            yearly: number;
        };
        last7Days: Array<{
            date: string;
            amount: number;
            count: number;
        }>;
        monthlyTrend: Array<{
            month: string;
            amount: number;
            count: number;
        }>;
        paymentMethods: Array<{
            method: string;
            count: number;
            total: number;
        }>;
        paymentPurposes: Array<{
            purpose: string;
            count: number;
            total: number;
        }>;
        recentPayments: Array<{
            id: number;
            receipt_number: string;
            student_name: string;
            amount: number;
            payment_date: string;
            payment_purpose: string;
        }>;
    };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function Dashboard({ statistics }: DashboardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(value);
    };

    const chartConfig = {
        amount: {
            label: 'Amount',
            color: 'hsl(var(--chart-1))',
        },
        count: {
            label: 'Transactions',
            color: 'hsl(var(--chart-2))',
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Today's Collections */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Collections</CardTitle>
                            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(statistics.payments.today)}</div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.payments.todayCount} transaction
                                {statistics.payments.todayCount !== 1 ? 's' : ''} today
                            </p>
                        </CardContent>
                    </Card>

                    {/* Monthly Collections */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(statistics.payments.monthly)}</div>
                            <p className="text-xs text-muted-foreground">Monthly collections</p>
                        </CardContent>
                    </Card>

                    {/* Yearly Collections */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Year to Date</CardTitle>
                            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(statistics.payments.yearly)}</div>
                            <p className="text-xs text-muted-foreground">Total this year</p>
                        </CardContent>
                    </Card>

                    {/* Active Students */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.students.active}</div>
                            <p className="text-xs text-muted-foreground">of {statistics.students.total} total students</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Last 7 Days Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Last 7 Days Collections</CardTitle>
                            <CardDescription>Daily payment amounts and transaction count</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <AreaChart data={statistics.last7Days}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip
                                        formatter={(value: any, name: any) =>
                                            name === 'amount' ? [formatCurrency(Number(value)), 'Amount'] : [`${value} txns`, 'Transactions']
                                        }
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Monthly Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle>6-Month Trend</CardTitle>
                            <CardDescription>Monthly collections overview</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart data={statistics.monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip
                                        formatter={(value: any, name: any) =>
                                            name === 'amount' ? [formatCurrency(Number(value)), 'Amount'] : [`${value} txns`, 'Transactions']
                                        }
                                    />
                                    <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Distribution Row */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Payment Methods */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>Distribution by payment method this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <PieChart>
                                    <Pie
                                        data={statistics.paymentMethods}
                                        dataKey="total"
                                        nameKey="method"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={(entry: any) => `${entry.method}: ${formatCurrency(entry.total)}`}
                                    >
                                        {statistics.paymentMethods.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Total']} />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Payment Purposes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Payment Purposes</CardTitle>
                            <CardDescription>Most common payment types this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart data={statistics.paymentPurposes} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" fontSize={12} />
                                    <YAxis dataKey="purpose" type="category" width={100} fontSize={12} />
                                    <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Total']} />
                                    <Bar dataKey="total" fill="#ec4899" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                        <CardDescription>Latest payment transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-4 py-2 text-left font-medium">Receipt #</th>
                                        <th className="px-4 py-2 text-left font-medium">Student</th>
                                        <th className="px-4 py-2 text-left font-medium">Purpose</th>
                                        <th className="px-4 py-2 text-left font-medium">Date</th>
                                        <th className="px-4 py-2 text-right font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statistics.recentPayments.map((payment) => (
                                        <tr key={payment.id} className="border-b last:border-0">
                                            <td className="px-4 py-3 font-mono text-xs">{payment.receipt_number}</td>
                                            <td className="px-4 py-3">{payment.student_name}</td>
                                            <td className="px-4 py-3">{payment.payment_purpose}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{payment.payment_date}</td>
                                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(payment.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {statistics.recentPayments.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">No recent payments</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
