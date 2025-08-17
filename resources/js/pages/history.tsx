import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedAppointmentModal from '@/components/enhanced-appointment-modal';
import { 
    Calendar as CalendarIcon,
    Clock,
    Star,
    Eye,
    Filter,
    Search,
    TrendingUp,
    CheckCircle,
    XCircle,
    AlertCircle,
    MapPin,
    Package,
    CreditCard,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface Appointment {
    id: number;
    appointment_number?: string;
    vendor_store_id: number;
    service_id?: number;
    rider_id?: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address?: string;
    customer_city?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    service_name: string;
    service_price?: number;
    additional_charges?: number;
    discount_amount?: number;
    total_amount?: number;
    currency?: string;
    appointment_date: string;
    appointment_time: string;
    estimated_end_time?: string;
    duration_minutes?: number;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
    cancellation_reason?: string;
    cancellation_details?: string;
    confirmed_at?: string;
    started_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    rescheduled_at?: string;
    notes?: string;
    customer_notes?: string;
    internal_notes?: string;
    requirements?: string[];
    is_home_service?: boolean;
    service_address?: string;
    weather_conditions?: string;
    payment_status?: string;
    payment_method?: string;
    payment_reference?: string;
    payment_completed_at?: string;
    sms_notifications?: boolean;
    email_notifications?: boolean;
    customer_rating?: number;
    customer_feedback?: string;
    feedback_submitted_at?: string;
    reminder_sent_at?: string;
    notification_log?: any;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    vendor_store?: {
        id: number;
        business_name: string;
        business_type: string;
        address?: string;
        contact_phone?: string;
        contact_email?: string;
        logo_path?: string;
        user?: {
            name: string;
            email: string;
        };
    };
    rider?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        rider_id: string;
        vehicle_type?: string;
        license_number?: string;
        status?: string;
        rating?: number;
    };
    service?: {
        id: number;
        name: string;
        description?: string;
        price_min?: number;
        price_max?: number;
    };
}

interface HistoryStats {
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    pending_appointments: number;
    total_spent: number;
    average_rating: number;
    favorite_service: string;
    first_appointment: string;
}

interface Props {
    appointments: {
        data: Appointment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url?: string;
        next_page_url?: string;
    };
    stats: HistoryStats;
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function History({ appointments, stats, filters }: Props) {
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleFilter = () => {
        const searchParams = new URLSearchParams();
        if (searchTerm) searchParams.set('search', searchTerm);
        if (statusFilter) searchParams.set('status', statusFilter);
        if (dateFrom) searchParams.set('date_from', dateFrom);
        if (dateTo) searchParams.set('date_to', dateTo);
        
        window.location.href = `/history?${searchParams.toString()}`;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        window.location.href = '/history';
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return CheckCircle;
            case 'pending': return Clock;
            case 'confirmed': return CheckCircle;
            case 'cancelled': return XCircle;
            default: return AlertCircle;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatTime = (timeString: string) => {
        try {
            // Handle both ISO format (2025-08-16T12:15:00.000000Z) and simple time format (12:15:00)
            if (timeString.includes('T')) {
                // ISO format
                return new Date(timeString).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            } else {
                // Simple time format (HH:MM:SS or HH:MM)
                const [hours, minutes] = timeString.split(':');
                const hour24 = parseInt(hours);
                const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                const period = hour24 >= 12 ? 'PM' : 'AM';
                return `${hour12}:${minutes} ${period}`;
            }
        } catch (error) {
            console.error('Error formatting time:', error);
            return timeString; // Return original if formatting fails
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star 
                key={i} 
                size={14} 
                className={i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'} 
            />
        ));
    };

    return (
        <AppLayout>
            <Head title="Appointment History" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Appointment History
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View your complete appointment history and details
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Appointments
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.total_appointments}
                                    </p>
                                </div>
                                <CalendarIcon className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Completed
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats.completed_appointments}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Spent
                                    </p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {formatCurrency(stats.total_spent)}
                                    </p>
                                </div>
                                <CreditCard className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Average Rating
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {stats.average_rating ? stats.average_rating.toFixed(1) : 'N/A'}
                                        </p>
                                        {stats.average_rating && (
                                            <div className="flex">
                                                {renderStars(Math.round(stats.average_rating))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Star className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="mr-2" size={20} />
                            Filter Appointments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Service, store..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
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
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    From Date
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
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="flex items-end space-x-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    Apply
                                </Button>
                                <Button onClick={clearFilters} variant="outline">
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments List */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Your Appointments ({appointments.total} total)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {appointments.data.length > 0 ? (
                            <div className="space-y-4">
                                {appointments.data.map((appointment) => {
                                    const StatusIcon = getStatusIcon(appointment.status);
                                    
                                    return (
                                        <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {appointment.service_name}
                                                        </h3>
                                                        <Badge className={getStatusColor(appointment.status)}>
                                                            <StatusIcon size={12} className="mr-1" />
                                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                            <CalendarIcon size={14} className="mr-2" />
                                                            {new Date(appointment.appointment_date).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                            <Clock size={14} className="mr-2" />
                                                            {formatTime(appointment.appointment_time)}
                                                        </div>
                                                        {appointment.vendor_store && (
                                                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                                <MapPin size={14} className="mr-2" />
                                                                {appointment.vendor_store.business_name}
                                                            </div>
                                                        )}
                                                        {appointment.total_amount && (
                                                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                                <CreditCard size={14} className="mr-2" />
                                                                {formatCurrency(appointment.total_amount)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {appointment.customer_rating && (
                                                        <div className="flex items-center space-x-2 mt-2">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">Your Rating:</span>
                                                            <div className="flex">
                                                                {renderStars(appointment.customer_rating)}
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                {appointment.customer_rating}/5
                                                            </span>
                                                        </div>
                                                    )}

                                                    {appointment.customer_feedback && (
                                                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm italic">
                                                            "{appointment.customer_feedback}"
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="ml-4">
                                                    <Button
                                                        onClick={() => handleViewDetails(appointment)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Eye size={14} className="mr-2" />
                                                        Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CalendarIcon size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No Appointments Found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    You haven't made any appointments yet or no appointments match your filters.
                                </p>
                                <Link href="/appointments">
                                    <Button>
                                        <Package className="mr-2" size={16} />
                                        Book an Appointment
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {appointments.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between flex-1 sm:hidden">
                                    <Button
                                        variant="outline"
                                        disabled={!appointments.prev_page_url}
                                        onClick={() => appointments.prev_page_url && (window.location.href = appointments.prev_page_url)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={!appointments.next_page_url}
                                        onClick={() => appointments.next_page_url && (window.location.href = appointments.next_page_url)}
                                    >
                                        Next
                                    </Button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing page <span className="font-medium">{appointments.current_page}</span> of{' '}
                                            <span className="font-medium">{appointments.last_page}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!appointments.prev_page_url}
                                                onClick={() => appointments.prev_page_url && (window.location.href = appointments.prev_page_url)}
                                            >
                                                <ChevronLeft size={16} />
                                            </Button>
                                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                                                {appointments.current_page} / {appointments.last_page}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!appointments.next_page_url}
                                                onClick={() => appointments.next_page_url && (window.location.href = appointments.next_page_url)}
                                            >
                                                <ChevronRight size={16} />
                                            </Button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Appointment Modal - Customer View (No History Tab) */}
            <EnhancedAppointmentModal
                appointment={selectedAppointment}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                showActions={false} // Customer view - no action buttons
                initialTab="details" // Always start with details tab
                showHistoryTab={false} // Hide customer history tab in customer's own view
            />
        </AppLayout>
    );
}
