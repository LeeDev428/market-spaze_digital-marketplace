import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft,
    Calendar, 
    Clock, 
    User, 
    MapPin, 
    Phone, 
    Mail, 
    DollarSign, 
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Store,
    Truck,
    Star,
    CreditCard,
    MessageSquare,
    Shield,
    Settings,
    Building,
    Package,
    Timer,
    Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentDetail {
    id: number;
    appointment_number: string;
    status: string;
    appointment_date: string;
    appointment_time: string;
    estimated_end_time: string;
    duration_minutes: number;
    
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
    };
    
    vendor: {
        id: number;
        business_name: string;
        description: string;
        business_type: string;
        address: string;
        contact_phone: string;
        contact_email: string;
        owner: {
            name: string;
            email: string;
        };
    } | null;
    
    service: {
        id: number;
        name: string;
        description: string;
        category: string;
        subcategory: string;
        price: number;
        duration: number;
    } | null;
    
    rider: {
        id: number;
        rider_id: string;
        name: string;
        email: string;
        phone: string;
        vehicle_type: string;
        license_number: string;
        rating: number;
        total_deliveries: number;
        status: string;
    } | null;
    
    financial: {
        service_price: number;
        additional_charges: number;
        discount_amount: number;
        total_amount: number;
        currency: string;
    };
    
    notes: {
        requirements: string;
        customer_notes: string;
        internal_notes: string;
        cancellation_reason: string;
        cancellation_details: string;
    };
    
    timestamps: {
        created_at: string;
        confirmed_at: string;
        started_at: string;
        completed_at: string;
        cancelled_at: string;
        rescheduled_at: string;
    };
    
    notifications: {
        sms_notifications: boolean;
        email_notifications: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'History', href: '/history' },
    { title: 'Appointment Details', href: '' },
];

interface Props {
    appointment: AppointmentDetail;
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
    completed: 'text-green-600 bg-green-100 border-green-200',
    cancelled: 'text-red-600 bg-red-100 border-red-200',
    confirmed: 'text-blue-600 bg-blue-100 border-blue-200',
    pending: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    in_progress: 'text-purple-600 bg-purple-100 border-purple-200',
    no_show: 'text-gray-600 bg-gray-100 border-gray-200',
};

