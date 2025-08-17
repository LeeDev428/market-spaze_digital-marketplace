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
    ArrowLeft,
    UserCheck,
    Building,
    Mail,
    CreditCard,
    Star,
    MessageSquare,
    Truck,
    FileText,
    Navigation,
    Building2,
    Shield,
    Bell,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface VendorStore {
    id: number;
    store_name?: string;
    business_name: string;
    business_type: string;
    store_address: string;
    store_phone?: string;
    contact_phone?: string;
    contact_email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
}

interface Service {
    id: number;
    service_name: string;
    service_description?: string;
    category?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

interface Rider {
    id: number;
    name: string;
    email: string;
    phone?: string;
    vehicle_type?: string;
    license_number?: string;
    status?: string;
}

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
    service_name?: string;
    service_id?: number;
    appointment_date: string;
    appointment_time: string;
    estimated_end_time?: string;
    duration_minutes?: number;
    service_price?: number;
    total_amount?: number;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    customer_notes?: string;
    requirements?: string[];
    is_home_service: boolean;
    service_address?: string;
    payment_status?: string;
    payment_method?: string;
    payment_reference?: string;
    sms_notifications?: boolean;
    email_notifications?: boolean;
    customer_rating?: number;
    customer_feedback?: string;
    confirmed_at?: string;
    started_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    created_at?: string;
    updated_at?: string;
    rider_id?: number;
    vendor_store?: VendorStore;
    service?: Service;
    user?: User;
    rider?: Rider;
}

interface Props {
    appointment: Appointment;
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

export default function AppointmentDetailsActiveDeliveries({ appointment, rider }: Props) {
    const [isUpdating, setIsUpdating] = useState(false);

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
                return <Clock size={20} />;
            case 'confirmed':
                return <CheckCircle size={20} />;
            case 'in_progress':
                return <Timer size={20} />;
            case 'completed':
                return <CheckCircle size={20} />;
            case 'cancelled':
                return <XCircle size={20} />;
            default:
                return <AlertTriangle size={20} />;
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
                return time; // Return original if parsing fails
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
                return date; // Return original if invalid
            }
            
