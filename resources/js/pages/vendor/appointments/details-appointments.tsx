import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import VendorLayout from '@/layouts/app/VendorLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    PhoneIcon,
    MailIcon,
    MapPinIcon,
    FileTextIcon,
    DollarSignIcon,
    AlertCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    PauseCircleIcon,
    PlayCircleIcon,
    EditIcon,
    EyeIcon,
    FilterIcon,
    SearchIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CalendarDaysIcon,
    StarIcon,
    MessageSquareIcon,
    CreditCardIcon,
    ClockArrowUpIcon,
    Store,
    Activity,
    Bike,
    User,
    Clock,
    Bell
} from 'lucide-react';

interface Appointment {
    id: number;
    appointment_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address?: string;
    customer_city?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    
    // Booking Details
    vendor_store_id: number;
    service_id?: number;
    rider_id?: number;
    appointment_date: string;
    appointment_time: string;
    estimated_end_time?: string;
    duration_minutes?: number;
    
    // Service Information
    service_name: string;
    service_description?: string;
    service_price?: number;
    additional_charges?: number;
    discount_amount?: number;
    total_amount: number;
    currency: string;
    
    // Booking Requirements
    requirements?: string[];
    customer_notes?: string;
    internal_notes?: string;
    
    // Status Management
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
    cancellation_reason?: string;
    cancellation_details?: string;
    
    // Professional Tracking
    confirmed_at?: string;
    started_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    rescheduled_at?: string;
    
    // Communication
    sms_notifications: boolean;
    email_notifications: boolean;
    reminder_sent_at?: string;
    notification_log?: any;
    
    // Rating & Feedback
    customer_rating?: number;
    customer_feedback?: string;
    feedback_submitted_at?: string;
    
    // Payment Integration
    payment_status: string;
    payment_method?: string;
    payment_reference?: string;
    payment_completed_at?: string;
    
