import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Calendar as CalendarIcon,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Eye,
    Phone,
    Mail,
    MessageSquare,
    MapPin,
    Shield,
    X,
    Bell,
    Star,
    Store,
    CreditCard,
    Activity,
    Bike,
    User
} from 'lucide-react';

// Enhanced interface for appointment history
interface AppointmentHistory {
    id: number;
    appointment_number?: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    total_amount?: number;
    customer_rating?: number;
    customer_feedback?: string;
    created_at: string;
    vendor_store_name?: string;
}

// Enhanced Appointment interface with ALL database columns
interface Appointment {
    id: number;
    appointment_number?: string;
    
    // Customer Information
    user_id?: number;
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
    
    // Service Information (from relationships)
    service_name: string;
    service_price?: number;
    additional_charges?: number;
    discount_amount?: number;
    total_amount?: number;
    currency?: string;
    
    // Booking Requirements
    requirements?: string[];
    customer_notes?: string;
    internal_notes?: string;
    notes?: string; // Legacy field
    
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
    sms_notifications?: boolean;
    email_notifications?: boolean;
    reminder_sent_at?: string;
    notification_log?: any;
    
    // Rating & Feedback
    customer_rating?: number;
    customer_feedback?: string;
    feedback_submitted_at?: string;
    
    // Payment Integration
    payment_status?: string;
    payment_method?: string;
    payment_reference?: string;
    payment_completed_at?: string;
    
    // Location & Weather
    is_home_service?: boolean;
    service_address?: string;
    weather_conditions?: string;
    
    // Timestamps
    created_at?: string;
    updated_at?: string;
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

interface EnhancedAppointmentModalProps {
    appointment: Appointment | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: (appointmentId: number, status: string) => void;
    onCancel?: (appointmentId: number, status: string) => void;
    showActions?: boolean; // Whether to show action buttons (for vendor vs customer view)
    initialTab?: 'details' | 'history'; // Initial tab to show
    showHistoryTab?: boolean; // Whether to show the customer history tab (default: true)
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', 
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    rescheduled: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
};

const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    in_progress: TrendingUp,
    completed: CheckCircle,
    cancelled: XCircle,
    no_show: AlertCircle,
    rescheduled: Clock
};

