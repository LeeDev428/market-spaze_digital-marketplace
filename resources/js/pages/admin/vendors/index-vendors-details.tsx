import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/app/AdminLayout';
import { 
    Store, 
    ArrowLeft,
    Eye, 
    ToggleLeft,
    ToggleRight,
    Mail,
    Phone,
    Calendar,
    MapPin,
    ShoppingBag,
    Package,
    ChevronLeft,
    ChevronRight,
    Building,
    Users,
    DollarSign,
    Clock,
    TrendingUp,
    Activity,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Star,
    User
} from 'lucide-react';

interface VendorStore {
    id: number;
    business_name: string;
    email: string;
    phone?: string;
    address?: string;
    business_type: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    appointments: Appointment[];
    orders: Order[];
    products_services: ProductService[];
}

interface Appointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    status: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    vendor_product_service?: {
        id: number;
        name: string;
        price: number;
    };
}

interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    order_items: OrderItem[];
}

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    product_name?: string;
}

interface ProductService {
    id: number;
    name: string;
    price: number;
    type: string;
    is_active: boolean;
    created_at: string;
}

interface AppointmentStats {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}

interface OrderStats {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
}

interface Props {
    vendorStore: VendorStore;
    appointmentStats: AppointmentStats;
    orderStats: OrderStats;
    recentAppointments: {
        data: Appointment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url?: string;
        next_page_url?: string;
    };
    totalRevenue: number;
    monthlyRevenue: number;
}

