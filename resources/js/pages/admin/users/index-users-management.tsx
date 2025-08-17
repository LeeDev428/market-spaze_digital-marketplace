import React, { useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/app/AdminLayout';
import { 
    Users, 
    Search, 
    Filter, 
    Eye, 
    Edit, 
    Trash2, 
    UserCheck, 
    UserX, 
    Plus,
    Download,
    Mail,
    Phone,
    Calendar,
    Shield,
    Store,
    Bike,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'customer' | 'vendor' | 'rider' | 'admin';
    is_activated: boolean;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    vendorStore?: VendorStore;
    appointments_count?: number;
    orders_count?: number;
}

interface Rider {
    id: number;
    name: string;
    email: string;
    phone?: string;
    rider_id: string;
    license_number?: string;
    vehicle_type?: string;
    status?: string;
    is_activated: boolean;
    is_verified: boolean;
    rating: number;
    total_deliveries: number;
    created_at: string;
    deliveries_count?: number;
    rider_earnings_count?: number;
}

interface VendorStore {
    id: number;
    business_name: string;
    email: string;
    phone?: string;
    address?: string;
    is_active: boolean;
    user: User;
}

interface Stats {
    total_users: number;
    total_customers: number;
    total_vendors: number;
    total_riders: number;
    active_users: number;
    inactive_users: number;
    active_riders: number;
    inactive_riders: number;
}

interface Props {
    customers: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | any[];
    vendors: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | any[];
    riders: {
        data: Rider[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | any[];
    stats: Stats;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
}

export default function UserManagementIndex({ customers, vendors, riders, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);

    // Search function using Inertia
    const handleSearch = () => {
        setLoading(true);
        router.get('/admin/users', {
            search: searchTerm,
            role: selectedRole,
            status: selectedStatus,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
        setSelectedStatus('');
        // Trigger search after clearing filters
        router.get('/admin/users', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const toggleUserStatus = (userType: 'user' | 'rider', userId: number, currentStatus: boolean) => {
        router.post('/admin/users/toggle-activation', {
            user_type: userType,
            user_id: userId,
            is_activated: !currentStatus
        }, {
            onSuccess: () => {
                // Refresh current page after status change
                router.reload();
            }
        });
    };

    // Pagination handlers
    const handlePagination = (url: string) => {
        setLoading(true);
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
            onError: (errors) => {
                console.error('Error fetching paginated data:', errors);
                setLoading(false);
            }
        });
    };

    // Pagination component
    const PaginationControls = ({ paginationData, type }: { paginationData: any, type: string }) => {
        if (!paginationData || !paginationData.data || paginationData.length === 0) return null;

        const { current_page, last_page, prev_page_url, next_page_url } = paginationData;

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex justify-between flex-1 sm:hidden">
                    <button
                        onClick={() => prev_page_url && handlePagination(prev_page_url)}
                        disabled={!prev_page_url || loading}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => next_page_url && handlePagination(next_page_url)}
                        disabled={!next_page_url || loading}
                        className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing page <span className="font-medium">{current_page}</span> of{' '}
                            <span className="font-medium">{last_page}</span> for {type}
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => prev_page_url && handlePagination(prev_page_url)}
                                disabled={!prev_page_url || loading}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                                {current_page} / {last_page}
                            </span>
                            <button
                                onClick={() => next_page_url && handlePagination(next_page_url)}
                                disabled={!next_page_url || loading}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'vendor':
                return <Store size={16} className="text-purple-500" />;
            case 'rider':
                return <Bike size={16} className="text-blue-500" />;
            case 'admin':
                return <Shield size={16} className="text-red-500" />;
            default:
                return <Users size={16} className="text-gray-500" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'vendor':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'rider':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <AdminLayout>
            <Head title="User Management" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            User Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage all users, vendors, and riders in the system
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/admin/manage-customers"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Users size={16} className="mr-2" />
                            Manage Customers
                        </Link>
                        <Link
                            href="/admin/manage-riders"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Bike size={16} className="mr-2" />
                            Manage Riders
                        </Link>
                        <Link
                            href="/admin/manage-vendors"
                            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Store size={16} className="mr-2" />
                            Manage Vendors
                        </Link>
                        <button
                            onClick={() => window.open('/admin/users/export', '_blank')}
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Download size={16} className="mr-2" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <Store className="h-8 w-8 text-purple-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendors</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_vendors}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <Bike className="h-8 w-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Riders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_riders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <UserCheck className="h-8 w-8 text-green-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_users}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                                <Filter size={20} className="mr-2" />
                                Filters & Search
                            </h3>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search Users
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
                                    {loading && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {showFilters && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Role
                                        </label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Roles</option>
                                            <option value="customer">Customers</option>
                                            <option value="vendor">Vendors</option>
                                            <option value="rider">Riders</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="flex items-end space-x-2">
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Search
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customers Section */}
                {Array.isArray(customers) ? customers.length > 0 : customers?.data?.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Customers ({Array.isArray(customers) ? customers.length : customers?.total || 0} total)
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
                                    {(Array.isArray(customers) ? customers : customers?.data || []).map((customer: User) => (
                                        <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {customer.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {customer.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                <div className="space-y-1">
                                                    <div className="flex items-center">
                                                        <Mail size={12} className="mr-1 text-gray-400" />
                                                        <span className="text-xs">{customer.email}</span>
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center">
                                                            <Phone size={12} className="mr-1 text-gray-400" />
                                                            <span className="text-xs">{customer.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    customer.is_activated 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {customer.is_activated ? (
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
                                                        href="/admin/manage-customers"
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => toggleUserStatus('user', customer.id, customer.is_activated)}
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
                        {/* Customers Pagination */}
                        <PaginationControls paginationData={customers} type="customers" />
                    </div>
                ) : null}

                {/* Vendors Section */}
                {Array.isArray(vendors) ? vendors.length > 0 : vendors?.data?.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Vendors ({Array.isArray(vendors) ? vendors.length : vendors?.total || 0} total)
                            </h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Vendor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Business
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Contact
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
                                    {(Array.isArray(vendors) ? vendors : vendors?.data || []).map((vendor: User) => (
                                        <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-medium">
                                                            {vendor.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {vendor.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {vendor.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {vendor.vendorStore ? (
                                                    <div>
                                                        <div className="font-medium">{vendor.vendorStore.business_name}</div>
                                                        <div className="text-xs text-gray-500">{vendor.vendorStore.address}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No store created</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                <div className="space-y-1">
                                                    <div className="flex items-center">
                                                        <Mail size={12} className="mr-1 text-gray-400" />
                                                        <span className="text-xs">{vendor.email}</span>
                                                    </div>
                                                    {vendor.phone && (
                                                        <div className="flex items-center">
                                                            <Phone size={12} className="mr-1 text-gray-400" />
                                                            <span className="text-xs">{vendor.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    vendor.is_activated 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {vendor.is_activated ? (
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <Calendar size={12} className="mr-1" />
                                                    {new Date(vendor.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href="/admin/manage-vendors"
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => toggleUserStatus('user', vendor.id, vendor.is_activated)}
                                                        className={`${
                                                            vendor.is_activated 
                                                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' 
                                                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                        }`}
                                                        title={vendor.is_activated ? 'Deactivate Vendor' : 'Activate Vendor'}
                                                    >
                                                        {vendor.is_activated ? <UserX size={16} /> : <UserCheck size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Vendors Pagination */}
                        <PaginationControls paginationData={vendors} type="vendors" />
                    </div>
                ) : null}

                {/* Riders List */}
                {Array.isArray(riders) ? riders.length > 0 : riders?.data?.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Riders ({Array.isArray(riders) ? riders.length : riders?.total || 0} total)
                            </h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Rider
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Stats
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {(Array.isArray(riders) ? riders : riders?.data || []).map((rider: Rider) => (
                                        <tr key={rider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center text-white font-medium">
                                                            {rider.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {rider.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {rider.email}
                                                        </div>
                                                        <div className="text-xs text-blue-600 dark:text-blue-400">
                                                            ID: {rider.rider_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    <div>Vehicle: {rider.vehicle_type || 'Not specified'}</div>
                                                    {rider.phone && <div>Phone: {rider.phone}</div>}
                                                    {rider.license_number && <div>License: {rider.license_number}</div>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    <div>Rating: {rider.rating}/5</div>
                                                    <div>Deliveries: {rider.total_deliveries}</div>
                                                    <div className={`text-xs ${rider.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                                                        {rider.is_verified ? 'Verified' : 'Not Verified'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    rider.is_activated 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {rider.is_activated ? (
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href="/admin/manage-riders"
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => toggleUserStatus('rider', rider.id, rider.is_activated)}
                                                        className={`${
                                                            rider.is_activated 
                                                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' 
                                                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                        }`}
                                                        title={rider.is_activated ? 'Deactivate Rider' : 'Activate Rider'}
                                                    >
                                                        {rider.is_activated ? <UserX size={16} /> : <UserCheck size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Riders Pagination */}
                        <PaginationControls paginationData={riders} type="riders" />
                    </div>
                ) : null}
            </div>
        </AdminLayout>
    );
}
