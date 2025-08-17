import { Head, Link, router } from '@inertiajs/react';
import RiderLayout from '@/layouts/app/RiderLayout';
import { 
    Package, 
    Clock, 
    MapPin, 
    Phone, 
    User, 
    DollarSign,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Timer,
    Calendar,
    Eye,
    UserCheck,
    Building,
    Truck,
    Search,
    Filter,
    ArrowLeft,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface Appointment {
    id: number;
    appointment_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_city: string;
    appointment_date: string;
    appointment_time: string;
    estimated_end_time?: string;
    duration_minutes: number;
    service_price: number;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    customer_notes?: string;
    is_home_service: boolean;
    service_address?: string;
    rider_id?: number;
    vendor_store?: {
        id: number;
        store_name: string;
        store_address: string;
        store_phone: string;
    };
    service?: {
        id: number;
        service_name: string;
        service_description: string;
    };
}

interface PaginationData {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

interface Props {
    appointments: {
        data: Appointment[];
    } & PaginationData;
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    stats: {
        total_appointments: number;
        pending_count: number;
        confirmed_count: number;
        in_progress_count: number;
        completed_count: number;
        cancelled_count: number;
    };
    rider?: {
        id: number;
        rider_id: string;
        name: string;
        phone: string;
        vehicle_type: string;
        status: string;
        rating: number;
        total_deliveries: number;
    };
}

export default function AllActiveDeliveries({ appointments, filters, stats, rider }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock size={16} />;
            case 'confirmed':
                return <CheckCircle size={16} />;
            case 'in_progress':
                return <Timer size={16} />;
            case 'completed':
                return <CheckCircle size={16} />;
            case 'cancelled':
                return <XCircle size={16} />;
            default:
                return <AlertTriangle size={16} />;
        }
    };

    const formatTime = (time: string) => {
        try {
            if (!time) return 'Invalid Time';
            
            // Handle full datetime format like '2025-08-14T19:30:00.000000Z'
            if (time.includes('T')) {
                const dateTime = new Date(time);
                if (isNaN(dateTime.getTime())) {
                    return time;
                }
                return dateTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
            
            // Handle time-only format like '19:30:00'
            const timeObj = new Date(`2000-01-01T${time}`);
            if (isNaN(timeObj.getTime())) {
                return time;
            }
            
            return timeObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return time || 'Invalid Time';
        }
    };

    const formatDate = (date: string) => {
        try {
            if (!date) return 'Invalid Date';
            
            // Handle full datetime format like '2025-08-14T19:30:00.000000Z' or date-only format
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                return date;
            }
            
            return dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return date || 'Invalid Date';
        }
    };

    const handleSearch = () => {
        router.get('/rider/deliveries/all', {
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get('/rider/deliveries/all');
    };

    const changePage = (page: number) => {
        router.get('/rider/deliveries/all', {
            ...filters,
            page: page,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <RiderLayout>
            <Head title="All Appointments" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/rider/deliveries/calendar"
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Calendar
                        </Link>
                        <div className="border-l border-gray-300 dark:border-gray-600 h-6"></div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                All Appointments
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Browse and manage all available appointments
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <Package className="h-6 w-6 text-blue-500" />
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{stats?.total_appointments || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <Clock className="h-6 w-6 text-yellow-500" />
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pending</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{stats?.pending_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <CheckCircle className="h-6 w-6 text-blue-500" />
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Available</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{stats?.confirmed_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <Timer className="h-6 w-6 text-green-500" />
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{stats?.in_progress_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <CheckCircle className="h-6 w-6 text-gray-500" />
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{stats?.completed_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="flex items-center">
                            <XCircle className="h-6 w-6 text-red-500" />
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{stats?.cancelled_count || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <Filter size={20} className="text-gray-500" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters & Search</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search Appointment
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, number..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Available</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date To
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex flex-col justify-end space-y-2">
                            <button
                                onClick={handleSearch}
                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Search size={16} className="mr-2" />
                                Search
                            </button>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Appointments ({appointments?.from || 0}-{appointments?.to || 0} of {appointments?.total || 0})
                        </h3>
                    </div>
                    
                    {!appointments?.data || appointments.data.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Appointments Found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                No appointments match your current filters.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {appointments.data.map((appointment) => (
                                <div key={appointment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-start justify-between">
                                        {/* Main Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    #{appointment.appointment_number}
                                                </h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                                                    {getStatusIcon(appointment.status)}
                                                    <span className="ml-1 capitalize">{appointment.status.replace('_', ' ')}</span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Customer Info */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center text-sm">
                                                        <User size={16} className="text-gray-400 mr-2" />
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {appointment.customer_name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <Phone size={16} className="text-gray-400 mr-2" />
                                                        <a 
                                                            href={`tel:${appointment.customer_phone}`}
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            {appointment.customer_phone}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-start text-sm">
                                                        <MapPin size={16} className="text-gray-400 mr-2 mt-0.5" />
                                                        <span className="text-gray-600 dark:text-gray-300">
                                                            {appointment.is_home_service 
                                                                ? appointment.service_address || appointment.customer_address
                                                                : appointment.vendor_store?.store_address
                                                            }
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Appointment Details */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center text-sm">
                                                        <Calendar size={16} className="text-gray-400 mr-2" />
                                                        <span className="text-gray-900 dark:text-white">
                                                            {formatDate(appointment.appointment_date)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <Clock size={16} className="text-gray-400 mr-2" />
                                                        <span className="text-gray-900 dark:text-white">
                                                            {formatTime(appointment.appointment_time)}
                                                            {appointment.estimated_end_time && (
                                                                <span className="text-gray-500">
                                                                    {' - '}{formatTime(appointment.estimated_end_time)}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <DollarSign size={16} className="text-gray-400 mr-2" />
                                                        <span className="font-medium text-green-600">
                                                            ₱{(appointment.total_amount || appointment.service_price || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Service Details */}
                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                                                <h5 className="font-medium text-gray-900 dark:text-white">
                                                    {appointment.service?.service_name || 'Service information not available'}
                                                </h5>
                                                {appointment.service?.service_description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        {appointment.service.service_description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="ml-6 flex flex-col space-y-2">
                                            {/* View Details Button - Always available */}
                                            <Link
                                                href={`/rider/deliveries/${appointment.id}/details`}
                                                className="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                                            >
                                                <Eye size={14} className="mr-1" />
                                                View Details
                                            </Link>

                                            {/* Status-specific action buttons */}
                                            {appointment.status === 'confirmed' && !appointment.rider_id && (
                                                <Link
                                                    href={`/rider/deliveries/${appointment.id}/get`}
                                                    className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                                                >
                                                    <UserCheck size={14} className="mr-1" />
                                                    Get This Book
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {appointments && appointments.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {appointments.from} to {appointments.to} of {appointments.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => changePage(appointments.current_page - 1)}
                                        disabled={appointments.current_page <= 1}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} className="mr-1" />
                                        Previous
                                    </button>
                                    
                                    <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Page {appointments.current_page} of {appointments.last_page}
                                    </span>
                                    
                                    <button
                                        onClick={() => changePage(appointments.current_page + 1)}
                                        disabled={appointments.current_page >= appointments.last_page}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight size={16} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </RiderLayout>
    );
}
