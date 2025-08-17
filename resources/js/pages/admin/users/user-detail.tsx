import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/app/AdminLayout';
import { 
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Shield,
    Star,
    Package,
    ShoppingBag,
    Truck,
    DollarSign,
    Clock,
    Store,
    Users,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    FileText,
    History
} from 'lucide-react';

interface UserDetailProps {
    user: any;
    userType: string;
    additionalData: any;
}

export default function UserDetail({ user, userType, additionalData }: UserDetailProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string | boolean, type: 'activation' | 'verification' | 'general' = 'general') => {
        let colorClass = '';
        let icon = null;
        let text = '';

        if (type === 'activation') {
            colorClass = status ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            icon = status ? <CheckCircle size={12} /> : <XCircle size={12} />;
            text = status ? 'Active' : 'Inactive';
        } else if (type === 'verification') {
            colorClass = status ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            icon = status ? <Shield size={12} /> : <AlertCircle size={12} />;
            text = status ? 'Verified' : 'Unverified';
        } else {
            colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            text = status.toString();
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {icon && <span className="mr-1">{icon}</span>}
                {text}
            </span>
        );
    };

    const getRoleIcon = () => {
        switch (userType) {
            case 'customer':
                return <Users className="w-8 h-8 text-blue-600" />;
            case 'vendor':
                return <Store className="w-8 h-8 text-purple-600" />;
            case 'rider':
                return <Truck className="w-8 h-8 text-green-600" />;
            default:
                return <User className="w-8 h-8 text-gray-600" />;
        }
    };

    const getBackUrl = () => {
        switch (userType) {
            case 'customer':
                return '/admin/manage-customers';
            case 'vendor':
                return '/admin/manage-vendors';
            case 'rider':
                return '/admin/manage-riders';
            default:
                return '/admin/users';
        }
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400 capitalize">{userType}</p>
                        <div className="flex items-center space-x-2 mt-2">
                            {getStatusBadge(user.is_activated, 'activation')}
                            {userType === 'rider' && user.is_verified !== undefined && 
                                getStatusBadge(user.is_verified, 'verification')
                            }
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        {getRoleIcon()}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <Mail size={16} className="text-gray-400 mr-3" />
                            <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="flex items-center">
                                <Phone size={16} className="text-gray-400 mr-3" />
                                <span className="text-sm text-gray-900 dark:text-white">{user.phone}</span>
                            </div>
                        )}
                        {(user.address || additionalData.vendor_store?.address) && (
                            <div className="flex items-center">
                                <MapPin size={16} className="text-gray-400 mr-3" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {user.address || additionalData.vendor_store?.address}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-3" />
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Joined</span>
                                <div className="text-sm text-gray-900 dark:text-white">
                                    {formatDate(user.created_at)}
                                </div>
                            </div>
                        </div>
                        {userType === 'rider' && user.rating && (
                            <div className="flex items-center">
                                <Star size={16} className="text-yellow-400 mr-3" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {user.rating.toFixed(1)} Rating
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vendor Store Info */}
                {userType === 'vendor' && additionalData.vendor_store && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Business Name</label>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {additionalData.vendor_store.business_name}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Business Type</label>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {additionalData.vendor_store.business_type || 'Not specified'}
                                </p>
                            </div>
                            {additionalData.vendor_store.description && (
                                <div className="md:col-span-2">
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Description</label>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {additionalData.vendor_store.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Rider Info */}
                {userType === 'rider' && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rider Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Rider ID</label>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.rider_id}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">License Number</label>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.license_number || 'Not provided'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Vehicle Type</label>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.vehicle_type || 'Not specified'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400">Current Status</label>
                                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                    {user.status}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                <div className="space-y-4">
                    {userType === 'customer' && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Calendar size={16} className="text-blue-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Appointments</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {additionalData.total_appointments || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <ShoppingBag size={16} className="text-green-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Orders</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {additionalData.total_orders || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <DollarSign size={16} className="text-purple-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Spent</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(additionalData.total_spent || 0)}
                                </span>
                            </div>
                        </>
                    )}

                    {userType === 'vendor' && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Package size={16} className="text-blue-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Orders</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {additionalData.total_orders || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <TrendingUp size={16} className="text-green-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(additionalData.total_revenue || 0)}
                                </span>
                            </div>
                        </>
                    )}

                    {userType === 'rider' && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Truck size={16} className="text-blue-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Deliveries</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {additionalData.total_deliveries || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <DollarSign size={16} className="text-green-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Earnings</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(additionalData.total_earnings || 0)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Star size={16} className="text-yellow-500 mr-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {user.rating?.toFixed(1) || '0.0'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-6">
            {/* Customer History */}
            {userType === 'customer' && (
                <>
                    {/* Appointment History */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Appointments
                            </h3>
                        </div>
                        <div className="p-6">
                            {additionalData.appointment_history?.length > 0 ? (
                                <div className="space-y-4">
                                    {additionalData.appointment_history.map((appointment: any, index: number) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {appointment.service_type || 'Appointment'}
                                                </h4>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(appointment.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                Vendor: {appointment.vendor_store?.business_name || 'N/A'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Status: {appointment.status || 'Pending'}
                                                </span>
                                                {appointment.appointment_date && (
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        Date: {formatDate(appointment.appointment_date)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No appointment history found
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Orders
                            </h3>
                        </div>
                        <div className="p-6">
                            {additionalData.order_history?.length > 0 ? (
                                <div className="space-y-4">
                                    {additionalData.order_history.map((order: any, index: number) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    Order #{order.id}
                                                </h4>
                                                <span className="font-bold text-green-600">
                                                    {formatCurrency(order.total_amount)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                Vendor: {order.vendor_store?.business_name || 'N/A'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Status: {order.status || 'Pending'}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {formatDate(order.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No order history found
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Vendor History */}
            {userType === 'vendor' && (
                <>
                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Orders Received
                            </h3>
                        </div>
                        <div className="p-6">
                            {additionalData.recent_orders?.length > 0 ? (
                                <div className="space-y-4">
                                    {additionalData.recent_orders.map((order: any, index: number) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    Order #{order.id}
                                                </h4>
                                                <span className="font-bold text-green-600">
                                                    {formatCurrency(order.total_amount)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                Customer: {order.user?.name || 'N/A'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Status: {order.status || 'Pending'}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {formatDate(order.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No recent orders found
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Appointments Received */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Appointments
                            </h3>
                        </div>
                        <div className="p-6">
                            {additionalData.appointments_received?.length > 0 ? (
                                <div className="space-y-4">
                                    {additionalData.appointments_received.map((appointment: any, index: number) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {appointment.service_type || 'Appointment'}
                                                </h4>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(appointment.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                Customer: {appointment.user?.name || 'N/A'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Status: {appointment.status || 'Pending'}
                                                </span>
                                                {appointment.appointment_date && (
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        Date: {formatDate(appointment.appointment_date)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No recent appointments found
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Rider History */}
            {userType === 'rider' && (
                <>
                    {/* Recent Deliveries */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Deliveries
                            </h3>
                        </div>
                        <div className="p-6">
                            {additionalData.recent_deliveries?.length > 0 ? (
                                <div className="space-y-4">
                                    {additionalData.recent_deliveries.map((delivery: any, index: number) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    Delivery #{delivery.id}
                                                </h4>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(delivery.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                Order: {delivery.order?.id || 'N/A'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Status: {delivery.status || 'Pending'}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {delivery.pickup_address || 'N/A'} → {delivery.delivery_address || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No recent deliveries found
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Earnings History */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Earnings
                            </h3>
                        </div>
                        <div className="p-6">
                            {additionalData.earnings_history?.length > 0 ? (
                                <div className="space-y-4">
                                    {additionalData.earnings_history.map((earning: any, index: number) => (
                                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {earning.earning_type || 'Delivery'}
                                                </h4>
                                                <span className="font-bold text-green-600">
                                                    {formatCurrency(earning.amount)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {earning.description || 'Delivery earning'}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {formatDate(earning.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                    No earnings history found
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <AdminLayout>
            <Head title={`${user.name} - ${userType.charAt(0).toUpperCase() + userType.slice(1)} Details`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={getBackUrl()}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {user.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 capitalize">
                                {userType} Details
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <Eye size={16} className="mr-2" />
                                Overview
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'history'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <History size={16} className="mr-2" />
                                History
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'history' && renderHistory()}
            </div>
        </AdminLayout>
    );
}
