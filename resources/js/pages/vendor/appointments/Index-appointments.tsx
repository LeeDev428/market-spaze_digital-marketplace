import React, { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import VendorLayout from '@/layouts/app/VendorLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
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
    Star,  // Add this import
    Building2
} from 'lucide-react';

interface AppointmentCount {
    date: string;
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
}

interface Stats {
    today: number;
    this_week: number;
    this_month: number;
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
}

interface Props {
    appointmentCounts: AppointmentCount[];
    recentAppointments: Appointment[];
    stats: Stats;
    vendorStore: any;
}

// First, let's add the missing interface at the top of the file
interface AppointmentDetailsModalProps {
    appointment: Appointment | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (appointmentId: number, status: string) => void;
    onCancel: (appointmentId: number, status: string) => void;
    initialTab?: 'details' | 'history';
}

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
}

// Enhanced Appointment interface with more comprehensive fields
interface VendorStore {
    id: number;
    name: string;
    store_type: string;
    phone: string;
    email: string;
    address: string;
    city?: string;
    state?: string;
    zip_code?: string;
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
    appointment_number?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address?: string;
    customer_city?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    service_name: string;
    service_id?: number;
    service_price?: number;
    total_amount?: number;
    appointment_date: string;
    appointment_time: string;
    estimated_end_time?: string;
    duration_minutes?: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes?: string;
    customer_notes?: string;
    requirements?: string[];
    is_home_service?: boolean;
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
    vendor_store?: VendorStore;
    rider?: Rider;
    // Enhanced service details
    vendor_product_service?: {
        id: number;
        name: string;
        description: string;
        category: string;
        price_min: number;
        price_max: number;
        duration_minutes?: number;
        discount_percentage?: number;
        is_popular: boolean;
        is_guaranteed: boolean;
        is_professional: boolean;
        is_verified: boolean;
        rating: number;
        total_reviews: number;
        response_time?: string;
        includes?: string[];
        requirements?: string[];
        tags?: string[];
        has_warranty: boolean;
        warranty_days?: number;
        pickup_available: boolean;
        delivery_available: boolean;
        emergency_service: boolean;
        special_instructions?: string;
        primary_image?: {
            id: number;
            image_path: string;
            alt_text?: string;
        };
        images?: {
            id: number;
            image_path: string;
            alt_text?: string;
            sort_order: number;
            is_primary: boolean;
        }[];
    };
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const statusIcons = {
    pending: AlertCircle,
    confirmed: CheckCircle,
    completed: CheckCircle,
    cancelled: XCircle,
};

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

// Add breadcrumbs for vendor appointments
const breadcrumbs = [
    { title: 'Vendor Dashboard', href: '/vendor/dashboard' },
    { title: 'Appointments', href: '/vendor/appointments' },
];

// Enhanced Appointment Details Modal Component
const AppointmentDetailsModal = ({ appointment, isOpen, onClose, onConfirm, onCancel, initialTab = 'details' }: AppointmentDetailsModalProps) => {
    const [activeTab, setActiveTab] = useState<'details' | 'history'>(initialTab);
    const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Reset tab when modal opens with new appointment
    useEffect(() => {
        if (isOpen && appointment) {
            console.log('Modal opening with appointment:', {
                id: appointment.id,
                customer_name: appointment.customer_name,
                customer_email: appointment.customer_email,
                status: appointment.status
            });
            setActiveTab(initialTab);
            // Clear previous history when switching appointments
            setAppointmentHistory([]);
        }
    }, [isOpen, appointment, initialTab]);

    // Debug effect to monitor appointmentHistory changes
    useEffect(() => {
        console.log('appointmentHistory updated:', appointmentHistory);
        console.log('appointmentHistory length:', appointmentHistory.length);
    }, [appointmentHistory]);

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
            // Create the API call to fetch user's appointment history
            console.log('Fetching history for customer:', appointment.customer_email);
            const encodedEmail = encodeURIComponent(appointment.customer_email);
            const apiUrl = `/api/appointments/user-history/${encodedEmail}`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            console.log('API Response status:', response.status);
            console.log('API Response headers:', response.headers);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API Response data:', data);
                console.log('Appointments array:', data.appointments);
                console.log('Setting appointment history with length:', data.appointments?.length || 0);
                setAppointmentHistory(data.appointments || []);
            } else {
                console.error('API Response error:', response.status, response.statusText);
                const errorData = await response.text();
                console.error('Error details:', errorData);
                setAppointmentHistory([]);
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

    const formatDateTime = (dateStr: string, timeStr: string) => {
        try {
            // Handle the date part
            const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Handle the time part - check if it's already in ISO format or just time
            let formattedTime = '';
            if (timeStr.includes('T')) {
                // ISO format like "2025-08-16T12:15:00.000000Z"
                const timeDate = new Date(timeStr);
                formattedTime = timeDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            } else {
                // Simple time format like "12:15:00"
                const [hours, minutes] = timeStr.split(':');
                const hour24 = parseInt(hours);
                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                const hour12 = hour24 % 12 || 12;
                formattedTime = `${hour12}:${minutes} ${ampm}`;
            }

            return { date: formattedDate, time: formattedTime };
        } catch (error) {
            console.error('Error formatting date/time:', error);
            return { date: dateStr, time: timeStr };
        }
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6 space-y-6">
                    {activeTab === 'details' ? (
                        <>
                            {/* Vendor Store Information */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <Building2 size={18} className="mr-2 text-emerald-500" />
                                    Vendor Store Information
                                </h4>
                                {appointment.vendor_store ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Store Name
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.vendor_store.name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Store Type
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.vendor_store.store_type}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Phone Number
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.vendor_store.phone}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Email
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.vendor_store.email}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Address
                                            </label>
                                            <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                {appointment.vendor_store.address}
                                                {appointment.vendor_store.city && `, ${appointment.vendor_store.city}`}
                                                {appointment.vendor_store.state && `, ${appointment.vendor_store.state}`}
                                                {appointment.vendor_store.zip_code && ` ${appointment.vendor_store.zip_code}`}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Store information not available.
                                        </p>
                                    </div>
                                )}
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
                                            Status
                                        </label>
                                        <p className="mt-1">
                                            <Badge className={statusColors[appointment.status]}>
                                                <StatusIcon size={12} className="mr-1" />
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </Badge>
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
                                            Date
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
                                            Time
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
                                            {formatDuration(appointment.duration_minutes)}
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

                            {/* Rider Information - Always Show */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <Users size={18} className="mr-2 text-yellow-500" />
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
                                                {appointment.rider.status || 'Active'}
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

                            {/* Service Location (if home service) */}
                            {appointment.is_home_service && appointment.service_address && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                                        <MapPin size={18} className="mr-2 text-green-500" />
                                        Service Location
                                    </h4>
                                    <p className="text-sm text-slate-900 dark:text-white">
                                        {appointment.service_address}
                                    </p>
                                </div>
                            )}

                            {/* Pricing Information */}
                            {(appointment.service_price || appointment.total_amount) && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                                        <TrendingUp size={18} className="mr-2 text-orange-500" />
                                        Pricing Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Service Price
                                            </label>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                                                {formatCurrency(appointment.service_price)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Total Amount
                                            </label>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                                                {formatCurrency(appointment.total_amount)}
                                            </p>
                                        </div>
                                        {appointment.payment_status && (
                                            <div className="col-span-2">
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Payment Status
                                                </label>
                                                <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                    <Badge className={
                                                        appointment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        appointment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }>
                                                        {appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                                                    </Badge>
                                                </p>
                                            </div>
                                        )}
                                        {appointment.payment_method && (
                                            <div>
                                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Payment Method
                                                </label>
                                                <p className="text-sm text-slate-900 dark:text-white mt-1">
                                                    {appointment.payment_method}
                                                </p>
                                            </div>
                                        )}
                                        {appointment.payment_reference && (
                                            <div>
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
                            )}

                            {/* Status Tracking */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                    <Clock size={18} className="mr-2 text-slate-500" />
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
                                        Customer Feedback
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
                                    </div>
                                </div>
                            )}

                            {/* Requirements */}
                            {appointment.requirements && appointment.requirements.length > 0 && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                                        <AlertCircle size={18} className="mr-2 text-purple-500" />
                                        Special Requirements
                                    </h4>
                                    <ul className="space-y-1">
                                        {appointment.requirements.map((req, index) => (
                                            <li key={index} className="text-sm text-slate-900 dark:text-white flex items-start">
                                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
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
                                                                {formatDateTime(historyItem.appointment_date, historyItem.appointment_time).date}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 dark:text-slate-400">Time: </span>
                                                            <span className="text-slate-900 dark:text-white">
                                                                {formatDateTime(historyItem.appointment_date, historyItem.appointment_time).time}
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
};

// Utility function for formatting time - moved outside component for reusability
const formatTime = (timeStr: string) => {
    try {
        // Check if it's already in ISO format or just time
        if (timeStr.includes('T')) {
            // ISO format like "2025-08-16T12:15:00.000000Z"
            const timeDate = new Date(timeStr);
            return timeDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } else {
            // Simple time format like "12:15:00"
            const [hours, minutes] = timeStr.split(':');
            const hour24 = parseInt(hours);
            const ampm = hour24 >= 12 ? 'PM' : 'AM';
            const hour12 = hour24 % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        }
    } catch (error) {
        console.error('Error formatting time:', error);
        return timeStr;
    }
};

export default function VendorAppointments({ appointmentCounts, recentAppointments, stats, vendorStore }: Props) {
    // Get flash messages from Inertia
    const { flash } = usePage().props as any;

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [appointmentData, setAppointmentData] = useState<AppointmentCount[]>(appointmentCounts);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialTab, setModalInitialTab] = useState<'details' | 'history'>('details');

    // Create a map for quick lookup of appointment counts by date
    const appointmentMap = appointmentData.reduce((acc, item) => {
        acc[item.date] = item;
        return acc;
    }, {} as Record<string, AppointmentCount>);

    // Fetch appointments for new month
    const fetchMonthlyData = async (year: number, month: number) => {
        setLoading(true);
        try {
            const response = await fetch(`/vendor/appointments/monthly?year=${year}&month=${month + 1}`);
            const data = await response.json();
            setAppointmentData(data);
        } catch (error) {
            console.error('Error fetching monthly data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch appointments for specific day
    const fetchDayAppointments = async (date: string) => {
        try {
            const response = await fetch(`/vendor/appointments/daily?date=${date}`);
            const data = await response.json();
            setDayAppointments(data);
        } catch (error) {
            console.error('Error fetching day appointments:', error);
        }
    };

    // Handle month navigation
    const handlePrevMonth = () => {
        let newMonth = currentMonth - 1;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear = currentYear - 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        fetchMonthlyData(newYear, newMonth);
    };

    const handleNextMonth = () => {
        let newMonth = currentMonth + 1;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear = currentYear + 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        fetchMonthlyData(newYear, newMonth);
    };

    // Handle date selection
    const handleDateClick = async (day: number) => {
        const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(date);
        await fetchDayAppointments(date);
    };

    // Calendar grid generation
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];
    
    // Fill empty cells at the beginning
    for (let i = 0; i < firstDayOfWeek; i++) {
        week.push(null);
    }
    
    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }
    
    // Fill remaining cells
    if (week.length > 0) {
        while (week.length < 7) {
            week.push(null);
        }
        weeks.push(week);
    }

    // Show flash messages when they change
    useEffect(() => {
        if (flash?.success) {
            alert(flash.success);
        }
        if (flash?.error) {
            alert(flash.error);
        }
    }, [flash]);

    // Simplified update function that works with Inertia
    const updateAppointmentStatus = async (appointmentId: number, status: string) => {
        router.patch(`/vendor/appointments/${appointmentId}/status`, 
            { status }, 
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: async () => {
                    console.log('Status updated successfully');
                    
                    // Refresh the day appointments and monthly data
                    if (selectedDate) {
                        await fetchDayAppointments(selectedDate);
                    }
                    await fetchMonthlyData(currentYear, currentMonth);
                },
                onError: (errors) => {
                    console.error('Failed to update appointment status:', errors);
                    const errorMessage = errors.error || Object.values(errors).join(', ');
                    alert(`Failed to update appointment: ${errorMessage}`);
                }
            }
        );
    };

    // Handle view details
    const handleViewDetails = (appointment: Appointment) => {
        console.log('🔍 handleViewDetails called with:', {
            id: appointment.id,
            customer_name: appointment.customer_name,
            customer_email: appointment.customer_email,
            status: appointment.status
        });
        
        setSelectedAppointment(appointment);
        
        // If appointment is completed, automatically show history tab
        if (appointment.status === 'completed') {
            console.log('✅ Setting initial tab to history for completed appointment');
            setModalInitialTab('history');
        } else {
            console.log('📋 Setting initial tab to details for non-completed appointment');
            setModalInitialTab('details');
        }
        
        setIsModalOpen(true);
    };

    return (
        <VendorLayout>
            <Head title="Appointments Calendar" />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                Appointments Calendar
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Manage your appointments and view booking analytics
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="text-sm text-slate-500 dark:text-slate-400">Current Time</div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Today</p>
                                <p className="text-3xl font-bold">{stats.today}</p>
                            </div>
                            <div className="bg-blue-400/20 p-3 rounded-lg">
                                <CalendarIcon size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">This Week</p>
                                <p className="text-3xl font-bold">{stats.this_week}</p>
                            </div>
                            <div className="bg-green-400/20 p-3 rounded-lg">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">This Month</p>
                                <p className="text-3xl font-bold">{stats.this_month}</p>
                            </div>
                            <div className="bg-purple-400/20 p-3 rounded-lg">
                                <Users size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Total</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                            <div className="bg-orange-400/20 p-3 rounded-lg">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden">
                            {/* Calendar Header */}
                            <CardHeader className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-semibold">
                                        {monthNames[currentMonth]} {currentYear}
                                    </CardTitle>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handlePrevMonth}
                                            disabled={loading}
                                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={handleNextMonth}
                                            disabled={loading}
                                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Calendar Grid */}
                            <CardContent className="p-6">
                                {/* Day Names */}
                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    {dayNames.map(day => (
                                        <div key={day} className="p-3 text-center font-medium text-slate-500 dark:text-slate-400">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="space-y-2">
                                    {weeks.map((week, weekIndex) => (
                                        <div key={weekIndex} className="grid grid-cols-7 gap-2">
                                            {week.map((day, dayIndex) => {
                                                if (day === null) {
                                                    return <div key={dayIndex} className="p-3 h-20" />;
                                                }

                                                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                const appointmentCount = appointmentMap[dateStr];
                                                const isToday = today.getDate() === day && 
                                                               today.getMonth() === currentMonth && 
                                                               today.getFullYear() === currentYear;
                                                const isSelected = selectedDate === dateStr;

                                                return (
                                                    <button
                                                        key={dayIndex}
                                                        onClick={() => handleDateClick(day)}
                                                        className={`
                                                            p-2 h-20 rounded-lg border transition-all duration-200 hover:shadow-md
                                                            ${isSelected 
                                                                ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                                                                : isToday
                                                                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-700'
                                                                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                                                            }
                                                        `}
                                                    >
                                                        <div className="text-sm font-medium mb-1">{day}</div>
                                                        {appointmentCount && appointmentCount.total > 0 && (
                                                            <div className="space-y-1">
                                                                <div className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                                                                }`}>
                                                                    {appointmentCount.total} appts
                                                                </div>
                                                                <div className="flex justify-center space-x-1">
                                                                    {appointmentCount.pending > 0 && (
                                                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                                                    )}
                                                                    {appointmentCount.confirmed > 0 && (
                                                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                                                    )}
                                                                    {appointmentCount.completed > 0 && (
                                                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mt-6">
                                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status Legend</h4>
                                    <div className="flex flex-wrap gap-4 text-xs">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                            <span className="text-slate-600 dark:text-slate-400">Pending</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                            <span className="text-slate-600 dark:text-slate-400">Confirmed</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            <span className="text-slate-600 dark:text-slate-400">Completed</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Selected Day Details */}
                        {selectedDate && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-sm">
                                                Appointments for
                                            </h3>
                                            <p className="text-purple-100 text-xs mt-1">
                                                {new Date(selectedDate).toLocaleDateString('en-US', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/vendor/appointments/details?date_from=${selectedDate}&date_to=${selectedDate}`}
                                            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                                        >
                                            <Eye size={12} />
                                            <span>View All Details</span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto">{/* Increased height */}
                                    {dayAppointments.length === 0 ? (
                                        <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                                            <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                                            <p>No appointments scheduled</p>
                                        </div>
                                    ) : (
                                <div className="p-4 space-y-4">{/* Increased spacing */}
                                            {dayAppointments.map((appointment) => {
                                                const StatusIcon = statusIcons[appointment.status] || AlertCircle;
                                                const serviceImage = appointment.vendor_product_service?.primary_image?.image_path || 
                                                                   appointment.vendor_product_service?.images?.find(img => img.is_primary)?.image_path ||
                                                                   appointment.vendor_product_service?.images?.[0]?.image_path;
                                                
                                                return (
                                                    <div key={appointment.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                        <div className="flex items-start space-x-3 mb-3">
                                                            {/* Service Image */}
                                                            <div className="flex-shrink-0">
                                                                {serviceImage ? (
                                                                    <img
                                                                        src={`/storage/${serviceImage}`}
                                                                        alt={appointment.vendor_product_service?.primary_image?.alt_text || appointment.service_name}
                                                                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-600"
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                                        <Building2 size={20} className="text-slate-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between mb-1">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium text-slate-900 dark:text-white truncate">
                                                                            {appointment.customer_name}
                                                                        </h4>
                                                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                                            {appointment.service_name}
                                                                        </p>
                                                                        
                                                                        {/* Service Features */}
                                                                        <div className="flex items-center space-x-2 mt-1">
                                                                            <div className={`flex items-center text-xs ${appointment.vendor_product_service?.is_guaranteed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                                <Shield size={10} className="mr-1" />
                                                                                {appointment.vendor_product_service?.is_guaranteed ? 'Guaranteed' : 'Not Guaranteed'}
                                                                            </div>
                                                                            <div className={`flex items-center text-xs ${appointment.vendor_product_service?.is_professional ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                                <Building2 size={10} className="mr-1" />
                                                                                {appointment.vendor_product_service?.is_professional ? 'Professional' : 'Not Professional'}
                                                                            </div>
                                                                            <div className={`flex items-center text-xs ${appointment.vendor_product_service?.is_verified ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                                <CheckCircle size={10} className="mr-1" />
                                                                                {appointment.vendor_product_service?.is_verified ? 'Verified' : 'Not Verified'}
                                                                            </div>
                                                                            {appointment.vendor_product_service?.rating && (
                                                                                <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                                                                                    <Star size={10} className="mr-1 fill-current" />
                                                                                    {appointment.vendor_product_service.rating.toFixed(1)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Badge className={statusColors[appointment.status]}>
                                                                            <StatusIcon size={12} className="mr-1" />
                                                                            {appointment.status}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                            <div className="flex items-center">
                                                                <Clock size={14} className="mr-2 flex-shrink-0" />
                                                                <span>{formatTime(appointment.appointment_time)}</span>
                                                                {appointment.duration_minutes && (
                                                                    <span className="ml-2 text-xs text-slate-500">
                                                                        ({appointment.duration_minutes} min)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Phone size={14} className="mr-2 flex-shrink-0" />
                                                                <span className="truncate">{appointment.customer_phone}</span>
                                                            </div>
                                                            {appointment.vendor_product_service?.response_time && (
                                                                <div className="flex items-center">
                                                                    <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                                                                    <span className="text-xs">Response: {appointment.vendor_product_service.response_time}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Compact Action Buttons */}
                                                        <div className="flex space-x-1">
                                                            {/* View Details Button - Always shown */}
                                                            <Button
                                                                onClick={() => handleViewDetails(appointment)}
                                                                className="flex-1 text-xs py-1 px-2"
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Eye size={10} className="mr-1" />
                                                                Details
                                                            </Button>

                                                            {/* Status-specific buttons */}
                                                            {appointment.status === 'pending' && (
                                                                <div className="flex space-x-1 flex-1">
                                                                    <Button
                                                                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                                                        className="flex-1 text-xs py-1 px-2"
                                                                        variant="default"
                                                                        size="sm"
                                                                    >
                                                                        <CheckCircle size={10} className="mr-1" />
                                                                        Confirm
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                                                        className="flex-1 text-xs py-1 px-2"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                    >
                                                                        <XCircle size={10} className="mr-1" />
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            
                                                            {appointment.status === 'confirmed' && (
                                                                <Button
                                                                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                                                    className="flex-1 text-xs py-1 px-2"
                                                                    variant="default"
                                                                    size="sm"
                                                                >
                                                                    <CheckCircle size={10} className="mr-1" />
                                                                    Complete
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                     
                        {/* Quick Stats for Selected Date */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                                {selectedDate ? (
                                    <>
                                        Stats for {new Date(selectedDate).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </>
                                ) : (
                                    'Quick Stats'
                                )}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle size={16} className="text-yellow-500" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {selectedDate 
                                            ? dayAppointments.filter(apt => apt.status === 'pending').length
                                            : stats.pending
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle size={16} className="text-blue-500" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Confirmed</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {selectedDate 
                                            ? dayAppointments.filter(apt => apt.status === 'confirmed').length
                                            : stats.confirmed
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle size={16} className="text-green-500" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {selectedDate 
                                            ? dayAppointments.filter(apt => apt.status === 'completed').length
                                            : stats.completed
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <XCircle size={16} className="text-red-500" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Cancelled</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {selectedDate 
                                            ? dayAppointments.filter(apt => apt.status === 'cancelled').length
                                            : 0
                                        }
                                    </span>
                                </div>
                                {selectedDate && (
                                    <>
                                        <hr className="border-slate-200 dark:border-slate-600 my-3" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <CalendarIcon size={16} className="text-purple-500" />
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total for Day</span>
                                            </div>
                                            <span className="font-bold text-lg text-slate-900 dark:text-white">
                                                {dayAppointments.length}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Details Modal */}
            <AppointmentDetailsModal
                appointment={selectedAppointment}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={updateAppointmentStatus}
                onCancel={updateAppointmentStatus}
                initialTab={modalInitialTab}
            />
        </VendorLayout>
    );
}