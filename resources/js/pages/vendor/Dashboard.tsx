import VendorLayout from '../../layouts/app/VendorLayout';
import { Link } from '@inertiajs/react';
import { 
    DollarSign, 
    ShoppingCart, 
    Eye, 
    Star, 
    TrendingUp, 
    Package, 
    Users, 
    MessageSquare, 
    MapPin, 
    Clock, 
    CreditCard, 
    Settings, 
    CheckCircle, 
    AlertCircle,
    Store,
    Calendar,
    ArrowUp,
    ArrowDown,
    Plus
} from 'lucide-react';

interface DashboardStats {
    revenue: {
        current: number;
        previous: number;
        change: number;
    };
    orders: {
        today: number;
        yesterday: number;
        thisMonth: number;
        lastMonth: number;
        change: number;
    };
    rating: {
        current: number;
        change: number;
    };
    serviceAreas: number;
}

interface VendorStore {
    id: number;
    business_name: string;
    description: string;
    business_type: 'products' | 'services';
    setup_completed: boolean;
    is_active: boolean;
    products_services_count: number;
}

interface SetupProgress {
    businessProfile: boolean;
    serviceConfiguration: boolean;
    commissionAgreement: boolean;
    overallProgress: number;
}

interface RecentAppointment {
    id: number;
    status: string;
    created_at: string;
    customer: {
        name: string;
    };
    vendor_product_service: {
        name: string;
        vendor_store: {
            business_name: string;
        };
    };
}

interface PopularService {
    id: number;
    name: string;
    appointments_count: number;
    category: string;
    price_min: number;
    price_max: number;
}

interface Props {
    stats: DashboardStats;
    stores: VendorStore[];
    totalServices: number;
    recentAppointments: RecentAppointment[];
    setupProgress: SetupProgress;
    popularServices: PopularService[];
}

