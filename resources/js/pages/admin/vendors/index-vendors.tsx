import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/app/AdminLayout';
import { 
    Store, 
    Search, 
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
    Clock
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
    appointments_count: number;
    orders_count: number;
}

interface Props {
    vendorStores: {
        data: VendorStore[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url?: string;
        next_page_url?: string;
    };
    filters: {
        search?: string;
        business_type?: string;
        status?: string;
    };
}

export default function IndexVendors({ vendorStores, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedBusinessType, setSelectedBusinessType] = useState(filters.business_type || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        router.get('/admin/vendor-stores', {
            search: searchTerm,
            business_type: selectedBusinessType,
            status: selectedStatus,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedBusinessType('');
        setSelectedStatus('');
        router.get('/admin/vendor-stores', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const toggleStoreStatus = (storeId: number) => {
        router.post(`/admin/vendor-stores/${storeId}/toggle-status`, {}, {
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
                        <ToggleRight size={12} className="mr-1" />
                        Active
                    </>
                ) : (
                    <>
                        <ToggleLeft size={12} className="mr-1" />
                        Inactive
                    </>
                )}
            </span>
        );
    };

    const getBusinessTypeBadge = (businessType: string) => {
        const colors: { [key: string]: string } = {
            'products': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'services': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'both': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[businessType] || colors.both}`}>
                <Building size={10} className="mr-1" />
                {businessType.charAt(0).toUpperCase() + businessType.slice(1)}
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
            <Head title="Vendor Stores Management" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Vendor Stores Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage all vendor stores, view details and track performance
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search Stores
                            </label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by store name, description..."
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
                                Business Type
                            </label>
                            <select
                                value={selectedBusinessType}
                                onChange={(e) => setSelectedBusinessType(e.target.value)}
                                disabled={loading}
                                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <option value="">All Types</option>
                                <option value="products">Products</option>
                                <option value="services">Services</option>
                                <option value="both">Both</option>
                            </select>
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

                {/* Vendor Stores Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                            <Store size={20} className="mr-2" />
                            Vendor Stores ({vendorStores.total} total)
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Store Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Business Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {vendorStores.data?.map((store: VendorStore) => (
                                    <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-medium text-lg">
                                                        {store.business_name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {store.business_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Store ID: #{store.id}
                                                    </div>
                                                    {store.address && (
                                                        <div className="flex items-center mt-1">
                                                            <MapPin size={12} className="mr-1 text-gray-400" />
                                                            <span className="text-xs text-gray-500 truncate max-w-xs">{store.address}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div className="space-y-1">
                                                <div className="font-medium">{store.user.name}</div>
                                                <div className="flex items-center">
                                                    <Mail size={12} className="mr-2 text-gray-400" />
                                                    <span className="text-xs">{store.user.email}</span>
                                                </div>
                                                {store.user.phone && (
                                                    <div className="flex items-center">
                                                        <Phone size={12} className="mr-2 text-gray-400" />
                                                        <span className="text-xs">{store.user.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getBusinessTypeBadge(store.business_type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center">
                                                        <Clock size={12} className="mr-1 text-gray-400" />
                                                        <span className="text-xs">{store.appointments_count} appointments</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <Package size={12} className="mr-1 text-gray-400" />
                                                    <span className="text-xs">{store.orders_count} orders</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(store.is_active)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <Calendar size={12} className="mr-1" />
                                                {new Date(store.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/vendor-stores/${store.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View Store Details"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => toggleStoreStatus(store.id)}
                                                    className={`${
                                                        store.is_active 
                                                            ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' 
                                                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                    }`}
                                                    title={store.is_active ? 'Deactivate Store' : 'Activate Store'}
                                                >
                                                    {store.is_active ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
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
                                onClick={() => vendorStores.prev_page_url && handlePagination(vendorStores.prev_page_url)}
                                disabled={!vendorStores.prev_page_url || loading}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => vendorStores.next_page_url && handlePagination(vendorStores.next_page_url)}
                                disabled={!vendorStores.next_page_url || loading}
                                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing page <span className="font-medium">{vendorStores.current_page}</span> of{' '}
                                    <span className="font-medium">{vendorStores.last_page}</span> for vendor stores
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => vendorStores.prev_page_url && handlePagination(vendorStores.prev_page_url)}
                                        disabled={!vendorStores.prev_page_url || loading}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                                        {vendorStores.current_page} / {vendorStores.last_page}
                                    </span>
                                    <button
                                        onClick={() => vendorStores.next_page_url && handlePagination(vendorStores.next_page_url)}
                                        disabled={!vendorStores.next_page_url || loading}
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
