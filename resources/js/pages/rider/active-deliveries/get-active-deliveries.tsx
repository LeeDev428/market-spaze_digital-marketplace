import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
    ArrowLeft,
    Building,
    FileText,
    UserCheck,
    Truck,
    AlertCircle,
    Star
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
    status: string;
    customer_notes?: string;
    service_address?: string;
    is_home_service: boolean;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    rider_id?: number;
    vendor_store: {
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

interface Rider {
    id: number;
    rider_id: string;
    name: string;
    phone: string;
    vehicle_type: string;
    status: string;
    rating: number;
    total_deliveries: number;
}

interface Props {
    appointment: Appointment;
    rider: Rider;
}

export default function GetActiveDeliveries({ appointment, rider }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        estimated_arrival_time: '',
        rider_notes: '',
        accept_terms: false
    });

    // ✅ Redirect if appointment is not confirmed by vendor
    React.useEffect(() => {
        if (appointment.status !== 'confirmed') {
            router.visit(`/rider/deliveries/${appointment.id}`, {
                data: { error: 'not_confirmed' }
            });
        }
    }, [appointment.status, appointment.id]);

    // ✅ Show error if not confirmed
    if (appointment.status !== 'confirmed') {
        return (
            <RiderLayout>
                <Head title="Job Not Available" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Job Not Available
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {appointment.status === 'pending' 
                                ? 'This appointment needs to be confirmed by the vendor first.'
                                : `This appointment is not available. Status: ${appointment.status}`
                            }
                        </p>
                        <Link
                            href={`/rider/deliveries/${appointment.id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Details
                        </Link>
                    </div>
                </div>
            </RiderLayout>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // ✅ FIXED: Better form submission
    const handleAcceptJob = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.accept_terms) {
            alert('Please accept the terms and conditions to continue.');
            return;
        }

        console.log('🚀 SUBMITTING FORM...');
        console.log('📝 Form data:', formData);
        console.log('🎯 Appointment ID:', appointment.id);
        console.log('🔗 URL:', `/rider/deliveries/${appointment.id}/accept`);

        setIsSubmitting(true);

        try {
            // ✅ CRITICAL FIX: Use Inertia's router.post with proper data structure
            router.post(`/rider/deliveries/${appointment.id}/accept`, formData, {
                preserveState: false,
                preserveScroll: false,
                onBefore: () => {
                    console.log('🔄 Request about to start...');
                    return true;
                },
                onStart: () => {
                    console.log('✅ Request started successfully');
                },
                onProgress: (progress) => {
                    console.log('📊 Upload progress:', progress);
                },
                onSuccess: (page) => {
                    console.log('🎉 SUCCESS! Page:', page);
                    // Should automatically redirect to active deliveries
                },
                onError: (errors) => {
                    console.error('❌ SUBMISSION ERRORS:', errors);
                    setIsSubmitting(false);
                    
                    // Show specific error messages
                    if (errors.accept_terms) {
                        alert('Please accept the terms and conditions.');
                    } else if (errors.estimated_arrival_time) {
                        alert('Invalid arrival time: ' + errors.estimated_arrival_time);
                    } else if (errors.rider_notes) {
                        alert('Invalid notes: ' + errors.rider_notes);
                    } else if (typeof errors === 'string') {
                        alert('Error: ' + errors);
                    } else if (typeof errors === 'object') {
                        alert('Errors: ' + Object.values(errors).join(', '));
                    } else {
                        alert('An unknown error occurred. Please try again.');
                    }
                },
                onFinish: () => {
                    console.log('🏁 Request completed (success or error)');
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('💥 CATCH ERROR:', error);
            alert('Network error. Please check your connection and try again.');
            setIsSubmitting(false);
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
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return date;
        }
    };

    const calculateEstimatedEarnings = () => {
        const baseRate = 100; // Base delivery fee
        const serviceCommission = appointment.total_amount * 0.15; // 15% commission
        return Math.max(baseRate, serviceCommission);
    };

    const estimatedEarnings = calculateEstimatedEarnings();

    return (
        <RiderLayout>
            <Head title={`Accept Job - ${appointment.appointment_number}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={`/rider/deliveries/${appointment.id}`}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Details
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Accept Job
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                #{appointment.appointment_number}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border bg-blue-100 text-blue-800 border-blue-200">
                        <CheckCircle size={20} />
                        <span className="ml-2">Ready to Accept</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <Package className="mr-2" size={20} />
                                Job Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{appointment.customer_name}</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{appointment.customer_phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {appointment.service?.service_name || 'Service Details'}
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
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {formatDate(appointment.appointment_date)}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {formatTime(appointment.appointment_time)}
                                            {appointment.estimated_end_time && (
                                                <span> - {formatTime(appointment.estimated_end_time)}</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Value</label>
                                        <p className="text-green-600 font-bold text-lg">₱{appointment.total_amount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Earnings</label>
                                        <p className="text-green-600 font-bold text-lg">₱{estimatedEarnings.toFixed(0)}</p>
                                        <p className="text-gray-500 text-xs">15% commission + delivery fee</p>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                            : appointment.vendor_store.store_address
                                        }
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    <a
                                        href={`https://maps.google.com/?q=${encodeURIComponent(
                                            appointment.is_home_service 
                                                ? appointment.service_address || appointment.customer_address
                                                : appointment.vendor_store.store_address
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

                        {/* Job Acceptance Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <UserCheck className="mr-2" size={20} />
                                Accept This Job
                            </h3>
                            
                            {/* ✅ FIXED: Proper form with onSubmit */}
                            <form onSubmit={handleAcceptJob} className="space-y-6">
                                <div>
                                    <label htmlFor="estimated_arrival_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Estimated Arrival Time (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="estimated_arrival_time"
                                        name="estimated_arrival_time"
                                        value={formData.estimated_arrival_time}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 30 minutes, 1 hour"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="rider_notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        id="rider_notes"
                                        name="rider_notes"
                                        value={formData.rider_notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Any additional information..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        id="accept_terms"
                                        name="accept_terms"
                                        checked={formData.accept_terms}
                                        onChange={handleInputChange}
                                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        required
                                    />
                                    <label htmlFor="accept_terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                        I accept the terms and conditions and agree to complete this service professionally and on time.
                                    </label>
                                </div>

                                <div className="flex space-x-4">
                                    <Link
                                        href={`/rider/deliveries/${appointment.id}`}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    {/* ✅ FIXED: Proper submit button */}
                                    <button
                                        type="submit"
                                        disabled={!formData.accept_terms || isSubmitting}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Accepting...
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck size={16} className="mr-2" />
                                                Accept This Job
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Earnings Breakdown */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                            <h3 className="text-lg font-medium mb-4">Earnings Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Service Commission (15%):</span>
                                    <span className="font-medium">₱{(appointment.total_amount * 0.15).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Base Delivery Fee:</span>
                                    <span className="font-medium">₱100</span>
                                </div>
                                <div className="border-t border-green-400 pt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Earnings:</span>
                                        <span>₱{estimatedEarnings.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rider Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Profile</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <User size={16} className="text-gray-400 mr-3" />
                                    <span className="font-medium text-gray-900 dark:text-white">{rider.name}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Star size={16} className="text-yellow-400 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-300">{rider.rating} Rating</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Package size={16} className="text-gray-400 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-300">{rider.total_deliveries} Completed</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Truck size={16} className="text-gray-400 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-300">{rider.vehicle_type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                            <div className="flex items-start">
                                <AlertTriangle size={20} className="text-yellow-600 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                        Before Accepting:
                                    </h4>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        <li>• Ensure you have the right equipment</li>
                                        <li>• Check your availability for the scheduled time</li>
                                        <li>• Review customer location and requirements</li>
                                        <li>• Make sure your vehicle is ready</li>
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