            return dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return date || 'Invalid Date';
        }
    };

    const formatDateTime = (date: string, time?: string) => {
        try {
            if (!date) return 'Invalid Date';
            
            // Handle if date already contains full datetime like '2025-08-14T19:30:00.000000Z'
            if (date.includes('T') && !time) {
                const dateTime = new Date(date);
                if (isNaN(dateTime.getTime())) {
                    return date;
                }
                return dateTime.toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
            
            // Handle separate date and time
            if (!time) {
                const dateObj = new Date(date);
                if (isNaN(dateObj.getTime())) {
                    return date;
                }
                return dateObj.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            
            // Handle time that's also in full datetime format
            let timeToUse = time;
            if (time.includes('T')) {
                const timeDate = new Date(time);
                if (!isNaN(timeDate.getTime())) {
                    return timeDate.toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });
                }
            }
            
            const dateTime = new Date(`${date}T${timeToUse}`);
            if (isNaN(dateTime.getTime())) {
                return `${date} ${timeToUse}`;
            }
            
            return dateTime.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return date || 'Invalid Date';
        }
    };

    const updateStatus = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/rider/deliveries/${appointment.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error('Failed to update status');
                alert('Failed to update appointment status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('An error occurred while updating the appointment status.');
        } finally {
            setIsUpdating(false);
        }
    };

    const getJob = async () => {
        setIsUpdating(true);
        try {
            router.get(`/rider/deliveries/${appointment.id}/get`);
        } catch (error) {
            console.error('Error getting job:', error);
            alert('An error occurred while getting the job.');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return '₱0.00';
        return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins} minutes`;
    };

    const getServiceLocation = () => {
        if (appointment.is_home_service) {
            return appointment.service_address || appointment.customer_address || 'Service address not available';
        }
        return appointment.vendor_store?.store_address || appointment.vendor_store?.address || 'Store address not available';
    };

    return (
        <RiderLayout>
            <Head title={`Appointment #${appointment.appointment_number}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/rider/deliveries/all"
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Back to All Appointments
                            </Link>
                            <div className="border-l border-blue-300 h-6"></div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Appointment #{appointment.appointment_number}
                                </h1>
                                <p className="text-blue-100">
                                    Detailed information and management options
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 border-white/20 bg-white/10 backdrop-blur-sm`}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-2 capitalize">{appointment.status.replace('_', ' ')}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Appointment Overview */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <Calendar size={20} className="mr-2 text-blue-500" />
                                Appointment Overview
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Appointment Date & Time
                                        </label>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
                                        </p>
                                    </div>
                                    
                                    {appointment.estimated_end_time && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Estimated End Time
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {formatTime(appointment.estimated_end_time)}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Duration
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {appointment.duration_minutes} minutes
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Service Type
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {appointment.is_home_service ? 'Home Service' : 'Store Visit'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Service Price
                                        </label>
                                        <p className="text-lg font-semibold text-green-600">
                                            ₱{appointment.service_price?.toLocaleString()}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Total Amount
                                        </label>
                                        <p className="text-xl font-bold text-green-600">
                                            ₱{appointment.total_amount?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <Package size={20} className="mr-2 text-purple-500" />
                                Service Details
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Service Name
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {appointment.service?.service_name || appointment.service_name || 'Service information not available'}
                                    </p>
                                </div>
                                
                                {appointment.service?.category && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Category
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {appointment.service.category}
                                        </p>
                                    </div>
                                )}
                                
                                {appointment.service?.service_description && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {appointment.service.service_description}
                                        </p>
                                    </div>
                                )}

                                {appointment.service_id && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Service ID
                                        </label>
                                        <p className="text-gray-900 dark:text-white font-mono">
                                            {appointment.service_id}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Complete Appointment Information */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <Calendar size={20} className="mr-2 text-blue-500" />
                                Complete Appointment Information
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Appointment Number
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                                        #{appointment.appointment_number}
                                    </p>
                                </div>
                                
                                {appointment.emergency_contact_name && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Emergency Contact
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {appointment.emergency_contact_name}
                                            {appointment.emergency_contact_phone && ` - ${appointment.emergency_contact_phone}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assigned Rider Information */}
                        {appointment.rider && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <UserCheck size={20} className="mr-2 text-yellow-500" />
                                    Assigned Rider Information
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Rider Name
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {appointment.rider.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Rider Email
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {appointment.rider.email}
                                        </p>
                                    </div>
                                    {appointment.rider.phone && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Rider Phone
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {appointment.rider.phone}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.rider.vehicle_type && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Vehicle Type
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {appointment.rider.vehicle_type}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.rider.license_number && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                License Number
                                            </label>
                                            <p className="text-gray-900 dark:text-white font-mono">
                                                {appointment.rider.license_number}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.rider.status && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Rider Status
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {appointment.rider.status}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pricing Details */}
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <TrendingUp size={20} className="mr-2 text-orange-500" />
                                Pricing Details
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Service Price
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(appointment.service_price)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total Amount
                                    </label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(appointment.total_amount)}
                                    </p>
                                </div>
                                
                                {appointment.payment_status && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Payment Status
                                        </label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            appointment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                            appointment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                                        </span>
                                    </div>
                                )}
                                
                                {appointment.payment_method && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Payment Method
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {appointment.payment_method}
                                        </p>
                                    </div>
                                )}
                                
                                {appointment.payment_reference && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Payment Reference
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white font-mono">
                                            {appointment.payment_reference}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Tracking */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <Clock size={20} className="mr-2 text-slate-500" />
                                Status Tracking
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {appointment.created_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Created At
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {new Date(appointment.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                
                                {appointment.updated_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Last Updated
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {new Date(appointment.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                
                                {appointment.confirmed_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Confirmed At
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {new Date(appointment.confirmed_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                
                                {appointment.started_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Started At
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {new Date(appointment.started_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                
                                {appointment.completed_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Completed At
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {new Date(appointment.completed_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                
                                {appointment.cancelled_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Cancelled At
                                        </label>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {new Date(appointment.cancelled_at).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {appointment.cancellation_reason && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Cancellation Reason
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white p-3 bg-red-50 dark:bg-red-900/20 rounded border">
                                        {appointment.cancellation_reason}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Ratings & Feedback */}
                        {(appointment.customer_rating || appointment.customer_feedback) && (
                            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Star size={20} className="mr-2 text-pink-500" />
                                    Customer Feedback
                                </h3>
                                
                                <div className="space-y-4">
                                    {appointment.customer_rating && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Customer Rating
                                            </label>
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                                                    {appointment.customer_rating}/5
                                                </span>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={i < (appointment.customer_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {appointment.customer_feedback && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Customer Feedback
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-white p-3 bg-white dark:bg-gray-600 rounded border italic">
                                                "{appointment.customer_feedback}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Requirements */}
                        {appointment.requirements && appointment.requirements.length > 0 && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <AlertCircle size={20} className="mr-2 text-purple-500" />
                                    Special Requirements
                                </h3>
                                
                                <ul className="space-y-2">
                                    {appointment.requirements.map((req, index) => (
                                        <li key={index} className="text-sm text-gray-900 dark:text-white flex items-start">
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Internal Notes */}
                        {appointment.notes && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <FileText size={20} className="mr-2 text-gray-500" />
                                    Internal Notes
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed p-3 bg-white dark:bg-gray-600 rounded border">
                                    {appointment.notes}
                                </p>
                            </div>
                        )}

                        {/* Notification Preferences */}
                        {(appointment.sms_notifications !== undefined || appointment.email_notifications !== undefined) && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Bell size={20} className="mr-2 text-indigo-500" />
                                    Notification Preferences
                                </h3>
                                
                                <div className="flex space-x-6">
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded border-2 mr-2 ${
                                            appointment.email_notifications 
                                                ? 'bg-indigo-500 border-indigo-500' 
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                            {appointment.email_notifications && (
                                                <CheckCircle size={12} className="text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-900 dark:text-white">Email Notifications</span>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded border-2 mr-2 ${
                                            appointment.sms_notifications 
                                                ? 'bg-indigo-500 border-indigo-500' 
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                            {appointment.sms_notifications && (
                                                <CheckCircle size={12} className="text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-900 dark:text-white">SMS Notifications</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Customer Notes */}
                        {appointment.customer_notes && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                                    <MessageSquare size={20} className="mr-2" />
                                    Customer Notes
                                </h3>
                                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                                    {appointment.customer_notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Actions
                            </h3>
                            
                            <div className="space-y-3">
                                {appointment.status === 'confirmed' && !appointment.rider_id && (
                                    <button
                                        onClick={getJob}
                                        disabled={isUpdating}
                                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <UserCheck size={18} className="mr-2" />
                                        {isUpdating ? 'Getting Book...' : 'Get This Book'}
                                    </button>
                                )}

                                {appointment.status === 'in_progress' && appointment.rider_id === rider?.id && (
                                    <button
                                        onClick={() => updateStatus('completed')}
                                        disabled={isUpdating}
                                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <CheckCircle size={18} className="mr-2" />
                                        {isUpdating ? 'Updating...' : 'Mark as Completed'}
                                    </button>
                                )}

                                <a
                                    href={`tel:${appointment.customer_phone}`}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Phone size={18} className="mr-2" />
                                    Call Customer
                                </a>

                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(getServiceLocation())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Navigation size={18} className="mr-2" />
                                    Get Directions
                                </a>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <User size={20} className="mr-2 text-green-500" />
                                Customer Information
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {appointment.customer_name}
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone
                                    </label>
                                    <a 
                                        href={`tel:${appointment.customer_phone}`}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        {appointment.customer_phone}
                                    </a>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <a 
                                        href={`mailto:${appointment.customer_email}`}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        {appointment.customer_email}
                                    </a>
                                </div>
                                
                                {appointment.customer_address && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Address
                                        </label>
                                        <p className="text-gray-900 dark:text-white leading-relaxed">
                                            {appointment.customer_address}
                                        </p>
                                    </div>
                                )}
                                
                                {appointment.customer_city && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            City
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {appointment.customer_city}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <MapPin size={20} className="mr-2 text-red-500" />
                                Service Location
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Address
                                    </label>
                                    <p className="text-gray-900 dark:text-white leading-relaxed">
                                        {getServiceLocation()}
                                    </p>
                                </div>
                                
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(getServiceLocation())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    <Navigation size={16} className="mr-1" />
                                    View on Google Maps
                                </a>
                            </div>
                        </div>

                        {/* Vendor Store Information */}
                        {appointment.vendor_store && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Building2 size={20} className="mr-2 text-orange-500" />
                                    Vendor Store
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Business Name
                                        </label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {appointment.vendor_store.business_name || appointment.vendor_store.store_name}
                                        </p>
                                    </div>
                                    
                                    {appointment.vendor_store.business_type && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Business Type
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {appointment.vendor_store.business_type}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {(appointment.vendor_store.store_phone || appointment.vendor_store.contact_phone) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Store Phone
                                            </label>
                                            <a 
                                                href={`tel:${appointment.vendor_store.store_phone || appointment.vendor_store.contact_phone}`}
                                                className="text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                {appointment.vendor_store.store_phone || appointment.vendor_store.contact_phone}
                                            </a>
                                        </div>
                                    )}
                                    
                                    {appointment.vendor_store.contact_email && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Store Email
                                            </label>
                                            <a 
                                                href={`mailto:${appointment.vendor_store.contact_email}`}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                {appointment.vendor_store.contact_email}
                                            </a>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Store Address
                                        </label>
                                        <p className="text-gray-900 dark:text-white leading-relaxed">
                                            {appointment.vendor_store.store_address || appointment.vendor_store.address}
                                            {appointment.vendor_store.city && `, ${appointment.vendor_store.city}`}
                                            {appointment.vendor_store.state && `, ${appointment.vendor_store.state}`}
                                            {appointment.vendor_store.zip_code && ` ${appointment.vendor_store.zip_code}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RiderLayout>
    );
}
