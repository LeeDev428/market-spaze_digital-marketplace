import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    ShoppingBag, 
    Calendar, 
    Star, 
    Clock, 
    MapPin, 
    TrendingUp,
    Heart,
    Package,
    CreditCard,
    Bell
} from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
    stats: {
        totalAppointments: number;
        activeAppointments: number;
        completedAppointments: number;
        totalSpent: number;
        favoriteStores: number;
        upcomingAppointments: number;
    };
    recentOrders: Array<{
        id: number;
        store_name: string;
        service_name: string;
        amount: number;
        status: string;
        created_at: string;
    }>;
    upcomingAppointments: Array<{
        id: number;
        store_name: string;
        service_name: string;
        appointment_date: string;
        appointment_time: string;
        status: string;
    }>;
    favoriteStores: Array<{
        id: number;
        name: string;
        category: string;
        rating: number;
        location: string;
        logo?: string;
    }>;
    notifications: Array<{
        id: number;
        title: string;
        message: string;
        type: string;
        created_at: string;
        read: boolean;
    }>;
}

export default function Dashboard({ 
    user, 
    stats, 
    recentOrders = [], 
    upcomingAppointments = [], 
    favoriteStores = [],
    notifications = []
}: DashboardProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
                            <p className="text-orange-100">Discover amazing services and manage your appointments</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/20 rounded-lg p-4">
                                <TrendingUp className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.activeAppointments || 0} active appointments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats?.totalSpent || 0)}</div>
                            <p className="text-xs text-muted-foreground">
                                Lifetime spending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.upcomingAppointments || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Next 7 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Favorite Stores</CardTitle>
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.favoriteStores || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Saved stores
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Appointments (shown as orders) */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Bookings</CardTitle>
                                    <CardDescription>Your latest service appointments</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/appointments">View All</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Same content structure as before */}
                            <div className="space-y-4">
                                {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
                                                <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{order.service_name}</p>
                                                <p className="text-sm text-muted-foreground">{order.store_name}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(order.amount)}</p>
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No appointments yet</p>
                                        <Button className="mt-4" asChild>
                                            <Link href="/stores">Browse Services</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications - same as before */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>Recent updates</CardDescription>
                                </div>
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notifications.length > 0 ? notifications.slice(0, 4).map((notification) => (
                                    <div key={notification.id} className={`p-3 rounded-lg border ${!notification.read ? 'bg-blue-50 dark:bg-blue-950' : ''}`}>
                                        <p className="font-medium text-sm">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.created_at)}</p>
                                    </div>
                                )) : (
                                    <div className="text-center py-4">
                                        <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No notifications</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Appointments & Favorite Stores */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Appointments */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Upcoming Appointments</CardTitle>
                                    <CardDescription>Your scheduled services</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/appointments">View All</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingAppointments.length > 0 ? upcomingAppointments.slice(0, 3).map((appointment) => (
                                    <div key={appointment.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{appointment.service_name}</p>
                                            <p className="text-sm text-muted-foreground">{appointment.store_name}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                                                </p>
                                                <Badge className={getStatusColor(appointment.status)}>
                                                    {appointment.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No upcoming appointments</p>
                                        <Button className="mt-4" asChild>
                                            <Link href="/stores">Book a Service</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Favorite Stores */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Favorite Stores</CardTitle>
                                    <CardDescription>Your saved stores</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/favorites">View All</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {favoriteStores.length > 0 ? favoriteStores.slice(0, 3).map((store) => (
                                    <div key={store.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                                        <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
                                            <Heart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{store.name}</p>
                                            <p className="text-sm text-muted-foreground">{store.category}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <div className="flex items-center">
                                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                                    <span className="text-xs text-muted-foreground ml-1">{store.rating}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <div className="flex items-center">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground ml-1">{store.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No favorite stores yet</p>
                                        <Button className="mt-4" asChild>
                                            <Link href="/stores">Explore Stores</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>What would you like to do today?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                                <Link href="/stores">
                                    <ShoppingBag className="h-6 w-6" />
                                    <span className="text-sm">Browse Services</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                                <Link href="/appointments/create">
                                    <Calendar className="h-6 w-6" />
                                    <span className="text-sm">Book Appointment</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                                <Link href="/orders">
                                    <Package className="h-6 w-6" />
                                    <span className="text-sm">Track Orders</span>
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                                <Link href="/profile">
                                    <Bell className="h-6 w-6" />
                                    <span className="text-sm">Manage Profile</span>
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}