export default function Dashboard({ 
    stats, 
    stores, 
    totalServices, 
    recentAppointments, 
    setupProgress, 
    popularServices 
}: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatChange = (change: number, isPercentage: boolean = false) => {
        const prefix = change > 0 ? '+' : '';
        const suffix = isPercentage ? '%' : '';
        return `${prefix}${change}${suffix}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'confirmed':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'cancelled':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20 dark:text-slate-400';
        }
    };

    // Dashboard stats configuration
    const dashboardStats = [
        { 
            label: 'Monthly Revenue', 
            value: formatCurrency(stats.revenue.current), 
            change: formatChange(stats.revenue.change, true), 
            icon: <DollarSign size={24} />, 
            color: 'emerald',
            trend: stats.revenue.change >= 0 ? 'up' : 'down'
        },
        { 
            label: 'Orders Today', 
            value: stats.orders.today.toString(), 
            change: formatChange(stats.orders.change), 
            icon: <ShoppingCart size={24} />, 
            color: 'blue',
            trend: stats.orders.change >= 0 ? 'up' : 'down'
        },
        { 
            label: 'Average Rating', 
            value: stats.rating.current.toFixed(1), 
            change: formatChange(stats.rating.change, true), 
            icon: <Star size={24} />, 
            color: 'amber',
            trend: stats.rating.change >= 0 ? 'up' : 'down'
        },
        { 
            label: 'Service Areas', 
            value: stats.serviceAreas.toString(), 
            change: '', 
            icon: <MapPin size={24} />, 
            color: 'purple',
            trend: 'neutral'
        },
    ];

    // Setup progress steps
    const setupSteps = [
        { 
            title: 'Business Profile Setup', 
            completed: setupProgress.businessProfile, 
            items: ['Business Name', 'Address/Service Areas', 'Contact Info', 'Service Description & Logo'] 
        },
        { 
            title: 'Service Configuration', 
            completed: setupProgress.serviceConfiguration, 
            items: ['Service/Product Listings', 'Pricing Setup', 'Categories & Details', 'Service Options'] 
        },
        { 
            title: 'Store Activation', 
            completed: setupProgress.commissionAgreement, 
            items: ['Store Verification', 'Terms Agreement', 'Payment Setup'] 
        },
    ];

    // Quick action buttons
    const quickActions = [
        { 
            label: 'Manage Stores', 
            icon: <Store size={20} />, 
            href: route('vendor.store.index'), 
            color: 'emerald', 
            description: `${stores.length} store(s) configured` 
        },
        { 
            label: 'View Orders', 
            icon: <ShoppingCart size={20} />, 
            href: '/vendor/orders', 
            color: 'blue', 
            description: `${stats.orders.thisMonth} this month` 
        },
        { 
            label: 'Service Areas', 
            icon: <MapPin size={20} />, 
            href: '/vendor/areas', 
            color: 'purple', 
            description: `${stats.serviceAreas} areas covered` 
        },
        { 
            label: 'Analytics', 
            icon: <TrendingUp size={20} />, 
            href: '/vendor/analytics', 
            color: 'orange', 
            description: 'View detailed reports' 
        },
    ];

    return (
        <VendorLayout>
            {/* Dashboard Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Vendor Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Manage your business operations and track performance
                </p>
            </div>

            {/* Setup Progress */}
            {setupProgress.overallProgress < 100 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Setup Progress</h2>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {setupProgress.overallProgress}% Complete
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
                        <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${setupProgress.overallProgress}%` }}
                        ></div>
                    </div>
                    <div className="space-y-4">
                        {setupSteps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-4">
                                <div className={`mt-1 ${step.completed ? 'text-green-500' : 'text-slate-400'}`}>
                                    {step.completed ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-medium ${step.completed ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {step.title}
                                    </h3>
                                    <ul className="text-sm text-slate-600 dark:text-slate-400 mt-1 ml-4">
                                        {step.items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="list-disc">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dashboardStats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                                {stat.change && (
                                    <div className="flex items-center mt-1">
                                        {stat.trend === 'up' && <ArrowUp size={12} className="text-green-600 mr-1" />}
                                        {stat.trend === 'down' && <ArrowDown size={12} className="text-red-600 mr-1" />}
                                        <p className={`text-sm ${
                                            stat.trend === 'up' ? 'text-green-600' : 
                                            stat.trend === 'down' ? 'text-red-600' : 'text-slate-600'
                                        }`}>
                                            {stat.change} from last period
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className={`p-3 rounded-lg ${
                                stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                stat.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                stat.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Recent Appointments */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
                        <Link 
                            href="/vendor/orders"
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                            View All
                        </Link>
                    </div>
                    {recentAppointments.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="mx-auto text-slate-400 mb-3" size={32} />
                            <p className="text-slate-600 dark:text-slate-400">No recent orders</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentAppointments.map((appointment) => (
                                <div key={appointment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {appointment.vendor_product_service.name}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {appointment.customer.name} • {appointment.vendor_product_service.vendor_store.business_name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </span>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {new Date(appointment.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Popular Services */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Popular Services</h2>
                        <Link 
                            href="/vendor/products"
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                            Manage
                        </Link>
                    </div>
                    {popularServices.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="mx-auto text-slate-400 mb-3" size={32} />
                            <p className="text-slate-600 dark:text-slate-400 mb-4">No services yet</p>
                            <Link
                                href={route('vendor.store.create')}
                                className="inline-flex items-center px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                            >
                                <Plus size={16} className="mr-1" />
                                Add Services
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {popularServices.map((service) => (
                                <div key={service.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {service.name}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {service.category} • {formatCurrency(service.price_min)} - {formatCurrency(service.price_max)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {service.appointments_count} orders
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action, index) => (
                    <Link
                        key={index}
                        href={action.href}
                        className={`p-4 rounded-xl border-2 border-dashed transition-all hover:border-solid hover:shadow-md ${
                            action.color === 'emerald' ? 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' :
                            action.color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' :
                            action.color === 'purple' ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20' :
                            'border-orange-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}
                    >
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                                action.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                action.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                action.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                                {action.icon}
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-white">{action.label}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{action.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Store Status Overview */}
            {stores.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Stores</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stores.map((store) => (
                            <div key={store.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        {store.business_name}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        store.is_active && store.setup_completed 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    }`}>
                                        {store.is_active && store.setup_completed ? 'Active' : 'Setup Required'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    {store.business_type.charAt(0).toUpperCase() + store.business_type.slice(1)}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {store.products_services_count} services/products
                                </p>
                                <div className="mt-3 flex space-x-2">
                                    <Link
                                        href={route('vendor.store.show', store.id)}
                                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors text-center"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={route('vendor.store.edit', store.id)}
                                        className="flex-1 px-3 py-2 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 transition-colors text-center"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </VendorLayout>
    );
}