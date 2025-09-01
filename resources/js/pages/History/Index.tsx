import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
    Calendar, 
    Clock, 
    User, 
    MapPin, 
    Phone, 
    Mail, 
    DollarSign, 
    Filter, 
    Search, 
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    History as HistoryIcon,
    Truck,
    Store,
    FileText,
    Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'History', href: '/history' },
];

interface Appointment {
    id: number;
    appointment_number: string;
    customer_name: string;
    appointment_date: string | null;
    appointment_time: string | null;
    status: string;
    total_amount: number;
    currency: string;
    vendor: {
        business_name: string;
        contact_phone: string;
    } | null;
    service: {
        name: string;
        category: string;
    } | null;
    rider: {
        name: string;
        phone: string;
        vehicle_type: string;
    } | null;
    created_at: string;
    completed_at: string | null;
    cancelled_at: string | null;
}

interface Stats {
    total: number;
    completed: number;
    cancelled: number;
    this_month: number;
    total_amount: number;
}

interface Props {
    appointments: {
        data: Appointment[];
        links: any[];
        meta: any;
    };
    recentHistory: Appointment[];
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
        type?: string;
    };
    stats: Stats;
}

const statusIcons = {
    completed: CheckCircle,
    cancelled: XCircle,
    confirmed: AlertCircle,
    pending: Clock,
    in_progress: Clock,
    no_show: XCircle,
};

const statusColors = {
    completed: 'text-green-600 bg-green-100',
    cancelled: 'text-red-600 bg-red-100',
    confirmed: 'text-blue-600 bg-blue-100',
    pending: 'text-yellow-600 bg-yellow-100',
    in_progress: 'text-purple-600 bg-purple-100',
    no_show: 'text-gray-600 bg-gray-100',
};