export default function EnhancedAppointmentModal({ 
    appointment, 
    isOpen, 
    onClose, 
    onConfirm, 
    onCancel, 
    showActions = false,
    initialTab = 'details',
    showHistoryTab = true
}: EnhancedAppointmentModalProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'history'>(initialTab);
    const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Reset tab when modal opens with new appointment
    useEffect(() => {
        if (isOpen && appointment) {
            setActiveTab(initialTab);
        }
    }, [isOpen, appointment, initialTab]);

    // Fetch appointment history when modal opens
    useEffect(() => {
        if (isOpen && appointment) {
            fetchAppointmentHistory();
        }
    }, [isOpen, appointment]);

    const fetchAppointmentHistory = async () => {
        if (!appointment) return;
        
        setHistoryLoading(true);
        try {
            const response = await fetch(`/api/appointments/user-history/${appointment.customer_email}`);
            if (response.ok) {
                const data = await response.json();
                setAppointmentHistory(data.appointments || []);
            }
        } catch (error) {
            console.error('Error fetching appointment history:', error);
            setAppointmentHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    if (!isOpen || !appointment) return null;

    const StatusIcon = statusIcons[appointment.status] || AlertCircle;

    const formatCurrency = (amount?: number) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
        }
        return `${mins}m`;
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'no_show': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'rescheduled': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold">Appointment Details</h3>
                            {appointment.appointment_number && (
                                <p className="text-purple-100 text-sm mt-1">
                                    Reference: #{appointment.appointment_number}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-slate-200 dark:border-slate-600">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-6 py-3 font-medium text-sm transition-colors ${
                                activeTab === 'details'
                                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Eye size={16} className="mr-2 inline" />
                            Appointment Details
                        </button>
                        {showHistoryTab && (
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-6 py-3 font-medium text-sm transition-colors ${
                                    activeTab === 'history'
                                        ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                <Clock size={16} className="mr-2 inline" />
                                Customer History ({appointmentHistory.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6 space-y-6">
                    {activeTab === 'details' ? (
                        <>
                            {/* Customer Information */}
                            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                                    <Users size={18} className="mr-2 text-purple-500" />
                                    Customer Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Full Name
                                        </label>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                                            {appointment.customer_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Phone Number
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1 flex items-center">
                                            <Phone size={14} className="mr-2 text-purple-500" />
                                            {appointment.customer_phone}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Email Address
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1 flex items-center">
                                            <Mail size={14} className="mr-2 text-purple-500" />
                                            {appointment.customer_email}
                                        </p>
                                    </div>
                                    {appointment.customer_address && (
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Address
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1 flex items-center">
                                                <MapPin size={14} className="mr-2 text-purple-500" />
                                                {appointment.customer_address}
                                                {appointment.customer_city && `, ${appointment.customer_city}`}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.emergency_contact_name && (
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Emergency Contact
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1 flex items-center">
                                                <Shield size={14} className="mr-2 text-purple-500" />
                                                {appointment.emergency_contact_name}
                                                {appointment.emergency_contact_phone && ` - ${appointment.emergency_contact_phone}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

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
                                            #{appointment.appointment_number}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service Type
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.is_home_service ? 'Home Service' : 'In-Store Service'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service Name
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.service_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service Description
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.service?.description || 'No description available'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </label>
                                        <p className="mt-1">
                                            <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                                                {React.createElement(statusIcons[appointment.status as keyof typeof statusIcons], { size: 12, className: "mr-1" })}
                                                {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                                            </Badge>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Business Type
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.vendor_store?.business_type || 'General'}
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
                                            {new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
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
                                            {formatTime(appointment.appointment_time)}
                                            {appointment.estimated_end_time && ` - ${formatTime(appointment.estimated_end_time)}`}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Duration
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.duration_minutes ? `${appointment.duration_minutes} minutes` : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service ID
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                                            {appointment.service_id || 'N/A'}
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
                                            {appointment.vendor_store?.business_name || 'Not assigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Store Type
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.vendor_store?.business_type || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Store Contact
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.vendor_store?.contact_phone || 'No phone available'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Store Address
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.vendor_store?.address || 'No address available'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rider Information */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <Bike size={18} className="mr-2 text-yellow-500" />
                                    Rider Information
                                </h4>
                                {appointment.rider ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider Name
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.rider.name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider Email
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.rider.email}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider Phone
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.rider.phone || 'No phone available'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider ID
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                                                {appointment.rider.rider_id}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Vehicle Type
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.rider.vehicle_type || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                License Number
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.rider.license_number || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider Status
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                <Badge className={
                                                    appointment.rider.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    appointment.rider.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }>
                                                    {appointment.rider.status ? (appointment.rider.status.charAt(0).toUpperCase() + appointment.rider.status.slice(1)) : 'Unknown'}
                                                </Badge>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Rider Rating
                                            </label>
                                            <div className="flex items-center mt-1">
                                                {appointment.rider.rating ? (
                                                    <>
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white mr-2">
                                                            {appointment.rider.rating}/5
                                                        </span>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    className={i < (appointment.rider?.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                                                />
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">No rating yet</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                                        <Bike size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No Rider Assigned</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">This appointment does not have a rider assigned yet.</p>
                                        {appointment.rider_id && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                Rider ID: <span className="font-mono">{appointment.rider_id}</span>
                                            </p>
                                        )}
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
                                            {appointment.customer_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Customer Email
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.customer_email}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Customer Phone
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.customer_phone}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Customer Address
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.customer_address || 'No address provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Location (if home service) */}
                            {appointment.is_home_service && appointment.service_address && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <MapPin size={18} className="mr-2 text-emerald-500" />
                                        Service Location
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Service Type
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.is_home_service ? 'Home Service' : 'In-Store Service'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Service Address
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.service_address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Information */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <CreditCard size={18} className="mr-2 text-orange-500" />
                                    Payment Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Service Price
                                        </label>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                                            {formatCurrency(appointment.service_price || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Total Amount
                                        </label>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                                            {formatCurrency(appointment.total_amount || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Payment Status
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            <Badge className={
                                                appointment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                appointment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }>
                                                {appointment.payment_status ? (appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)) : 'Unknown'}
                                            </Badge>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Payment Method
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.payment_method || 'Not specified'}
                                        </p>
                                    </div>
                                    {appointment.payment_reference && (
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Payment Reference
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                                                {appointment.payment_reference}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <AlertCircle size={18} className="mr-2 text-teal-500" />
                                    Additional Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Vendor Store ID
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                                            {appointment.vendor_store_id}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Rider ID (Database)
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                                            {appointment.rider_id || 'Not assigned'}
                                        </p>
                                    </div>
                                    {appointment.additional_charges && appointment.additional_charges > 0 && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Additional Charges
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {formatCurrency(appointment.additional_charges)}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.discount_amount && appointment.discount_amount > 0 && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Discount Amount
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1 text-green-600">
                                                -{formatCurrency(appointment.discount_amount)}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.currency && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Currency
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.currency}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.weather_conditions && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Weather Conditions
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.weather_conditions}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.emergency_contact_name && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Emergency Contact
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.emergency_contact_name}
                                                {appointment.emergency_contact_phone && (
                                                    <span className="text-slate-500 dark:text-slate-400 ml-1">
                                                        ({appointment.emergency_contact_phone})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.customer_city && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Customer City
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.customer_city}
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
                                            {appointment.created_at ? new Date(appointment.created_at).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Last Updated
                                        </label>
                                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                                            {appointment.updated_at ? new Date(appointment.updated_at).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    {appointment.confirmed_at && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Confirmed At
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {new Date(appointment.confirmed_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.started_at && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Started At
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {new Date(appointment.started_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.completed_at && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Completed At
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {new Date(appointment.completed_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.cancelled_at && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Cancelled At
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {new Date(appointment.cancelled_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    {appointment.cancellation_reason && (
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Cancellation Reason
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded border">
                                                {appointment.cancellation_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ratings & Feedback */}
                            {(appointment.customer_rating || appointment.customer_feedback) && (
                                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <Star size={18} className="mr-2 text-pink-500" />
                                        Ratings & Feedback
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {appointment.customer_rating && (
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Customer Rating
                                                </label>
                                                <div className="flex items-center mt-1">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white mr-2">
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
                                            <div className="md:col-span-2">
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Customer Feedback
                                                </label>
                                                <p className="text-sm text-slate-900 dark:text-white mt-1 p-3 bg-white dark:bg-slate-600 rounded border italic">
                                                    "{appointment.customer_feedback}"
                                                </p>
                                            </div>
                                        )}
                                        {appointment.feedback_submitted_at && (
                                            <div className="md:col-span-2">
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Feedback Submitted At
                                                </label>
                                                <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                    {new Date(appointment.feedback_submitted_at).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Requirements */}
                            {appointment.requirements && appointment.requirements.length > 0 && (
                                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <AlertCircle size={18} className="mr-2 text-cyan-500" />
                                        Special Requirements
                                    </h4>
                                    <ul className="space-y-1">
                                        {appointment.requirements.map((req, index) => (
                                            <li key={index} className="text-sm text-slate-900 dark:text-white flex items-start">
                                                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Customer Notes */}
                            {(appointment.notes || appointment.customer_notes) && (
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <MessageSquare size={18} className="mr-2 text-slate-500" />
                                        Notes
                                    </h4>
                                    <div className="space-y-3">
                                        {appointment.customer_notes && (
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Customer Notes
                                                </label>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 p-3 bg-white dark:bg-slate-600 rounded border">
                                                    {appointment.customer_notes}
                                                </p>
                                            </div>
                                        )}
                                        {appointment.notes && (
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Internal Notes
                                                </label>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 p-3 bg-white dark:bg-slate-600 rounded border">
                                                    {appointment.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notification Preferences */}
                            {(appointment.sms_notifications !== undefined || appointment.email_notifications !== undefined) && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <Bell size={18} className="mr-2 text-indigo-500" />
                                        Notification Preferences
                                    </h4>
                                    <div className="flex space-x-6">
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded border-2 mr-2 ${
                                                appointment.email_notifications 
                                                    ? 'bg-indigo-500 border-indigo-500' 
                                                    : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                                {appointment.email_notifications && (
                                                    <CheckCircle size={12} className="text-white" />
                                                )}
                                            </div>
                                            <span className="text-sm text-slate-900 dark:text-white">Email Notifications</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded border-2 mr-2 ${
                                                appointment.sms_notifications 
                                                    ? 'bg-indigo-500 border-indigo-500' 
                                                    : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                                {appointment.sms_notifications && (
                                                    <CheckCircle size={12} className="text-white" />
                                                )}
                                            </div>
                                            <span className="text-sm text-slate-900 dark:text-white">SMS Notifications</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* History Tab Content */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center">
                                    <Clock size={18} className="mr-2 text-purple-500" />
                                    Customer Appointment History
                                </h4>
                                <Badge variant="secondary">
                                    {appointmentHistory.length} Total Appointments
                                </Badge>
                            </div>

                            {historyLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                </div>
                            ) : appointmentHistory.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {appointmentHistory.map((historyItem) => (
                                        <div key={historyItem.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-purple-500">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h5 className="font-medium text-slate-900 dark:text-white">
                                                            {historyItem.service_name}
                                                        </h5>
                                                        <Badge className={getStatusColor(historyItem.status)}>
                                                            {historyItem.status.charAt(0).toUpperCase() + historyItem.status.slice(1)}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-slate-500 dark:text-slate-400">Date: </span>
                                                            <span className="text-slate-900 dark:text-white">
                                                                {new Date(historyItem.appointment_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 dark:text-slate-400">Time: </span>
                                                            <span className="text-slate-900 dark:text-white">
                                                                {formatTime(historyItem.appointment_time)}
                                                            </span>
                                                        </div>
                                                        {historyItem.total_amount && (
                                                            <div>
                                                                <span className="text-slate-500 dark:text-slate-400">Amount: </span>
                                                                <span className="text-slate-900 dark:text-white font-medium">
                                                                    {formatCurrency(historyItem.total_amount)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="text-slate-500 dark:text-slate-400">Ref: </span>
                                                            <span className="text-slate-900 dark:text-white text-xs">
                                                                #{historyItem.appointment_number || historyItem.id}
                                                            </span>
                                                        </div>
                                                        {historyItem.vendor_store_name && (
                                                            <div className="col-span-2">
                                                                <span className="text-slate-500 dark:text-slate-400">Store: </span>
                                                                <span className="text-slate-900 dark:text-white text-sm">
                                                                    {historyItem.vendor_store_name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {historyItem.customer_rating && (
                                                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Star size={14} className="text-yellow-500" />
                                                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                                    {historyItem.customer_rating}/5 Rating
                                                                </span>
                                                            </div>
                                                            {historyItem.customer_feedback && (
                                                                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                                                                    "{historyItem.customer_feedback}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CalendarIcon size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                    <h5 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                        No Previous Appointments
                                    </h5>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        This is the customer's first appointment with us.
                                    </p>
                                </div>
                            )}

                            {appointmentHistory.length > 0 && (
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mt-4">
                                    <h5 className="font-medium text-slate-900 dark:text-white mb-3">Customer Summary</h5>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                {appointmentHistory.length}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Total Visits</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {appointmentHistory.filter(h => h.status === 'completed').length}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Completed</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                {appointmentHistory.filter(h => h.customer_rating).length > 0 
                                                    ? (appointmentHistory.filter(h => h.customer_rating).reduce((sum, h) => sum + (h.customer_rating || 0), 0) / appointmentHistory.filter(h => h.customer_rating).length).toFixed(1)
                                                    : 'N/A'
                                                }
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Avg Rating</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-6 border-t border-slate-200 dark:border-slate-600">
                        {showActions && onConfirm && onCancel && (
                            <>
                                {appointment.status === 'pending' && (
                                    <>
                                        <Button
                                            onClick={() => {
                                                onConfirm(appointment.id, 'confirmed');
                                                onClose();
                                            }}
                                            className="flex-1"
                                            variant="default"
                                        >
                                            <CheckCircle size={16} className="mr-2" />
                                            Confirm Appointment
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                onCancel(appointment.id, 'cancelled');
                                                onClose();
                                            }}
                                            className="flex-1"
                                            variant="destructive"
                                        >
                                            <XCircle size={16} className="mr-2" />
                                            Cancel Appointment
                                        </Button>
                                    </>
                                )}
                                
                                {appointment.status === 'confirmed' && (
                                    <Button
                                        onClick={() => {
                                            onConfirm(appointment.id, 'completed');
                                            onClose();
                                        }}
                                        className="flex-1"
                                        variant="default"
                                    >
                                        <CheckCircle size={16} className="mr-2" />
                                        Mark as Complete
                                    </Button>
                                )}
                            </>
                        )}

                        <Button
                            onClick={onClose}
                            variant="outline"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
