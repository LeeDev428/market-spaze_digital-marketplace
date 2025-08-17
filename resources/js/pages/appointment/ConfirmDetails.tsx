import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    ArrowLeft, 
    User, 
    Mail, 
    Phone, 
    MessageSquare, 
    CheckCircle, 
    Shield,
    AlertCircle,
    Calendar,
    Clock,
    MapPin,
    Bell,
    Home
} from 'lucide-react';
import { VendorStore, Service } from './types/appointmentTypes';
import { generateAppointmentNumber } from './utils/appointmentUtils';
import SuccessMessage from '@/components/ui/msg_success';
import FailedMessage from '@/components/ui/msg_failed';
import { type BreadcrumbItem } from '@/types';

interface Props {
    store: VendorStore;
    service: Service;
    appointmentDate: string;
    appointmentTime: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appointments', href: '/appointments' },
];

export default function ConfirmDetails({ store, service, appointmentDate, appointmentTime }: Props) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showFailedMessage, setShowFailedMessage] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        appointment_number: generateAppointmentNumber(),
        vendor_store_id: store.id.toString(),
        service_id: service.id.toString(),
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        customer_city: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        customer_notes: '',
        requirements: [] as string[],
        sms_notifications: true,
        email_notifications: true,
        is_home_service: false,
        service_address: '',
    });

    const handleBack = () => {
        window.history.back();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        setShowSuccessMessage(false);
        setShowFailedMessage(false);
        
        post(route('appointments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccessMessage(true);
                setSubmitMessage('Appointment booked successfully! You will receive a confirmation email shortly.');
                reset();
                setData('appointment_number', generateAppointmentNumber());
            },
            onError: () => {
                setShowFailedMessage(true);
                setSubmitMessage('Failed to book appointment. Please check the form and try again.');
            }
        });
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Confirm Appointment Details" />
            
            {/* Success/Error Messages */}
            {showSuccessMessage && (
                <SuccessMessage
                    title="Booking Confirmed!"
                    message={submitMessage}
                    onClose={() => setShowSuccessMessage(false)}
                />
            )}

            {showFailedMessage && (
                <FailedMessage
                    title="Booking Failed!"
                    message={submitMessage}
                    errors={Object.values(errors).filter(Boolean).map(error => String(error))}
                    onClose={() => setShowFailedMessage(false)}
                />
            )}

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <button
                                onClick={handleBack}
                                className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-8 transition-colors group"
                            >
                                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium">Back to date & time</span>
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-8 text-white">
                                <h3 className="text-3xl font-bold mb-3">
                                    Complete Your Booking
                                </h3>
                                <p className="text-emerald-100">
                                    We're almost done! Please provide your contact information to confirm your appointment.
                                </p>
                            </div>

                            <div className="p-8">
                                {/* Appointment Summary */}
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-indigo-200 dark:border-indigo-800">
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                        Appointment Summary
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm">
                                                <User className="mr-3 text-indigo-600" size={16} />
                                                <span className="text-slate-600 dark:text-slate-400">Provider:</span>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                                    {store.business_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Shield className="mr-3 text-indigo-600" size={16} />
                                                <span className="text-slate-600 dark:text-slate-400">Service:</span>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                                    {service.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <MapPin className="mr-3 text-indigo-600" size={16} />
                                                <span className="text-slate-600 dark:text-slate-400">Location:</span>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                                    {store.address}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm">
                                                <Calendar className="mr-3 text-indigo-600" size={16} />
                                                <span className="text-slate-600 dark:text-slate-400">Date:</span>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                                    {formatDate(appointmentDate)}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Clock className="mr-3 text-indigo-600" size={16} />
                                                <span className="text-slate-600 dark:text-slate-400">Time:</span>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                                    {appointmentTime}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <span className="mr-3 text-indigo-600">₱</span>
                                                <span className="text-slate-600 dark:text-slate-400">Price:</span>
                                                <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                                    ₱{service.price_min.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Personal Information */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                            Personal Information
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Full Name *
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="text"
                                                        value={data.customer_name}
                                                        onChange={(e) => setData('customer_name', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                                                        placeholder="Enter your full name"
                                                        required
                                                    />
                                                </div>
                                                {errors.customer_name && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Email Address *
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="email"
                                                        value={data.customer_email}
                                                        onChange={(e) => setData('customer_email', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                                                        placeholder="Enter your email address"
                                                        required
                                                    />
                                                </div>
                                                {errors.customer_email && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.customer_email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Phone Number *
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="tel"
                                                        value={data.customer_phone}
                                                        onChange={(e) => setData('customer_phone', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                                                        placeholder="Enter your phone number"
                                                        required
                                                    />
                                                </div>
                                                {errors.customer_phone && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.customer_phone}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.customer_city}
                                                    onChange={(e) => setData('customer_city', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                                                    placeholder="Enter your city"
                                                    required
                                                />
                                                {errors.customer_city && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.customer_city}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                            Address Information
                                        </h4>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Complete Address *
                                            </label>
                                            <textarea
                                                value={data.customer_address}
                                                onChange={(e) => setData('customer_address', e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors resize-none"
                                                placeholder="Enter your complete address"
                                                required
                                            />
                                            {errors.customer_address && (
                                                <p className="mt-1 text-sm text-red-600">{errors.customer_address}</p>
                                            )}
                                        </div>

                                        {/* Home Service Option */}
                                        {store.home_service && (
                                            <div className="mt-6">
                                                <div className="flex items-start">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.is_home_service}
                                                        onChange={(e) => setData('is_home_service', e.target.checked)}
                                                        className="rounded border-slate-300 text-indigo-600 mt-1 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    />
                                                    <div className="ml-3">
                                                        <label className="text-sm font-medium text-slate-900 dark:text-white flex items-center">
                                                            <Home size={16} className="mr-2 text-indigo-600" />
                                                            Request Home Service
                                                        </label>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                            Have the service performed at your location
                                                        </p>
                                                    </div>
                                                </div>

                                                {data.is_home_service && (
                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                            Service Address
                                                        </label>
                                                        <textarea
                                                            value={data.service_address}
                                                            onChange={(e) => setData('service_address', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors resize-none"
                                                            placeholder="Address where service will be performed"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Additional Notes or Special Requirements
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-3 text-slate-400" size={16} />
                                            <textarea
                                                value={data.customer_notes}
                                                onChange={(e) => setData('customer_notes', e.target.value)}
                                                rows={4}
                                                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors resize-none"
                                                placeholder="Any special instructions, requirements, or notes for the service provider..."
                                            />
                                        </div>
                                    </div>

                                    {/* Service Requirements */}
                                    {service.requirements && service.requirements.length > 0 && (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                                                <AlertCircle className="mr-2 text-amber-600" size={20} />
                                                Service Requirements
                                            </h4>
                                            <div className="space-y-3">
                                                {service.requirements.map((requirement, index) => (
                                                    <label key={index} className="flex items-start">
                                                        <input
                                                            type="checkbox"
                                                            onChange={(e) => {
                                                                const newRequirements = e.target.checked
                                                                    ? [...data.requirements, requirement]
                                                                    : data.requirements.filter(r => r !== requirement);
                                                                setData('requirements', newRequirements);
                                                            }}
                                                            className="rounded border-amber-300 text-amber-600 mt-0.5 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                                                        />
                                                        <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                                            {requirement}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Notification Preferences */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                            Notification Preferences
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.email_notifications}
                                                    onChange={(e) => setData('email_notifications', e.target.checked)}
                                                    className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-3 text-sm text-slate-700 dark:text-slate-300 flex items-center">
                                                    <Mail size={16} className="mr-2 text-indigo-600" />
                                                    Email notifications for appointment updates
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.sms_notifications}
                                                    onChange={(e) => setData('sms_notifications', e.target.checked)}
                                                    className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-3 text-sm text-slate-700 dark:text-slate-300 flex items-center">
                                                    <Bell size={16} className="mr-2 text-indigo-600" />
                                                    SMS notifications for appointment reminders
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-4 px-8 rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            <ArrowLeft size={20} className="mr-2" />
                                            Back to Date & Time
                                        </button>
                                        
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`flex-1 ${
                                                processing
                                                    ? 'bg-slate-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                                            } text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl`}
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={20} className="mr-2" />
                                                    Confirm Appointment
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Security Notice */}
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                                        <div className="flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
                                            <Shield className="mr-2 text-emerald-600" size={16} />
                                            Your information is secure and encrypted. By confirming, you agree to our terms of service.
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