export default function History({ appointments, recentHistory, filters, stats }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    // Provide default values for props
    const safeStats = stats || {
        total: 0,
        completed: 0,
        cancelled: 0,
        this_month: 0,
        total_amount: 0
    };

    const safeAppointments = appointments || {
        data: [],
        links: [],
        meta: { total: 0, per_page: 15, current_page: 1, last_page: 1 }
    };

    // Ensure meta is always properly structured
    if (safeAppointments.meta === undefined || safeAppointments.meta === null) {
        safeAppointments.meta = { total: 0, per_page: 15, current_page: 1, last_page: 1 };
    }

    const safeRecentHistory = recentHistory || [];
    const safeFilters = filters || {};

    const handleFilter = () => {
        router.get(route('history.index'), {
            search: searchTerm,
            status: statusFilter,
            date_from: dateFrom,
            date_to: dateTo,
            type: 'past'
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        router.get(route('history.index'));     
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date || date === 'null' || date === 'undefined') return 'N/A';
        
        try {
            // Handle various date formats
            let dateObj: Date;
            
            if (typeof date === 'string') {
                // Remove any time portion if it exists
                const dateOnly = date.split('T')[0].split(' ')[0];
                dateObj = new Date(dateOnly + 'T00:00:00.000Z');
            } else {
                dateObj = new Date(date);
            }
            
            if (isNaN(dateObj.getTime())) {
                console.log('Invalid date object for:', date);
                return 'N/A';
            }
            
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
            });
        } catch (error) {
            console.log('Date formatting error:', error, 'for date:', date);
            return 'N/A';
        }
    };

    const formatTime = (time: string | null | undefined) => {
        if (!time || time === 'null' || time === 'undefined') return 'N/A';
        
        try {
            // Handle time string or datetime string
            let timeStr = time;
            if (time.includes('T') || time.includes(' ')) {
                // Extract time from datetime
                timeStr = time.split('T')[1]?.split(' ')[1] || time.split(' ')[1] || time;
            }
            
            // Create a date object with today's date and the time
            const today = new Date().toISOString().split('T')[0];
            const dateTimeStr = `${today}T${timeStr}`;
            const dateObj = new Date(dateTimeStr);
            
            if (isNaN(dateObj.getTime())) {
                return 'N/A';
            }
            
            return dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.log('Time formatting error:', error, 'for time:', time);
            return 'N/A';
        }
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointment History" />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <HistoryIcon className="h-8 w-8 text-orange-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Appointment History</h1>
                                    <p className="text-gray-600">View all your past appointments and details</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                                    <p className="text-2xl font-bold text-gray-900">{safeStats.total}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">{safeStats.completed}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-600">{safeStats.cancelled}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-purple-600">{safeStats.this_month}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(safeStats.total_amount)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Recent History Sidebar */}
                        {safeRecentHistory && safeRecentHistory.length > 0 && (
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Clock className="h-5 w-5 text-orange-600 mr-2" />
                                        Recently Viewed
                                    </h2>
                                    <div className="space-y-3">
                                        {safeRecentHistory.slice(0, 5).map((appointment) => (
                                            <Link
                                                key={appointment.id}
                                                href={route('history.show', appointment.id)}
                                                className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        #{appointment.appointment_number}
                                                    </p>
                                                    <span className={cn(
                                                        'px-2 py-1 rounded-full text-xs font-medium',
                                                        statusColors[appointment.status as keyof typeof statusColors] || 'text-gray-600 bg-gray-100'
                                                    )}>
                                                        {appointment.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {appointment.vendor?.business_name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(appointment.appointment_date)}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Content */}
                        <div className={cn('lg:col-span-3', !safeRecentHistory?.length && 'lg:col-span-4')}>
                            {/* Filters */}
                            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Filter className="h-5 w-5 text-orange-600 mr-2" />
                                        Filters
                                    </h2>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-orange-600 hover:text-orange-700"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search appointments..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="pending">Pending</option>
                                            <option value="no_show">No Show</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <button
                                        onClick={handleFilter}
                                        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>

                            {/* Appointments List */}
                            <div className="space-y-4">
                                {safeAppointments.data.length > 0 ? (
                                    safeAppointments.data.map((appointment) => {
                                        const StatusIcon = statusIcons[appointment.status as keyof typeof statusIcons] || AlertCircle;
                                        
                                        return (
                                            <div key={appointment.id} className="bg-white rounded-lg shadow-sm border p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={cn(
                                                            'p-2 rounded-full',
                                                            statusColors[appointment.status as keyof typeof statusColors] || 'text-gray-600 bg-gray-100'
                                                        )}>
                                                            <StatusIcon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                #{appointment.appointment_number}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {appointment.customer_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-3">
                                                        <span className={cn(
                                                            'px-3 py-1 rounded-full text-sm font-medium',
                                                            statusColors[appointment.status as keyof typeof statusColors] || 'text-gray-600 bg-gray-100'
                                                        )}>
                                                            {appointment.status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                        
                                                        <Link
                                                            href={route('history.show', appointment.id)}
                                                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span>View Details</span>
                                                        </Link>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            {formatDate(appointment.appointment_date)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            {formatTime(appointment.appointment_time)}
                                                        </span>
                                                    </div>
                                                    
                                                    {appointment.vendor && (
                                                        <div className="flex items-center space-x-2">
                                                            <Store className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600">
                                                                {appointment.vendor.business_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600 font-medium">
                                                            {formatCurrency(appointment.total_amount, appointment.currency)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {appointment.rider && (
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                            <Truck className="h-4 w-4 text-gray-400" />
                                                            <span>
                                                                Rider: {appointment.rider.name} ({appointment.rider.vehicle_type})
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                                        <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No History Found</h3>
                                        <p className="text-gray-600">
                                            {Object.values(safeFilters).some(f => f) ? 
                                                'No appointments match your current filters.' :
                                                'You don\'t have any appointment history yet.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {safeAppointments?.meta?.total > safeAppointments?.meta?.per_page && (
                                <div className="mt-8 flex justify-center">
                                    <div className="flex space-x-2">
                                        {safeAppointments.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={cn(
                                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                                    link.active
                                                        ? 'bg-orange-600 text-white'
                                                        : link.url
                                                        ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                        : 'text-gray-400 cursor-not-allowed'
                                                )}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
