import { useState } from 'react';
import { Link } from '@inertiajs/react';
import VendorLayout from '../../../layouts/app/VendorLayout';
import { 
    Store, 
    Plus, 
    Edit, 
    Eye, 
    Trash2, 
    Search, 
    Filter,
    MapPin,
    Phone,
    Mail,
    Package,
    ShoppingBag,
    CheckCircle,
    XCircle,
    Calendar,
    DollarSign
} from 'lucide-react';

interface VendorStore {
    id: number;
    business_name: string;
    description: string;
    business_type: 'products' | 'services';
    address: string;
    serviceable_areas: string[];
    contact_phone: string;
    contact_email: string;
    service_description: string;
    logo_path: string | null;
    is_active: boolean;
    setup_completed: boolean;
    created_at: string;
    products_services_count: number;
}

interface Props {
    stores: VendorStore[];
    filters?: {
        search?: string;
        business_type?: string;
        is_active?: boolean;
    };
}

export default function IndexStore({ stores, filters = {} }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.business_type || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.is_active?.toString() || '');

    const getStatusBadge = (store: VendorStore) => {
        if (!store.setup_completed) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <XCircle size={12} className="mr-1" />
                    Incomplete
                </span>
            );
        }
        
        if (store.is_active) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle size={12} className="mr-1" />
                    Active
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                <XCircle size={12} className="mr-1" />
                Inactive
            </span>
        );
    };

    const getBusinessTypeBadge = (type: string) => {
        if (type === 'products') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    <Package size={12} className="mr-1" />
                    Products
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                <ShoppingBag size={12} className="mr-1" />
                Services
            </span>
        );
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedType) params.append('business_type', selectedType);
        if (selectedStatus) params.append('is_active', selectedStatus);
        
        window.location.href = `${route('vendor.store.index')}?${params.toString()}`;
    };

    const handleDelete = (storeId: number) => {
        if (confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
            // Use Inertia delete method
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('vendor.store.destroy', storeId);
            
            // Add CSRF token
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            // Add method spoofing
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'DELETE';
            
            form.appendChild(csrfInput);
            form.appendChild(methodInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <VendorLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                My Stores
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Manage your business stores and their details
                            </p>
                        </div>
                        <Link
                            href={route('vendor.store.create')}
                            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                        >
                            <Plus size={16} className="mr-2" />
                            Create New Store
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Search Stores
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or description..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Business Type
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">All Types</option>
                                <option value="products">Products</option>
                                <option value="services">Services</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleSearch}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                            >
                                <Filter size={16} className="mr-2" />
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stores Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {stores.length === 0 ? (
                        <div className="text-center py-12">
                            <Store className="mx-auto text-slate-400 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                No stores found
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Get started by creating your first store.
                            </p>
                            <Link
                                href={route('vendor.store.create')}
                                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                            >
                                <Plus size={16} className="mr-2" />
                                Create Store
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Store Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Type & Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Contact Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Products/Services
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {stores.map((store) => (
                                        <tr key={store.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        {store.logo_path ? (
                                                            <img
                                                                className="h-12 w-12 rounded-lg object-cover"
                                                                src={`/storage/${store.logo_path}`}
                                                                alt={store.business_name}
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                                                <Store className="text-slate-400" size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {store.business_name}
                                                        </div>
                                                        <div className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                            {store.description}
                                                        </div>
                                                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            <MapPin size={12} className="mr-1" />
                                                            {store.serviceable_areas.length} area(s)
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    {getBusinessTypeBadge(store.business_type)}
                                                    {getStatusBadge(store)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-slate-900 dark:text-white">
                                                        <Phone size={12} className="mr-2 text-slate-400" />
                                                        {store.contact_phone}
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                                        <Mail size={12} className="mr-2 text-slate-400" />
                                                        {store.contact_email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-slate-900 dark:text-white">
                                                    <DollarSign size={12} className="mr-1 text-slate-400" />
                                                    {store.products_services_count || 0} items
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                                    <Calendar size={12} className="mr-2" />
                                                    {new Date(store.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={route('vendor.store.show', store.id)}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link
                                                        href={route('vendor.store.edit', store.id)}
                                                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                        title="Edit Store"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(store.id)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Delete Store"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                {stores.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Store className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Stores</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stores.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Stores</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stores.filter(store => store.is_active && store.setup_completed).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <Package className="text-purple-600 dark:text-purple-400" size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Product Stores</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stores.filter(store => store.business_type === 'products').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                    <ShoppingBag className="text-orange-600 dark:text-orange-400" size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Service Stores</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stores.filter(store => store.business_type === 'services').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </VendorLayout>
    );
}