    // Location & Weather
    is_home_service: boolean;
    service_address?: string;
    weather_conditions?: string;
    
    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    
    // Relationships
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

interface Props {
    appointments: {
        data: Appointment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
    stats: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
    };
}

const statusConfig = {
    pending: { 
        icon: ClockIcon, 
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        bg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    confirmed: { 
        icon: CheckCircleIcon, 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    in_progress: { 
        icon: PlayCircleIcon, 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    completed: { 
        icon: CheckCircleIcon, 
        color: 'bg-green-100 text-green-800 border-green-200',
        bg: 'bg-green-50 dark:bg-green-900/20'
    },
    cancelled: { 
        icon: XCircleIcon, 
        color: 'bg-red-100 text-red-800 border-red-200',
        bg: 'bg-red-50 dark:bg-red-900/20'
    },
    no_show: { 
        icon: AlertCircleIcon, 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        bg: 'bg-gray-50 dark:bg-gray-900/20'
    },
    rescheduled: { 
        icon: ClockArrowUpIcon, 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
};

export default function AppointmentDetails({ appointments, filters, stats }: Props) {
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Check if we have a specific date filter (from calendar view)
    const isDateFiltered = filters.date_from && filters.date_to && filters.date_from === filters.date_to;

    const handleSearch = () => {
        router.get('/vendor/appointments/details', {
            search: searchTerm,
            status: statusFilter,
            date_from: dateFrom,
            date_to: dateTo,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleStatusUpdate = (appointmentId: number, newStatus: string) => {
        router.patch(`/vendor/appointments/${appointmentId}/status`, 
            { status: newStatus },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Status updated successfully');
                },
                onError: (errors) => {
                    console.error('Failed to update status:', errors);
                }
            }
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        // Handle ISO timestamp format (e.g., "2025-08-16T12:15:00.000000Z")
        if (timeString.includes('T') && timeString.includes('Z')) {
            return new Date(timeString).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
        
        // Handle simple time format (e.g., "14:30:00")
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatCurrency = (amount: number, currency: string = 'PHP') => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const getStatusActions = (appointment: Appointment) => {
        const actions = [];
        
        switch (appointment.status) {
            case 'pending':
                actions.push(
                    <Button
                        key="confirm"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                    >
                        <CheckCircleIcon size={14} className="mr-1" />
                        Confirm
                    </Button>
                );
                actions.push(
                    <Button
                        key="cancel"
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                    >
                        <XCircleIcon size={14} className="mr-1" />
                        Cancel
                    </Button>
                );
                break;
            case 'confirmed':
                actions.push(
                    <Button
                        key="start"
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleStatusUpdate(appointment.id, 'in_progress')}
                    >
                        <PlayCircleIcon size={14} className="mr-1" />
                        Start
                    </Button>
                );
                break;
            case 'in_progress':
                actions.push(
                    <Button
                        key="complete"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                    >
                        <CheckCircleIcon size={14} className="mr-1" />
                        Complete
                    </Button>
                );
                break;
        }
        
        return actions;
    };

    return (
        <VendorLayout>
            <Head title="Appointment Details" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {isDateFiltered ? (
                                        <>
                                            Appointments for {new Date(filters.date_from!).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </>
                                    ) : (
                                        'Appointment Details'
                                    )}
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 mt-2">
                                    {isDateFiltered ? (
                                        'Detailed view of appointments for the selected date'
                                    ) : (
                                        'Comprehensive view of all your appointments'
                                    )}
                                </p>
                            </div>
                            <Link 
                                href="/vendor/appointments"
                                className="inline-flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon size={16} className="mr-2" />
                                {isDateFiltered ? 'Back to Calendar' : 'Back to Calendar'}
                            </Link>
                        </div>
                    </div>

                    {/* Date Filter Alert */}
                    {isDateFiltered && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            Filtered by Date
                                        </h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-200">
                                            Showing appointments for {new Date(filters.date_from!).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/vendor/appointments/details"
                                    className="inline-flex items-center px-3 py-1.5 border border-blue-300 dark:border-blue-600 rounded-md text-sm font-medium text-blue-700 dark:text-blue-200 bg-white dark:bg-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                                >
                                    <XCircleIcon size={14} className="mr-1" />
                                    Clear Filter
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                                    </div>
                                    <CalendarDaysIcon className="w-8 h-8 text-slate-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-amber-600">Pending</p>
                                        <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                                    </div>
                                    <ClockIcon className="w-8 h-8 text-amber-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Confirmed</p>
                                        <p className="text-2xl font-bold text-blue-700">{stats.confirmed}</p>
                                    </div>
                                    <CheckCircleIcon className="w-8 h-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Completed</p>
                                        <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
                                    </div>
                                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-600">Cancelled</p>
                                        <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
                                    </div>
                                    <XCircleIcon className="w-8 h-8 text-red-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center text-slate-900 dark:text-white">
                                <FilterIcon size={20} className="mr-2" />
                                Filters & Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="relative">
                                    <SearchIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search appointments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="no_show">No Show</option>
                                    <option value="rescheduled">Rescheduled</option>
                                </select>

                                <input
                                    type="date"
                                    placeholder="From Date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className={`px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDateFiltered ? 'border-blue-300 dark:border-blue-600' : 'border-slate-300 dark:border-slate-600'
                                    }`}
                                />

                                <input
                                    type="date"
                                    placeholder="To Date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className={`px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDateFiltered ? 'border-blue-300 dark:border-blue-600' : 'border-slate-300 dark:border-slate-600'
                                    }`}
                                />

                                <Button
                                    onClick={handleSearch}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <SearchIcon size={16} className="mr-2" />
                                    Search
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointments List */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-white">
                                {isDateFiltered ? (
                                    <>
                                        Appointments for {new Date(filters.date_from!).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })} ({appointments.from}-{appointments.to} of {appointments.total})
                                    </>
                                ) : (
                                    <>
                                        Appointments ({appointments.from}-{appointments.to} of {appointments.total})
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {appointments.data && appointments.data.length > 0 ? (
                                    appointments.data.map((appointment) => {
                                    const config = statusConfig[appointment.status];
                                    const StatusIcon = config.icon;
                                    
                                    return (
                                        <div
                                            key={appointment.id}
                                            className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-900/50"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-3 rounded-lg ${config.bg}`}>
                                                        <StatusIcon size={24} className={`${config.color.split(' ')[1]}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                            {appointment.customer_name}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            #{appointment.appointment_number}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={config.color}>
                                                    <StatusIcon size={12} className="mr-1" />
                                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                                {/* Service Information */}
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Service Details</h4>
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                        <FileTextIcon size={14} className="mr-2" />
                                                        {appointment.service_name}
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                        <DollarSignIcon size={14} className="mr-2" />
                                                        {formatCurrency(appointment.total_amount, appointment.currency)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                        <ClockIcon size={14} className="mr-2" />
                                                        {appointment.duration_minutes} minutes
                                                    </div>
                                                </div>

                                                {/* Date & Time */}
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Schedule</h4>
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                        <CalendarIcon size={14} className="mr-2" />
                                                        {formatDate(appointment.appointment_date)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                        <ClockIcon size={14} className="mr-2" />
                                                        {formatTime(appointment.appointment_time)}
                                                        {appointment.estimated_end_time && (
                                                            <span className="ml-1">- {formatTime(appointment.estimated_end_time)}</span>
                                                        )}
                                                    </div>
                                                    {appointment.is_home_service && (
                                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                            <MapPinIcon size={14} className="mr-2" />
                                                            Home Service
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Contact Information */}
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Contact</h4>
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                        <PhoneIcon size={14} className="mr-2" />
                                                        {appointment.customer_phone}
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                        <MailIcon size={14} className="mr-2" />
                                                        {appointment.customer_email}
                                                    </div>
                                                    {appointment.customer_address && (
                                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                            <MapPinIcon size={14} className="mr-2" />
                                                            {appointment.customer_address}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Payment & Rating */}
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Payment & Rating</h4>
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                        <CreditCardIcon size={14} className="mr-2" />
                                                        {appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                                                    </div>
                                                    {appointment.payment_method && (
                                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                            <CreditCardIcon size={14} className="mr-2" />
                                                            {appointment.payment_method}
                                                        </div>
                                                    )}
                                                    {appointment.customer_rating && (
                                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                            <StarIcon size={14} className="mr-2 text-yellow-500" />
                                                            {appointment.customer_rating}/5 stars
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {(appointment.customer_notes || appointment.internal_notes) && (
                                                <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                    {appointment.customer_notes && (
                                                        <div className="mb-2">
                                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                                                Customer Notes
                                                            </p>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                                {appointment.customer_notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {appointment.internal_notes && (
                                                        <div>
                                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                                                Internal Notes
                                                            </p>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                                                {appointment.internal_notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusActions(appointment)}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedAppointment(appointment);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                                                >
                                                    <EyeIcon size={14} className="mr-1" />
                                                    View Full Details
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })) : (
                                    <div className="text-center py-12">
                                        <CalendarDaysIcon className="mx-auto h-12 w-12 text-slate-400" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No appointments found</h3>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            Try adjusting your search filters or check back later.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {appointments.last_page > 1 && (
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            Showing {appointments.from} to {appointments.to} of {appointments.total} results
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {appointments.current_page > 1 && (
                                            <Link
                                                href={`/vendor/appointments/details?page=${appointments.current_page - 1}`}
                                                className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                                            >
                                                <ArrowLeftIcon size={16} className="mr-1" />
                                                Previous
                                            </Link>
                                        )}
                                        
                                        {Array.from({ length: Math.min(5, appointments.last_page) }, (_, i) => {
                                            const page = i + 1;
                                            return (
                                                <Link
                                                    key={page}
                                                    href={`/vendor/appointments/details?page=${page}`}
                                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                                        page === appointments.current_page
                                                            ? 'bg-blue-600 text-white'
                                                            : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    {page}
                                                </Link>
                                            );
                                        })}

                                        {appointments.current_page < appointments.last_page && (
                                            <Link
                                                href={`/vendor/appointments/details?page=${appointments.current_page + 1}`}
                                                className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                                            >
                                                Next
                                                <ArrowRightIcon size={16} className="ml-1" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Full Details Modal */}
            {selectedAppointment && isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    Complete Appointment Details
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    <XCircleIcon size={16} />
                                </Button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Basic Appointment Information */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <CalendarIcon size={18} className="mr-2 text-blue-500" />
                                    Appointment Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Appointment Number
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                                            #{selectedAppointment.appointment_number}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service Type
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.is_home_service ? 'Home Service' : 'In-Store Service'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service Name
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.service_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service Description
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.service?.description || selectedAppointment.service_description || 'No description available'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </label>
                                        <p className="mt-1">
                                            <Badge className={statusConfig[selectedAppointment.status].color}>
                                                {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1).replace('_', ' ')}
                                            </Badge>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Business Type
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.vendor_store?.business_type || 'General'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Timing Information */}
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <Clock size={18} className="mr-2 text-green-500" />
                                    Schedule & Timing
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Appointment Date
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1 flex items-center">
                                            <CalendarIcon size={14} className="mr-2 text-green-500" />
                                            {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Appointment Time
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1 flex items-center">
                                            <Clock size={14} className="mr-2 text-green-500" />
                                            {formatTime(selectedAppointment.appointment_time)}
                                            {selectedAppointment.estimated_end_time && ` - ${formatTime(selectedAppointment.estimated_end_time)}`}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Duration
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.duration_minutes ? `${selectedAppointment.duration_minutes} minutes` : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service ID
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                                            {selectedAppointment.service_id || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Information */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <Store size={18} className="mr-2 text-purple-500" />
                                    Vendor Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Vendor Store
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.vendor_store?.business_name || 'Not assigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Store Type
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.vendor_store?.business_type || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Store Contact
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.vendor_store?.contact_phone || 'No phone available'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Store Address
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.vendor_store?.address || 'No address available'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rider Information - Always Show */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <Bike size={18} className="mr-2 text-yellow-500" />
                                    Rider Information
                                </h4>
                                {selectedAppointment.rider ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider Name
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {selectedAppointment.rider.name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider Email
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {selectedAppointment.rider.email}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider Phone
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {selectedAppointment.rider.phone || 'No phone available'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Vehicle Type
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {selectedAppointment.rider.vehicle_type || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                License Number
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {selectedAppointment.rider.license_number || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider Status
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {selectedAppointment.rider.status || 'Active'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            No rider assigned to this appointment yet.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Customer Information */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <User size={18} className="mr-2 text-indigo-500" />
                                    Customer Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Customer Name
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.customer_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Customer Email
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.customer_email}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Customer Phone
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.customer_phone}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Customer Address
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.customer_address || 'No address provided'}
                                        </p>
                                    </div>
                                    {selectedAppointment.emergency_contact_name && (
                                        <>
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Emergency Contact
                                                </label>
                                                <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                    {selectedAppointment.emergency_contact_name}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Emergency Phone
                                                </label>
                                                <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                    {selectedAppointment.emergency_contact_phone}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Service Location (if home service) */}
                            {selectedAppointment.is_home_service && selectedAppointment.service_address && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <MapPinIcon size={18} className="mr-2 text-emerald-500" />
                                        Service Location
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Service Type
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                Home Service
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Service Address
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {selectedAppointment.service_address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Information */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <CreditCardIcon size={18} className="mr-2 text-orange-500" />
                                    Payment Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service Price
                                        </label>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                                            {formatCurrency(selectedAppointment.service_price || 0, selectedAppointment.currency)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Total Amount
                                        </label>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                                            {formatCurrency(selectedAppointment.total_amount, selectedAppointment.currency)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Payment Status
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            <Badge className={
                                                selectedAppointment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                selectedAppointment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }>
                                                {selectedAppointment.payment_status.charAt(0).toUpperCase() + selectedAppointment.payment_status.slice(1)}
                                            </Badge>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Payment Method
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {selectedAppointment.payment_method || 'Not specified'}
                                        </p>
                                    </div>
                                    {selectedAppointment.additional_charges && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Additional Charges
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {formatCurrency(selectedAppointment.additional_charges, selectedAppointment.currency)}
                                            </p>
                                        </div>
                                    )}
                                    {selectedAppointment.discount_amount && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Discount Applied
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                -{formatCurrency(selectedAppointment.discount_amount, selectedAppointment.currency)}
                                            </p>
                                        </div>
                                    )}
                                    {selectedAppointment.payment_reference && (
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Payment Reference
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                                                {selectedAppointment.payment_reference}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Tracking */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <Activity size={18} className="mr-2 text-slate-500" />
                                    Status Tracking
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Created At
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {new Date(selectedAppointment.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Last Updated
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {new Date(selectedAppointment.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {selectedAppointment.confirmed_at && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Confirmed At
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {new Date(selectedAppointment.confirmed_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {selectedAppointment.started_at && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Started At
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {new Date(selectedAppointment.started_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {selectedAppointment.completed_at && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Completed At
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {new Date(selectedAppointment.completed_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {selectedAppointment.cancelled_at && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Cancelled At
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {new Date(selectedAppointment.cancelled_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {selectedAppointment.cancellation_reason && (
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Cancellation Reason
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded border">
                                                {selectedAppointment.cancellation_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ratings & Feedback */}
                            {(selectedAppointment.customer_rating || selectedAppointment.customer_feedback) && (
                                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <StarIcon size={18} className="mr-2 text-pink-500" />
                                        Customer Feedback
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedAppointment.customer_rating && (
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Customer Rating
                                                </label>
                                                <div className="flex items-center mt-1">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white mr-2">
                                                        {selectedAppointment.customer_rating}/5
                                                    </span>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon
                                                                key={i}
                                                                size={14}
                                                                className={i < (selectedAppointment.customer_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedAppointment.customer_feedback && (
                                            <div className="md:col-span-2">
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Customer Feedback
                                                </label>
                                                <p className="text-sm text-slate-900 dark:text-white mt-1 p-3 bg-white dark:bg-slate-600 rounded border italic">
                                                    "{selectedAppointment.customer_feedback}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Requirements */}
                            {selectedAppointment.requirements && selectedAppointment.requirements.length > 0 && (
                                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <AlertCircleIcon size={18} className="mr-2 text-cyan-500" />
                                        Special Requirements
                                    </h4>
                                    <ul className="space-y-1">
                                        {selectedAppointment.requirements.map((req, index) => (
                                            <li key={index} className="text-sm text-slate-900 dark:text-white flex items-start">
                                                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Customer Notes */}
                            {(selectedAppointment.internal_notes || selectedAppointment.customer_notes) && (
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <MessageSquareIcon size={18} className="mr-2 text-slate-500" />
                                        Notes
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedAppointment.customer_notes && (
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Customer Notes
                                                </label>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 p-3 bg-white dark:bg-slate-600 rounded border">
                                                    {selectedAppointment.customer_notes}
                                                </p>
                                            </div>
                                        )}
                                        {selectedAppointment.internal_notes && (
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Internal Notes
                                                </label>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 p-3 bg-white dark:bg-slate-600 rounded border">
                                                    {selectedAppointment.internal_notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notification Preferences */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <Bell size={18} className="mr-2 text-indigo-500" />
                                    Notification Preferences
                                </h4>
                                <div className="flex space-x-6">
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded border-2 mr-2 ${
                                            selectedAppointment.email_notifications 
                                                ? 'bg-indigo-500 border-indigo-500' 
                                                : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                            {selectedAppointment.email_notifications && (
                                                <CheckCircleIcon size={12} className="text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm text-slate-900 dark:text-white">Email Notifications</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded border-2 mr-2 ${
                                            selectedAppointment.sms_notifications 
                                                ? 'bg-indigo-500 border-indigo-500' 
                                                : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                            {selectedAppointment.sms_notifications && (
                                                <CheckCircleIcon size={12} className="text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm text-slate-900 dark:text-white">SMS Notifications</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </VendorLayout>
    );
}