export default function IndexVendorsDetails({ 
    vendorStore, 
    appointmentStats, 
    orderStats, 
    recentAppointments,
    totalRevenue,
    monthlyRevenue 
}: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    const toggleStoreStatus = () => {
        router.post(`/admin/vendor-stores/${vendorStore.id}/toggle-status`, {}, {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const getStatusBadge = (status: string, type: 'appointment' | 'order' = 'appointment') => {
        const appointmentColors: { [key: string]: string } = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };

        const orderColors: { [key: string]: string } = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };

        const colors = type === 'appointment' ? appointmentColors : orderColors;
        const colorClass = colors[status] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const handleAppointmentsPagination = (url: string) => {
        setLoading(true);
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    return (
        <AdminLayout>
            <Head title={`${vendorStore.business_name} - Vendor Store Details`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/admin/vendor-stores"
                            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <ArrowLeft size={20} className="mr-1" />
                            Back to Vendor Stores
                        </Link>
                    </div>
                    
                    <button
                        onClick={toggleStoreStatus}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            vendorStore.is_active 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        {vendorStore.is_active ? (
                            <>
                                <ToggleLeft size={16} className="mr-2" />
                                Deactivate Store
                            </>
                        ) : (
                            <>
                                <ToggleRight size={16} className="mr-2" />
                                Activate Store
                            </>
                        )}
                    </button>
                </div>

                {/* Store Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-2xl">
                                {vendorStore.business_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {vendorStore.business_name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Store ID: #{vendorStore.id}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        vendorStore.is_active 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                        {vendorStore.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        <Building size={10} className="mr-1" />
                                        {vendorStore.business_type.charAt(0).toUpperCase() + vendorStore.business_type.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Created on {new Date(vendorStore.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                Owner: {vendorStore.user.name}
                            </div>
                        </div>
                    </div>
                    
                    {vendorStore.description && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-gray-700 dark:text-gray-300">{vendorStore.description}</p>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointments</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{appointmentStats.total}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{orderStats.total}</p>
                            </div>
                            <Package className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">${monthlyRevenue.toLocaleString()}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'overview', label: 'Overview', icon: Activity },
                                { id: 'appointments', label: 'Appointments', icon: Clock },
                                { id: 'orders', label: 'Orders', icon: Package },
                                { id: 'contact', label: 'Contact Info', icon: User },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <tab.icon size={16} className="mr-2" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Appointment Stats */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appointment Statistics</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{appointmentStats.total}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                                        </div>
                                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{appointmentStats.pending}</div>
                                            <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{appointmentStats.confirmed}</div>
                                            <div className="text-sm text-blue-600 dark:text-blue-400">Confirmed</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{appointmentStats.completed}</div>
                                            <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                                        </div>
                                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-red-800 dark:text-red-200">{appointmentStats.cancelled}</div>
                                            <div className="text-sm text-red-600 dark:text-red-400">Cancelled</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Stats */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Statistics</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{orderStats.total}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                                        </div>
                                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{orderStats.pending}</div>
                                            <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{orderStats.processing}</div>
                                            <div className="text-sm text-blue-600 dark:text-blue-400">Processing</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{orderStats.delivered}</div>
                                            <div className="text-sm text-green-600 dark:text-green-400">Delivered</div>
                                        </div>
                                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-red-800 dark:text-red-200">{orderStats.cancelled}</div>
                                            <div className="text-sm text-red-600 dark:text-red-400">Cancelled</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appointments Tab */}
                        {activeTab === 'appointments' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Appointments</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Service</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date & Time</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {recentAppointments.data.map((appointment) => (
                                                <tr key={appointment.id}>
                                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                        <div>
                                                            <div className="font-medium">{appointment.user.name}</div>
                                                            <div className="text-xs text-gray-500">{appointment.user.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                        {appointment.vendor_product_service ? (
                                                            <div>
                                                                <div className="font-medium">{appointment.vendor_product_service.name}</div>
                                                                <div className="text-xs text-gray-500">${appointment.vendor_product_service.price}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-500">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                        <div>
                                                            <div>{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                                                            <div className="text-xs text-gray-500">{appointment.appointment_time}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {getStatusBadge(appointment.status, 'appointment')}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(appointment.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Appointments Pagination */}
                                {recentAppointments.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Showing page {recentAppointments.current_page} of {recentAppointments.last_page}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => recentAppointments.prev_page_url && handleAppointmentsPagination(recentAppointments.prev_page_url)}
                                                disabled={!recentAppointments.prev_page_url || loading}
                                                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => recentAppointments.next_page_url && handleAppointmentsPagination(recentAppointments.next_page_url)}
                                                disabled={!recentAppointments.next_page_url || loading}
                                                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {vendorStore.orders?.slice(0, 10).map((order) => (
                                                <tr key={order.id}>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">#{order.id}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                        <div>
                                                            <div className="font-medium">{order.user.name}</div>
                                                            <div className="text-xs text-gray-500">{order.user.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                                                        {order.order_items?.length || 0} items
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                        ${order.total_amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {getStatusBadge(order.status, 'order')}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Contact Info Tab */}
                        {activeTab === 'contact' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Store Contact */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Store Contact Information</h3>
                                        <div className="space-y-3">
                                            {vendorStore.email && (
                                                <div className="flex items-center">
                                                    <Mail size={16} className="mr-3 text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white">{vendorStore.email}</span>
                                                </div>
                                            )}
                                            {vendorStore.phone && (
                                                <div className="flex items-center">
                                                    <Phone size={16} className="mr-3 text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white">{vendorStore.phone}</span>
                                                </div>
                                            )}
                                            {vendorStore.address && (
                                                <div className="flex items-start">
                                                    <MapPin size={16} className="mr-3 text-gray-400 mt-0.5" />
                                                    <span className="text-sm text-gray-900 dark:text-white">{vendorStore.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Owner Contact */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Owner Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <User size={16} className="mr-3 text-gray-400" />
                                                <span className="text-sm text-gray-900 dark:text-white">{vendorStore.user.name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Mail size={16} className="mr-3 text-gray-400" />
                                                <span className="text-sm text-gray-900 dark:text-white">{vendorStore.user.email}</span>
                                            </div>
                                            {vendorStore.user.phone && (
                                                <div className="flex items-center">
                                                    <Phone size={16} className="mr-3 text-gray-400" />
                                                    <span className="text-sm text-gray-900 dark:text-white">{vendorStore.user.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