export default function HistoryShow({ appointment }: Props) {
    const StatusIcon = statusIcons[appointment.status as keyof typeof statusIcons] || AlertCircle;
    
    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (datetime: string) => {
        if (!datetime) return 'N/A';
        return new Date(datetime).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatTime = (time: string) => {
        if (!time) return 'N/A';
        return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={cn(
                    'h-4 w-4',
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                )}
            />
        ));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment #${appointment.appointment_number}`} />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('history.index')}
                                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            
                            <div className="flex items-center space-x-3">
                                <div className={cn(
                                    'p-3 rounded-full border',
                                    statusColors[appointment.status as keyof typeof statusColors] || 'text-gray-600 bg-gray-100 border-gray-200'
                                )}>
                                    <StatusIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Appointment #{appointment.appointment_number}
                                    </h1>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-sm font-medium border',
                                            statusColors[appointment.status as keyof typeof statusColors] || 'text-gray-600 bg-gray-100 border-gray-200'
                                        )}>
                                            {appointment.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className="text-gray-600 flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {formatDate(appointment.appointment_date)}
                                        </span>
                                        <span className="text-gray-600 flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {formatTime(appointment.appointment_time)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 text-orange-600 mr-2" />
                                    Customer Information
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <p className="text-gray-900">{appointment.customer.name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <a
                                                href={`mailto:${appointment.customer.email}`}
                                                className="text-orange-600 hover:text-orange-700"
                                            >
                                                {appointment.customer.email}
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <a
                                                href={`tel:${appointment.customer.phone}`}
                                                className="text-orange-600 hover:text-orange-700"
                                            >
                                                {appointment.customer.phone}
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <p className="text-gray-900">{appointment.customer.city}</p>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <p className="text-gray-900">{appointment.customer.address}</p>
                                        </div>
                                    </div>
                                    
                                    {appointment.customer.emergency_contact_name && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                                                <p className="text-gray-900">{appointment.customer.emergency_contact_name}</p>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="h-4 w-4 text-gray-400" />
                                                    <a
                                                        href={`tel:${appointment.customer.emergency_contact_phone}`}
                                                        className="text-orange-600 hover:text-orange-700"
                                                    >
                                                        {appointment.customer.emergency_contact_phone}
                                                    </a>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Service Information */}
                            {appointment.service && (
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Package className="h-5 w-5 text-orange-600 mr-2" />
                                        Service Details
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                                            <p className="text-gray-900 font-medium">{appointment.service.name}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <p className="text-gray-900">{appointment.service.category}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                            <p className="text-gray-900">{appointment.service.subcategory}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                            <div className="flex items-center space-x-2">
                                                <Timer className="h-4 w-4 text-gray-400" />
                                                <p className="text-gray-900">{appointment.service.duration} minutes</p>
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <p className="text-gray-900">{appointment.service.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vendor Information */}
                            {appointment.vendor && (
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Store className="h-5 w-5 text-orange-600 mr-2" />
                                        Vendor Information
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                            <p className="text-gray-900 font-medium">{appointment.vendor.business_name}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                                            <div className="flex items-center space-x-2">
                                                <Building className="h-4 w-4 text-gray-400" />
                                                <p className="text-gray-900">{appointment.vendor.business_type}</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <a
                                                    href={`tel:${appointment.vendor.contact_phone}`}
                                                    className="text-orange-600 hover:text-orange-700"
                                                >
                                                    {appointment.vendor.contact_phone}
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                            <div className="flex items-center space-x-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <a
                                                    href={`mailto:${appointment.vendor.contact_email}`}
                                                    className="text-orange-600 hover:text-orange-700"
                                                >
                                                    {appointment.vendor.contact_email}
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                                            <div className="flex items-start space-x-2">
                                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <p className="text-gray-900">{appointment.vendor.address}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <p className="text-gray-900">{appointment.vendor.description}</p>
                                        </div>
                                        
                                        <div className="md:col-span-2 pt-3 border-t border-gray-200">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                                            <div className="flex items-center space-x-4">
                                                <p className="text-gray-900">{appointment.vendor.owner.name}</p>
                                                <a
                                                    href={`mailto:${appointment.vendor.owner.email}`}
                                                    className="text-orange-600 hover:text-orange-700 text-sm"
                                                >
                                                    {appointment.vendor.owner.email}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rider Information */}
                            {appointment.rider && (
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Truck className="h-5 w-5 text-orange-600 mr-2" />
                                        Rider Information
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rider Name</label>
                                            <p className="text-gray-900 font-medium">{appointment.rider.name}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rider ID</label>
                                            <p className="text-gray-900">{appointment.rider.rider_id}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <div className="flex items-center space-x-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <a
                                                    href={`mailto:${appointment.rider.email}`}
                                                    className="text-orange-600 hover:text-orange-700"
                                                >
                                                    {appointment.rider.email}
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <a
                                                    href={`tel:${appointment.rider.phone}`}
                                                    className="text-orange-600 hover:text-orange-700"
                                                >
                                                    {appointment.rider.phone}
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                            <div className="flex items-center space-x-2">
                                                <Truck className="h-4 w-4 text-gray-400" />
                                                <p className="text-gray-900 capitalize">{appointment.rider.vehicle_type}</p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                            <p className="text-gray-900">{appointment.rider.license_number}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <div className="flex items-center space-x-2">
                                                <Shield className="h-4 w-4 text-gray-400" />
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                                    appointment.rider.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    appointment.rider.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                )}>
                                                    {appointment.rider.status}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex space-x-1">
                                                    {renderStars(Math.floor(appointment.rider.rating))}
                                                </div>
                                                <span className="text-gray-600 text-sm">
                                                    {appointment.rider.rating}/5 ({appointment.rider.total_deliveries} deliveries)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes & Requirements */}
                            {(appointment.notes.requirements || appointment.notes.customer_notes || appointment.notes.internal_notes) && (
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <MessageSquare className="h-5 w-5 text-orange-600 mr-2" />
                                        Notes & Requirements
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        {appointment.notes.requirements && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{appointment.notes.requirements}</p>
                                            </div>
                                        )}
                                        
                                        {appointment.notes.customer_notes && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
                                                <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">{appointment.notes.customer_notes}</p>
                                            </div>
                                        )}
                                        
                                        {appointment.notes.internal_notes && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                                                <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg">{appointment.notes.internal_notes}</p>
                                            </div>
                                        )}
                                        
                                        {(appointment.notes.cancellation_reason || appointment.notes.cancellation_details) && (
                                            <div className="border-t border-gray-200 pt-4">
                                                <h3 className="text-sm font-medium text-red-700 mb-2">Cancellation Details</h3>
                                                {appointment.notes.cancellation_reason && (
                                                    <div className="mb-2">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                                                        <p className="text-gray-900 bg-red-50 p-3 rounded-lg">{appointment.notes.cancellation_reason}</p>
                                                    </div>
                                                )}
                                                {appointment.notes.cancellation_details && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Details</label>
                                                        <p className="text-gray-900 bg-red-50 p-3 rounded-lg">{appointment.notes.cancellation_details}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Financial Summary */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Receipt className="h-5 w-5 text-orange-600 mr-2" />
                                    Financial Summary
                                </h2>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service Price</span>
                                        <span className="text-gray-900">
                                            {formatCurrency(appointment.financial.service_price, appointment.financial.currency)}
                                        </span>
                                    </div>
                                    
                                    {appointment.financial.additional_charges > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Additional Charges</span>
                                            <span className="text-gray-900">
                                                +{formatCurrency(appointment.financial.additional_charges, appointment.financial.currency)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {appointment.financial.discount_amount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Discount</span>
                                            <span className="text-green-600">
                                                -{formatCurrency(appointment.financial.discount_amount, appointment.financial.currency)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                            <span className="text-lg font-semibold text-orange-600">
                                                {formatCurrency(appointment.financial.total_amount, appointment.financial.currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Timeline */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Clock className="h-5 w-5 text-orange-600 mr-2" />
                                    Timeline
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Created</p>
                                            <p className="text-xs text-gray-600">{formatDateTime(appointment.timestamps.created_at)}</p>
                                        </div>
                                    </div>
                                    
                                    {appointment.timestamps.confirmed_at && (
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Confirmed</p>
                                                <p className="text-xs text-gray-600">{formatDateTime(appointment.timestamps.confirmed_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {appointment.timestamps.started_at && (
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Started</p>
                                                <p className="text-xs text-gray-600">{formatDateTime(appointment.timestamps.started_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {appointment.timestamps.completed_at && (
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Completed</p>
                                                <p className="text-xs text-gray-600">{formatDateTime(appointment.timestamps.completed_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {appointment.timestamps.cancelled_at && (
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Cancelled</p>
                                                <p className="text-xs text-gray-600">{formatDateTime(appointment.timestamps.cancelled_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {appointment.timestamps.rescheduled_at && (
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <Calendar className="h-4 w-4 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Rescheduled</p>
                                                <p className="text-xs text-gray-600">{formatDateTime(appointment.timestamps.rescheduled_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notification Settings */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Settings className="h-5 w-5 text-orange-600 mr-2" />
                                    Notifications
                                </h2>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">SMS Notifications</span>
                                        <span className={cn(
                                            'px-2 py-1 rounded-full text-xs font-medium',
                                            appointment.notifications.sms_notifications 
                                                ? 'text-green-600 bg-green-100'
                                                : 'text-gray-600 bg-gray-100'
                                        )}>
                                            {appointment.notifications.sms_notifications ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Email Notifications</span>
                                        <span className={cn(
                                            'px-2 py-1 rounded-full text-xs font-medium',
                                            appointment.notifications.email_notifications 
                                                ? 'text-green-600 bg-green-100'
                                                : 'text-gray-600 bg-gray-100'
                                        )}>
                                            {appointment.notifications.email_notifications ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
