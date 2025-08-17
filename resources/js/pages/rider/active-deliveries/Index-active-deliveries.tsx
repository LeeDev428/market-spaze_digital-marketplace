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
    Truck
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

interface Props {
    appointments: Appointment[];
    stats: {
        total_active: number;
        pending_count: number;
        confirmed_count: number;
        in_progress_count: number;
        today_earnings: number;
    };
    rider?: {  // ✅ Make it optional to handle both cases
        id: number;
        rider_id: string;
        name: string;
        phone: string;
        vehicle_type: string;
        status: string;
        rating: number;
        total_deliveries: number;
    };
    error?: string;
}

export default function ActiveDeliveries({ appointments, stats, rider, error }: Props) {
    // ✅ Show error if present
    if (error) {
        return (
            <RiderLayout>
                <Head title="Active Deliveries - Error" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Unable to Load Deliveries
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </RiderLayout>
        );
    }

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
            return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return time;
        }
    };

    const formatDate = (date: string) => {
        try {
            return new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return date;
        }
    };

    const updateStatus = async (appointmentId: number, newStatus: string) => {
        try {
            const response = await fetch(`/rider/deliveries/${appointmentId}/status`, {
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
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Filter appointments for current day only
    const getCurrentDayAppointments = (appointments: Appointment[]) => {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        return appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
            return appointmentDate === todayString;
        });
    };

    // Sort appointments by priority: confirmed (oldest first), pending, in_progress, cancelled
    const sortAppointmentsByPriority = (appointments: Appointment[]) => {
        const statusPriority: Record<string, number> = {
            'confirmed': 1,    // Top priority - confirmed status (oldest first to avoid covering other appointments)
            'pending': 2,      // Second priority - pending 
            'in_progress': 3,  // Third priority - in progress
            'completed': 4,    // Fourth priority - completed
            'cancelled': 5     // Last priority - cancelled
        };

        return [...appointments].sort((a, b) => {
            // First sort by status priority
            const statusDiff = (statusPriority[a.status] || 6) - (statusPriority[b.status] || 6);
            if (statusDiff !== 0) return statusDiff;
            
            // For confirmed status, sort by creation date (oldest first to avoid covering other appointments)
            if (a.status === 'confirmed' && b.status === 'confirmed') {
                return new Date(a.appointment_date + ' ' + a.appointment_time).getTime() - 
                       new Date(b.appointment_date + ' ' + b.appointment_time).getTime();
            }
            
            // For other statuses, also sort by appointment date/time
            return new Date(a.appointment_date + ' ' + a.appointment_time).getTime() - 
                   new Date(b.appointment_date + ' ' + b.appointment_time).getTime();
        });
    };

    // Get today's appointments and sort them by priority
    const todayAppointments = appointments ? getCurrentDayAppointments(appointments) : [];
    const sortedTodayAppointments = sortAppointmentsByPriority(todayAppointments);

    // Get today's date for display
    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <RiderLayout>
            <Head title="Active Deliveries" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Active Deliveries
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your current appointments and deliveries
                        </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Active</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_active || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pending_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Jobs</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.confirmed_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <DollarSign className="h-8 w-8 text-purple-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Earnings</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">₱{(stats?.today_earnings || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Current Appointments ({sortedTodayAppointments?.length || 0})
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Today - {todayDate}
                            </p>
                        </div>
                        <Link
                            href="/rider/deliveries/calendar"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Eye size={16} className="mr-2" />
                            View All Appointments
                        </Link>
                    </div>
                    
                    {!sortedTodayAppointments || sortedTodayAppointments.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Truck size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Current Appointments
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                You don't have any appointments scheduled for today.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedTodayAppointments.map((appointment) => (
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

                                            {/* Customer Notes */}
                                            {appointment.customer_notes && (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                                        Customer Notes:
                                                    </h5>
                                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                                        {appointment.customer_notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="ml-6 flex flex-col space-y-2">
                                            {/* View Details Button - Always available */}
                                            <Link
                                                href={`/rider/deliveries/${appointment.id}`}
                                                className="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                                            >
                                                <Eye size={14} className="mr-1" />
                                                View Details
                                            </Link>

                                            {/* ✅ FIXED: Status-specific action buttons */}
                                            {appointment.status === 'confirmed' && !appointment.rider_id && (
                                                <Link
                                                    href={`/rider/deliveries/${appointment.id}/get`}
                                                    className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                                                >
                                                    <UserCheck size={14} className="mr-1" />
                                                    Get This Book
                                                </Link>
                                            )}

                                            {appointment.status === 'pending' && (
                                                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-lg text-center">
                                                    <Clock size={12} className="inline mr-1" />
                                                    Awaiting Vendor
                                                </div>
                                            )}

                                            {appointment.status === 'in_progress' && (
                                                <button
                                                    className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                                    onClick={() => updateStatus(appointment.id, 'completed')}
                                                >
                                                    <CheckCircle size={14} className="mr-1" />
                                                    Mark Complete
                                                </button>
                                            )}

                                            {appointment.status === 'completed' && (
                                                <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-lg text-center">
                                                    <CheckCircle size={12} className="inline mr-1" />
                                                    Completed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RiderLayout>
    );
}