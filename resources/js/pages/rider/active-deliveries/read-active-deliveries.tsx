import { Head, Link } from '@inertiajs/react';
import RiderLayout from '@/layouts/app/RiderLayout';
import { 
    Package, 
    Clock, 
    MapPin, 
    Phone, 
    User, 
    DollarSign,
    Navigation,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Timer,
    Calendar,
    Star,
    ArrowLeft,
    Building,
    Mail,
    FileText,
    UserCheck,
    Truck,
    AlertCircle
} from 'lucide-react';

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
    duration_minutes?: number;
    service_price?: number;
    total_amount?: number;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
    confirmed_at?: string;
    started_at?: string;
    completed_at?: string;
    customer_notes?: string;
    service_address?: string;
    is_home_service: boolean;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    requirements?: any;
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

interface Props {
    appointment: Appointment;
    rider: {
        id: number;
        name: string;
        phone: string;
        vehicle_type: string;
        status: string;
    };
}

export default function ReadActiveDeliveries({ appointment, rider }: Props) {
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
                return <AlertCircle size={20} />;
        }
    };

    const formatTime = (time: string) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const calculateDistance = () => {
        // Mock distance calculation - in real app, use Google Maps API
        return Math.floor(Math.random() * 15) + 1; // 1-15 km
    };

    const calculateEstimatedEarnings = () => {
        const baseRate = 100; // Base delivery fee
        const distance = calculateDistance();
        const distanceRate = distance * 15; // ₱15 per km
        const serviceCommission = (appointment.total_amount || 0) * 0.15; // 15% commission
        
        return Math.max(baseRate + distanceRate, serviceCommission);
    };

    const estimatedEarnings = calculateEstimatedEarnings();
    const distance = calculateDistance();

    return (
        <RiderLayout>
            <Head title={`Appointment Details - ${appointment.appointment_number}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/rider/deliveries/active"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Active Deliveries
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Appointment Details
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                #{appointment.appointment_number}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-2 capitalize">{appointment.status.replace('_', ' ')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <User className="mr-2" size={20} />
                                Customer Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{appointment.customer_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-gray-900 dark:text-white">{appointment.customer_phone}</p>
                                            <a
                                                href={`tel:${appointment.customer_phone}`}
                                                className="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                            >
                                                <Phone size={12} className="mr-1" />
                                                Call
                                            </a>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                        <p className="text-gray-900 dark:text-white">{appointment.customer_email}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                        <p className="text-gray-900 dark:text-white">{appointment.customer_address}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                        <p className="text-gray-900 dark:text-white">{appointment.customer_city}</p>
                                    </div>
                                    {appointment.emergency_contact_name && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact</label>
                                            <p className="text-gray-900 dark:text-white">
                                                {appointment.emergency_contact_name}
                                                <br />
                                                <a 
                                                    href={`tel:${appointment.emergency_contact_phone}`}
                                                    className="text-red-600 hover:text-red-700 text-sm"
                                                >
                                                    {appointment.emergency_contact_phone}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <Calendar className="mr-2" size={20} />
                                Appointment Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {formatDate(appointment.appointment_date)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                                        <p className="text-gray-900 dark:text-white">
                                            {formatTime(appointment.appointment_time)}
                                            {appointment.estimated_end_time && (
                                                <span className="text-gray-500">
                                                    {' - '}{formatTime(appointment.estimated_end_time)}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                                        <p className="text-gray-900 dark:text-white">
                                            {appointment.duration_minutes ? `${appointment.duration_minutes} minutes` : 'Duration not specified'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Price</label>
                                        <p className="text-green-600 font-bold text-lg">
                                            ₱{appointment.service_price ? appointment.service_price.toLocaleString() : '0.00'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount</label>
                                        <p className="text-green-600 font-bold text-xl">
                                            ₱{appointment.total_amount ? appointment.total_amount.toLocaleString() : '0.00'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Type</label>
                                        <p className="text-gray-900 dark:text-white">
                                            {appointment.is_home_service ? (
                                                <span className="inline-flex items-center">
                                                    <MapPin size={16} className="mr-1" />
                                                    Home Service
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center">
                                                    <Building size={16} className="mr-1" />
                                                    In-Store Service
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service Information */}
                        {appointment.service && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Package className="mr-2" size={20} />
                                    Service Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{appointment.service.service_name}</p>
                                    </div>
                                    {appointment.service.service_description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                            <p className="text-gray-900 dark:text-white">{appointment.service.service_description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Vendor Information */}
                        {appointment.vendor_store && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Building className="mr-2" size={20} />
                                    Service Provider
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
                                            <p className="text-gray-900 dark:text-white font-medium">{appointment.vendor_store.store_name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-gray-900 dark:text-white">{appointment.vendor_store.store_phone}</p>
                                                <a
                                                    href={`tel:${appointment.vendor_store.store_phone}`}
                                                    className="inline-flex items-center px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                                                >
                                                    <Phone size={12} className="mr-1" />
                                                    Call Store
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Address</label>
                                            <p className="text-gray-900 dark:text-white">{appointment.vendor_store.store_address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Service Location */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <MapPin className="mr-2" size={20} />
                                Service Location
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                    <p className="text-gray-900 dark:text-white">
                                        {appointment.is_home_service 
                                            ? appointment.service_address || appointment.customer_address
                                            : appointment.vendor_store?.store_address || 'Store address not available'
                                        }
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(
                                            appointment.is_home_service 
                                                ? appointment.service_address || appointment.customer_address
                                                : appointment.vendor_store?.store_address || 'Store address not available'
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                    >
                                        <Navigation size={16} className="mr-2" />
                                        Get Directions
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Customer Notes */}
                        {appointment.customer_notes && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                    <FileText className="mr-2" size={20} />
                                    Special Instructions
                                </h3>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-blue-800 dark:text-blue-200">{appointment.customer_notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Status History */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <Clock className="mr-2" size={20} />
                                Status History
                            </h3>
                            <div className="space-y-3">
                                {appointment.confirmed_at && (
                                    <div className="flex items-center text-sm">
                                        <CheckCircle size={16} className="text-blue-500 mr-3" />
                                        <span className="text-gray-900 dark:text-white">Confirmed</span>
                                        <span className="text-gray-500 ml-auto">{formatDateTime(appointment.confirmed_at)}</span>
                                    </div>
                                )}
                                {appointment.started_at && (
                                    <div className="flex items-center text-sm">
                                        <Timer size={16} className="text-green-500 mr-3" />
                                        <span className="text-gray-900 dark:text-white">Started</span>
                                        <span className="text-gray-500 ml-auto">{formatDateTime(appointment.started_at)}</span>
                                    </div>
                                )}
                                {appointment.completed_at && (
                                    <div className="flex items-center text-sm">
                                        <CheckCircle size={16} className="text-green-600 mr-3" />
                                        <span className="text-gray-900 dark:text-white">Completed</span>
                                        <span className="text-gray-500 ml-auto">{formatDateTime(appointment.completed_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Action Panel */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions</h3>
                            <div className="space-y-3">
                                {/* FIXED: Only show "Get This Job" button if status is 'confirmed' by vendor */}
                                {appointment.status === 'confirmed' ? (
                                    <Link
                                        href={`/rider/deliveries/${appointment.id}/get`}
                                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        <UserCheck size={16} className="mr-2" />
                                        Get This Book
                                    </Link>
                                ) : (
                                    <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-center">
                                        <div className="flex items-center justify-center text-gray-500">
                                            {appointment.status === 'pending' && (
                                                <>
                                                    <Clock size={16} className="mr-2" />
                                                    Waiting for Vendor Confirmation
                                                </>
                                            )}
                                            {appointment.status === 'in_progress' && (
                                                <>
                                                    <Timer size={16} className="mr-2" />
                                                    Job Already in Progress
                                                </>
                                            )}
                                            {appointment.status === 'completed' && (
                                                <>
                                                    <CheckCircle size={16} className="mr-2" />
                                                    Job Already Completed
                                                </>
                                            )}
                                            {appointment.status === 'cancelled' && (
                                                <>
                                                    <XCircle size={16} className="mr-2" />
                                                    Job Cancelled
                                                </>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {appointment.status === 'pending' 
                                                ? 'This appointment needs to be confirmed by the vendor first'
                                                : `Status: ${appointment.status.replace('_', ' ')}`
                                            }
                                        </p>
                                    </div>
                                )}
                                
                                {appointment.customer_phone && (
                                    <a
                                        href={`tel:${appointment.customer_phone}`}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <Phone size={16} className="mr-2" />
                                        Call Customer
                                    </a>
                                )}
                                
                                {appointment.vendor_store?.store_phone && (
                                    <a
                                        href={`tel:${appointment.vendor_store.store_phone}`}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                    >
                                        <Phone size={16} className="mr-2" />
                                        Call Store
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Earnings Info */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                            <h3 className="text-lg font-medium mb-4">Potential Earnings</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Estimated Distance:</span>
                                    <span className="font-medium">{distance} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service Commission:</span>
                                    <span className="font-medium">15%</span>
                                </div>
                                <div className="border-t border-green-400 pt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>You'll Earn:</span>
                                        <span>₱{estimatedEarnings.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rider Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Profile</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <User size={16} className="text-gray-400 mr-3" />
                                    <span className="font-medium text-gray-900 dark:text-white">{rider.name}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Phone size={16} className="text-gray-400 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-300">{rider.phone}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Truck size={16} className="text-gray-400 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-300">{rider.vehicle_type}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <CheckCircle size={16} className="text-green-500 mr-3" />
                                    <span className="text-green-600 capitalize">{rider.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                            <div className="flex items-start">
                                <AlertTriangle size={20} className="text-yellow-600 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                        Important Reminders:
                                    </h4>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        <li>• Contact customer before arriving</li>
                                        <li>• Bring necessary equipment</li>
                                        <li>• Follow safety protocols</li>
                                        <li>• Update status in real-time</li>
                                        <li>• Check service requirements</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RiderLayout>
    );
}