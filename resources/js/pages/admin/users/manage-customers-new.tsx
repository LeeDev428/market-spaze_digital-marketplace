import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/app/AdminLayout';
import { 
    Users, 
    Search, 
    Eye, 
    UserCheck, 
    UserX, 
    Mail,
    Phone,
    Calendar,
    MapPin,
    ShoppingBag,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: 'customer';
    is_activated: boolean;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    appointments?: any[];
    orders?: any[];
    orders_count?: number;
    appointments_count?: number;
}

interface Props {
    customers: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url?: string;
        next_page_url?: string;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function ManageCustomers({ customers, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        router.get('/admin/manage-customers', {
            search: searchTerm,
            status: selectedStatus,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        router.get('/admin/manage-customers', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const toggleUserStatus = (userId: number, currentStatus: boolean) => {
        router.post('/admin/users/toggle-activation', {
            user_type: 'user',
            user_id: userId,
            is_activated: !currentStatus
        }, {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const getStatusBadge = (isActive: boolean) => {
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
                {isActive ? (
                    <>
                        <UserCheck size={12} className="mr-1" />
                        Active
                    </>
                ) : (
                    <>
                        <UserX size={12} className="mr-1" />
                        Inactive
                    </>
                )}
            </span>
        );
    };

    const handlePagination = (url: string) => {
        setLoading(true);
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    return (
        <AdminLayout>
            <Head title="Manage Customers" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Manage Customers
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View and manage all customer accounts
                        </p>
                    </div>
                    
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Back to User Management
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search Customers
                            </label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={loading}
                                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                                        loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                disabled={loading}
                                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-end space-x-2">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Search
                            </button>
                            <button
                                onClick={clearFilters}
                                disabled={loading}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Customers ({customers.total} total)
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {customers.data?.map((customer: User) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-medium text-lg">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Customer ID: #{customer.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div className="space-y-1">
                                                <div className="flex items-center">
                                                    <Mail size={12} className="mr-2 text-gray-400" />
                                                    <span className="text-xs">{customer.email}</span>
                                                </div>
                                                {customer.phone && (
                                                    <div className="flex items-center">
                                                        <Phone size={12} className="mr-2 text-gray-400" />
                                                        <span className="text-xs">{customer.phone}</span>
                                                    </div>
                                                )}
                                                {customer.address && (
                                                    <div className="flex items-center">
                                                        <MapPin size={12} className="mr-2 text-gray-400" />
                                                        <span className="text-xs truncate max-w-xs">{customer.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center">
                                                        <ShoppingBag size={12} className="mr-1 text-gray-400" />
                                                        <span className="text-xs">{customer.orders_count || 0} orders</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock size={12} className="mr-1 text-gray-400" />
                                                        <span className="text-xs">{customer.appointments_count || 0} appointments</span>
                                                    </div>
                                                </div>
                                                {customer.email_verified_at && (
                                                    <div className="text-xs text-green-600 dark:text-green-400">
                                                        Email verified
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(customer.is_activated)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <Calendar size={12} className="mr-1" />
                                                {new Date(customer.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/users/user/${customer.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => toggleUserStatus(customer.id, customer.is_activated)}
                                                    className={`${
                                                        customer.is_activated 
                                                            ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' 
                                                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                    }`}
                                                    title={customer.is_activated ? 'Deactivate Customer' : 'Activate Customer'}
                                                >
                                                    {customer.is_activated ? <UserX size={16} /> : <UserCheck size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                        <div className="flex justify-between flex-1 sm:hidden">
                            <button
                                onClick={() => customers.prev_page_url && handlePagination(customers.prev_page_url)}
                                disabled={!customers.prev_page_url || loading}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => customers.next_page_url && handlePagination(customers.next_page_url)}
                                disabled={!customers.next_page_url || loading}
                                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing page <span className="font-medium">{customers.current_page}</span> of{' '}
                                    <span className="font-medium">{customers.last_page}</span> for customers
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => customers.prev_page_url && handlePagination(customers.prev_page_url)}
                                        disabled={!customers.prev_page_url || loading}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                                        {customers.current_page} / {customers.last_page}
                                    </span>
                                    <button
                                        onClick={() => customers.next_page_url && handlePagination(customers.next_page_url)}
                                        disabled={!customers.next_page_url || loading}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
