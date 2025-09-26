import { useState, useEffect, useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import SuccessMessage from '@/components/ui/msg_success';
import FailedMessage from '@/components/ui/msg_failed';
import { 
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    MessageSquare,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Star,
    Building2,
    Settings,
    ArrowLeft,
    Shield,
    CreditCard,
    Award,
    Users,
    Timer,
    DollarSign,
    Bell,
    Home,
    Car,
    Zap,
    Heart,
    Filter,
    Search,
    Grid3X3,
    List,
    SortAsc,
    Info,
    AlertCircle,
    Camera,
    ThumbsUp,
    BadgeCheck,
    Sparkles,
    TrendingUp,
    Clock4,
    CalendarDays,
    Eye
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appointments', href: '/appointments' },
];

interface VendorStore {
    id: number;
    business_name: string;
    description: string;
    business_type: 'products' | 'services';
    address: string;
    contact_phone: string;
    contact_email: string;
    logo_path: string | null;
    serviceable_areas: string[];
    products_services: Service[];
    rating?: number;
    total_reviews?: number;
    verified?: boolean;
    response_time?: string;
    completion_rate?: number;
    years_experience?: number;
    specializations?: string[];
    certifications?: string[];
    working_hours?: {
        [key: string]: { open: string; close: string; closed?: boolean };
    };
    gallery_images?: string[];
    instant_booking?: boolean;
    home_service?: boolean;
}

interface Service {
    id: number;
    vendor_store_id: number;
    name: string;
    description: string;
    price_min: number;
    price_max: number;
    is_active: boolean;
    duration_minutes?: number;
    category?: string;
    requirements?: string[];
    includes?: string[];
    preparation_instructions?: string;
    cancellation_policy?: string;
    image_path?: string;
    popular?: boolean;
    discount_percentage?: number;
}

interface Props {
    vendorStores?: VendorStore[];
}

const timeslots = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
];

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Professional helper functions
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

function generateAppointmentNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Generate 4 random capital letters
    const randomLetters = Array.from({ length: 4 }, () => 
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    
    return `APT-${year}-${month}-${day}-${hours}${minutes}${seconds}-${randomLetters}`;
}

// Professional Vendor Card Component
const ProfessionalVendorCard = ({ store, onSelect }: { store: VendorStore; onSelect: (store: VendorStore) => void }) => {
    const [imageError, setImageError] = useState(false);

    const logoUrl = store.logo_path 
        ? `/storage/vendor-logos/${store.logo_path}`
        : null;

    const rating = store.rating || 4.8;
    const reviews = store.total_reviews || 127;
    const responseTime = store.response_time || "Within 1 hour";
    const completionRate = store.completion_rate || 98;

    return (
        <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1">
            {/* Header with Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                {store.gallery_images && store.gallery_images.length > 0 ? (
                    <img 
                        src={store.gallery_images[0]}
                        alt={store.business_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="text-slate-400" size={48} />
                    </div>
                )}
                
                {/* Overlay badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {store.verified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <BadgeCheck size={12} className="mr-1" />
                            Verified
                        </span>
                    )}
                    {store.instant_booking && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            <Zap size={12} className="mr-1" />
                            Instant Book
                        </span>
                    )}
                    {store.home_service && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            <Home size={12} className="mr-1" />
                            Home Service
                        </span>
                    )}
                </div>

                {/* Logo */}
                <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 ring-4 ring-white dark:ring-slate-800 shadow-lg">
                        {logoUrl && !imageError ? (
                            <img 
                                src={logoUrl}
                                alt={`${store.business_name} logo`}
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
                                <Building2 className="text-slate-400" size={20} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-12">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                            {store.business_name}
                        </h3>
                        <div className="flex items-center ml-2">
                            <Star className="text-yellow-400 fill-current" size={16} />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                {rating}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                ({reviews})
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            store.business_type === 'products' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                            {store.business_type === 'products' ? 'Products' : 'Services'}
                        </span>
                        {store.years_experience && (
                            <span className="text-xs">
                                {store.years_experience}+ years exp.
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {store.description || 'Professional service provider ready to help you with quality services.'}
                </p>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                            {completionRate}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                            Completion Rate
                        </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                            {responseTime}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                            Response Time
                        </div>
                    </div>
                </div>

                {/* Location & Contact */}
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center">
                        <MapPin size={14} className="mr-2 flex-shrink-0 text-slate-400" />
                        <span className="line-clamp-1">{store.address}</span>
                    </div>
                    <div className="flex items-center">
                        <Phone size={14} className="mr-2 flex-shrink-0 text-slate-400" />
                        <span>{store.contact_phone}</span>
                    </div>
                </div>

                {/* Services Count */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                        <Settings size={14} className="mr-2" />
                        {store.products_services?.length || 0} Services Available
                    </div>
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <CheckCircle size={14} className="mr-1" />
                        Available Today
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onSelect(store)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
                >
                    <span>Select Provider</span>
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

// Professional Service Card Component
const ProfessionalServiceCard = ({ service, onSelect }: { service: Service; onSelect: (service: Service) => void }) => {
    const discountedPrice = service.discount_percentage 
        ? service.price_min * (1 - service.discount_percentage / 100)
        : null;

    const handleViewDetails = () => {
        // Navigate to service details page
        window.location.href = `/service-details/${service.id}`;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* Header with Popular Badge */}
            {service.popular && (
                <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-center py-2">
                    <span className="text-sm font-medium flex items-center justify-center">
                        <Sparkles size={16} className="mr-2" />
                        Popular Choice
                    </span>
                </div>
            )}

            <div className="p-6">
                {/* Service Title & Category */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {service.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                        {service.description || 'Professional service tailored to your needs.'}
                    </p>
                    {service.category && (
                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                            {service.category}
                        </span>
                    )}
                </div>

                {/* Key Features */}
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                        <Timer size={16} className="mr-1 text-blue-500" />
                        {service.duration_minutes || 60} mins
                    </div>
                    <div className="flex items-center">
                        <Shield size={16} className="mr-1 text-green-500" />
                        Guaranteed
                    </div>
                    <div className="flex items-center ml-auto">
                        <Star className="text-yellow-400 fill-current mr-1" size={16} />
                        <span className="font-medium">4.9</span>
                        <span className="text-xs ml-1">(256)</span>
                    </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-1">
                        {discountedPrice ? (
                            <>
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    ₱{discountedPrice.toLocaleString()}
                                </span>
                                <span className="text-lg text-slate-400 line-through">
                                    ₱{service.price_min.toLocaleString()}
                                </span>
                                <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                                    -{service.discount_percentage}% OFF
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {service.price_min === service.price_max 
                                    ? `₱${service.price_min.toLocaleString()}`
                                    : `₱${service.price_min.toLocaleString()} - ₱${service.price_max.toLocaleString()}`
                                }
                            </span>
                        )}
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Starting price</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleViewDetails}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                        <Eye size={16} className="mr-2" />
                        View Details
                    </button>
                    <button
                        onClick={() => onSelect(service)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center group"
                    >
                        Select Service
                        <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ProfessionalAppointments({ vendorStores = [] }: Props) {
    const { props } = usePage();
    
    const today = new Date();
    const [currentStep, setCurrentStep] = useState(1);
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedStore, setSelectedStore] = useState<VendorStore | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showFailedMessage, setShowFailedMessage] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    
    // Professional filtering states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('rating');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        appointment_number: generateAppointmentNumber(),
        vendor_store_id: '',
        service_id: '',
        appointment_date: '',
        appointment_time: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        customer_city: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        customer_notes: '',
        requirements: [] as string[],
        sms_notifications: true as boolean,
        email_notifications: true as boolean,
        is_home_service: false as boolean,
        service_address: '',
    });

    // Professional filtering logic
    const filteredStores = useMemo(() => {
        let filtered = vendorStores.filter(store => {
            const matchesSearch = store.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                store.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });

        // Sort stores
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'reviews':
                    return (b.total_reviews || 0) - (a.total_reviews || 0);
                case 'name':
                    return a.business_name.localeCompare(b.business_name);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [vendorStores, searchQuery, sortBy]);

    // Get services with filtering
    const getServicesForStore = (store: VendorStore) => {
        let services = store.products_services?.filter(service => service.is_active) || [];
        
        if (selectedCategory !== 'all') {
            services = services.filter(service => service.category === selectedCategory);
        }

        services = services.filter(service => 
            service.price_min >= priceRange[0] && service.price_min <= priceRange[1]
        );

        return services;
    };

    // Professional event handlers
    const handleStoreSelect = (store: VendorStore) => {
        setSelectedStore(store);
        setData('vendor_store_id', store.id.toString());
        clearErrors('vendor_store_id');
        setCurrentStep(2);
    };

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);
        setData('service_id', service.id.toString());
        clearErrors('service_id');
        setCurrentStep(3);
    };

    // Calendar logic
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentYear, currentMonth, day);
        if (!isPastDate(clickedDate)) {
            setSelectedDate(clickedDate);
            // Fix timezone issue by formatting date manually instead of using toISOString()
            const year = clickedDate.getFullYear();
            const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(clickedDate.getDate()).padStart(2, '0');
            setData('appointment_date', `${year}-${month}-${dayStr}`);
            clearErrors('appointment_date');
        }
    };

    const handleTimeSelect = (time: string) => {
        setData('appointment_time', time);
        clearErrors('appointment_time');
        setCurrentStep(4);
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
                // Generate new appointment number after reset
                setData('appointment_number', generateAppointmentNumber());
                setCurrentStep(1);
                setSelectedDate(null);
                setSelectedStore(null);
                setSelectedService(null);
            },
            onError: () => {
                setShowFailedMessage(true);
                setSubmitMessage('Failed to book appointment. Please check the form and try again.');
            }
        });
    };

    // Calendar grid generation
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) week.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }
    if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
    }

    const getStepStatus = (step: number) => {
        if (currentStep > step) return 'completed';
        if (currentStep === step) return 'active';
        return 'pending';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Professional Appointment Booking" />
            
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
                    {/* Professional Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center space-x-6 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
                                {[
                                    { step: 1, label: 'Select Provider', icon: Building2, desc: 'Choose professional' },
                                    { step: 2, label: 'Pick Service', icon: Settings, desc: 'Select service type' },
                                    { step: 3, label: 'Date & Time', icon: Calendar, desc: 'Schedule appointment' },
                                    { step: 4, label: 'Confirm Details', icon: User, desc: 'Complete booking' }
                                ].map(({ step, label, icon: Icon, desc }) => (
                                    <div key={step} className="flex items-center">
                                        <div className="flex flex-col items-center">
                                            <div className={`flex items-center justify-center w-16 h-16 rounded-xl border-2 transition-all duration-300 ${
                                                getStepStatus(step) === 'completed' 
                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                                                    : getStepStatus(step) === 'active'
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105'
                                                    : 'border-slate-300 text-slate-400 dark:border-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-slate-700'
                                            }`}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="text-center mt-4">
                                                <div className={`text-sm font-semibold ${
                                                    getStepStatus(step) === 'active' 
                                                        ? 'text-indigo-600 dark:text-indigo-400'
                                                        : getStepStatus(step) === 'completed'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-slate-600 dark:text-slate-400'
                                                }`}>
                                                    {label}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                                    {desc}
                                                </div>
                                            </div>
                                        </div>
                                        {step < 4 && (
                                            <div className={`w-16 h-0.5 mx-6 rounded-full transition-all duration-300 ${
                                                getStepStatus(step + 1) !== 'pending' 
                                                    ? 'bg-emerald-600' 
                                                    : 'bg-slate-300 dark:bg-slate-600'
                                            }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="max-w-7xl mx-auto">
                        {/* Step 1: Professional Provider Selection */}
                        {currentStep === 1 && (
                            <div>
                                {/* Advanced Search & Filter Bar */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                        {/* Search */}
                                        <div className="flex-1 max-w-md">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="Search providers by name or service..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Filters */}
                                        <div className="flex items-center gap-4">
                                            {/* Sort */}
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                                            >
                                                <option value="rating">Highest Rated</option>
                                                <option value="reviews">Most Reviews</option>
                                                <option value="name">Name A-Z</option>
                                            </select>

                                            {/* View Mode */}
                                            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                                <button
                                                    onClick={() => setViewMode('grid')}
                                                    className={`p-2 rounded-md transition-colors ${
                                                        viewMode === 'grid' 
                                                            ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600' 
                                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <Grid3X3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('list')}
                                                    className={`p-2 rounded-md transition-colors ${
                                                        viewMode === 'list' 
                                                            ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600' 
                                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <List size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Providers Grid */}
                                {filteredStores.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 max-w-md mx-auto">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Building2 className="text-slate-400" size={32} />
                                            </div>
                                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                                No providers found
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                                Try adjusting your search criteria or check back later for new providers.
                                            </p>
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                Clear Search
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`grid gap-6 ${
                                        viewMode === 'grid' 
                                            ? 'md:grid-cols-2 lg:grid-cols-3' 
                                            : 'grid-cols-1 max-w-4xl mx-auto'
                                    }`}>
                                        {filteredStores.map((store) => (
                                            <ProfessionalVendorCard
                                                key={store.id}
                                                store={store}
                                                onSelect={handleStoreSelect}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Professional Service Selection */}
                        {currentStep === 2 && selectedStore && (
                            <div>
                                {/* Back Navigation & Store Info */}
                                <div className="mb-8">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-8 transition-colors group"
                                    >
                                        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                        <span className="font-medium">Back to providers</span>
                                    </button>
                                    
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-2xl font-bold mb-2">
                                                        {selectedStore.business_name}
                                                    </h2>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-indigo-100">
                                                            Choose from our professional services
                                                        </p>
                                                        <button
                                                            onClick={() => window.location.href = `/messages?vendor=${selectedStore.id}`}
                                                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center text-sm"
                                                        >
                                                            <MessageSquare size={16} className="mr-2" />
                                                            Message
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center">
                                                            <Star className="text-yellow-400 fill-current mr-1" size={16} />
                                                            <span>{selectedStore.rating || 4.8} Rating</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Users className="mr-1" size={16} />
                                                            <span>{selectedStore.total_reviews || 127} Reviews</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock4 className="mr-1" size={16} />
                                                            <span>{selectedStore.response_time || 'Within 1 hour'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {selectedStore.verified && (
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                                        <BadgeCheck className="text-white" size={28} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Services */}
                                {getServicesForStore(selectedStore).length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 max-w-md mx-auto">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Settings className="text-slate-400" size={32} />
                                            </div>
                                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                                No services available
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-400">
                                                This provider is currently updating their service offerings.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {getServicesForStore(selectedStore).map((service) => (
                                            <ProfessionalServiceCard
                                                key={service.id}
                                                service={service}
                                                onSelect={handleServiceSelect}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Professional Date & Time Selection */}
                        {currentStep === 3 && selectedStore && selectedService && (
                            <div>
                                {/* Back Navigation & Service Summary */}
                                <div className="mb-8">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-8 transition-colors group"
                                    >
                                        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                        <span className="font-medium">Back to services</span>
                                    </button>
                                    
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-2xl font-bold mb-2">
                                                        {selectedService.name}
                                                    </h2>
                                                    <p className="text-blue-100 mb-4">
                                                        with {selectedStore.business_name}
                                                    </p>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div className="flex items-center">
                                                            <DollarSign className="mr-1" size={16} />
                                                            <span>
                                                                {selectedService.price_min === selectedService.price_max 
                                                                    ? `₱${selectedService.price_min.toLocaleString()}`
                                                                    : `₱${selectedService.price_min.toLocaleString()} - ₱${selectedService.price_max.toLocaleString()}`
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Timer className="mr-1" size={16} />
                                                            <span>{selectedService.duration_minutes || 60} minutes</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Calendar & Time Selection */}
                                <div className="grid gap-8 lg:grid-cols-2">
                                    {/* Calendar */}
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="bg-slate-50 dark:bg-slate-700 p-6 border-b border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                    Select Date
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handlePrevMonth}
                                                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                    >
                                                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                                                    </button>
                                                    <span className="text-base font-medium text-slate-900 dark:text-white px-4">
                                                        {monthNames[currentMonth]} {currentYear}
                                                    </span>
                                                    <button
                                                        onClick={handleNextMonth}
                                                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                    >
                                                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6">
                                            {/* Day Names */}
                                            <div className="grid grid-cols-7 gap-1 mb-4">
                                                {dayNames.map(day => (
                                                    <div key={day} className="p-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Calendar Days */}
                                            <div className="grid grid-cols-7 gap-1">
                                                {weeks.map((week, i) => (
                                                    week.map((day, j) => {
                                                        const date = day ? new Date(currentYear, currentMonth, day) : null;
                                                        const isSelected = selectedDate && date &&
                                                            selectedDate.getDate() === day &&
                                                            selectedDate.getMonth() === currentMonth &&
                                                            selectedDate.getFullYear() === currentYear;
                                                        const isPast = date ? isPastDate(date) : false;
                                                        const isToday = date && 
                                                            date.getDate() === today.getDate() &&
                                                            date.getMonth() === today.getMonth() &&
                                                            date.getFullYear() === today.getFullYear();
                                                        
                                                        return (
                                                            <div key={`${i}-${j}`} className="aspect-square">
                                                                {day ? (
                                                                    <button
                                                                        onClick={() => handleDateClick(day)}
                                                                        disabled={isPast}
                                                                        className={`w-full h-full rounded-lg text-sm font-medium transition-all duration-200 relative ${
                                                                            isSelected
                                                                                ? 'bg-indigo-600 text-white shadow-md'
                                                                                : isPast
                                                                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                                                : isToday
                                                                                ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                                        }`}
                                                                    >
                                                                        {day}
                                                                        {isToday && !isSelected && (
                                                                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                                                                        )}
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        );
                                                    })
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="bg-slate-50 dark:bg-slate-700 p-6 border-b border-slate-200 dark:border-slate-600">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                Available Times
                                            </h3>
                                        </div>
                                        
                                        <div className="p-6">
                                            {selectedDate ? (
                                                <div className="space-y-6">
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                                        <Calendar size={16} className="mr-2 text-indigo-600" />
                                                        <span className="font-medium">
                                                            {selectedDate.toLocaleDateString('en-US', { 
                                                                weekday: 'long', 
                                                                year: 'numeric', 
                                                                month: 'long', 
                                                                day: 'numeric' 
                                                            })}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                                                        {timeslots.map((time) => {
                                                            const isSelected = data.appointment_time === time;
                                                            return (
                                                                <button
                                                                    key={time}
                                                                    onClick={() => handleTimeSelect(time)}
                                                                    className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                                                                        isSelected
                                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                                            : 'border-slate-200 hover:border-indigo-300 dark:border-slate-600 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                                                    }`}
                                                                >
                                                                    <Clock size={14} className="mr-2" />
                                                                    {time}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-16">
                                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Calendar size={32} className="text-slate-400" />
                                                    </div>
                                                    <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                                        Select a date first
                                                    </h4>
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        Choose your preferred date to see available time slots
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Professional Contact Details & Confirmation */}
                        {currentStep === 4 && (
                            <div className="max-w-4xl mx-auto">
                                <div className="mb-8">
                                    <button
                                        onClick={() => setCurrentStep(3)}
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
                                        {/* Booking Summary */}
                                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-indigo-200 dark:border-indigo-800">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">
                                                    Booking Summary
                                                </h4>
                                                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-700">
                                                    <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400">
                                                        {data.appointment_number}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center">
                                                        <Building2 className="text-indigo-600 mr-3" size={20} />
                                                        <div>
                                                            <div className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">Provider</div>
                                                            <div className="font-semibold text-indigo-900 dark:text-indigo-300">
                                                                {selectedStore?.business_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center">
                                                        <Settings className="text-blue-600 mr-3" size={20} />
                                                        <div>
                                                            <div className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">Service</div>
                                                            <div className="font-semibold text-indigo-900 dark:text-indigo-300">
                                                                {selectedService?.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div className="flex items-center">
                                                        <Calendar className="text-emerald-600 mr-3" size={20} />
                                                        <div>
                                                            <div className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">Date</div>
                                                            <div className="font-semibold text-indigo-900 dark:text-indigo-300">
                                                                {selectedDate?.toLocaleDateString('en-US', { 
                                                                    weekday: 'long', 
                                                                    year: 'numeric', 
                                                                    month: 'long', 
                                                                    day: 'numeric' 
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center">
                                                        <Clock className="text-orange-600 mr-3" size={20} />
                                                        <div>
                                                            <div className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">Time</div>
                                                            <div className="font-semibold text-indigo-900 dark:text-indigo-300">
                                                                {data.appointment_time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Form */}
                                        <form onSubmit={handleSubmit} className="space-y-8">
                                            <div className="grid md:grid-cols-2 gap-8">
                                                {/* Personal Information */}
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                                        <User className="mr-2 text-indigo-600" size={20} />
                                                        Personal Information
                                                    </h4>
                                                    
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
                                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors ${
                                                                    errors.customer_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                                                }`}
                                                                placeholder="Enter your full name"
                                                            />
                                                        </div>
                                                        {errors.customer_name && (
                                                            <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
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
                                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors ${
                                                                    errors.customer_email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                                                }`}
                                                                placeholder="Enter your email address"
                                                            />
                                                        </div>
                                                        {errors.customer_email && (
                                                            <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
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
                                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors ${
                                                                    errors.customer_phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                                                }`}
                                                                placeholder="Enter your phone number"
                                                            />
                                                        </div>
                                                        {errors.customer_phone && (
                                                            <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Address Information */}
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                                        <MapPin className="mr-2 text-blue-600" size={20} />
                                                        Address Information
                                                    </h4>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                            Full Address *
                                                        </label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                                            <textarea
                                                                value={data.customer_address}
                                                                onChange={(e) => setData('customer_address', e.target.value)}
                                                                rows={3}
                                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors resize-none ${
                                                                    errors.customer_address ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                                                }`}
                                                                placeholder="Enter your complete address"
                                                            />
                                                        </div>
                                                        {errors.customer_address && (
                                                            <p className="text-red-500 text-sm mt-1">{errors.customer_address}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                            City *
                                                        </label>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                                            <input
                                                                type="text"
                                                                value={data.customer_city}
                                                                onChange={(e) => setData('customer_city', e.target.value)}
                                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors ${
                                                                    errors.customer_city ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                                                }`}
                                                                placeholder="Enter your city"
                                                            />
                                                        </div>
                                                        {errors.customer_city && (
                                                            <p className="text-red-500 text-sm mt-1">{errors.customer_city}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Emergency Contact & Preferences */}
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                                        <Shield className="mr-2 text-emerald-600" size={20} />
                                                        Emergency Contact
                                                    </h4>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                            Emergency Contact Name
                                                        </label>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                                            <input
                                                                type="text"
                                                                value={data.emergency_contact_name}
                                                                onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                                                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                                                                placeholder="Emergency contact name"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                            Emergency Contact Phone
                                                        </label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                                            <input
                                                                type="tel"
                                                                value={data.emergency_contact_phone}
                                                                onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                                                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                                                                placeholder="Emergency contact phone"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Preferences */}
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                                        <Bell className="mr-2 text-purple-600" size={20} />
                                                        Preferences
                                                    </h4>
                                                    
                                                    <div className="space-y-4">
                                                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                                            <h5 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Notifications</h5>
                                                            <div className="space-y-3">
                                                                <label className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={data.email_notifications}
                                                                        onChange={(e) => setData('email_notifications', e.target.checked)}
                                                                        className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                    />
                                                                    <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                                                        Email updates & reminders
                                                                    </span>
                                                                </label>
                                                                
                                                                <label className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={data.sms_notifications}
                                                                        onChange={(e) => setData('sms_notifications', e.target.checked)}
                                                                        className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                    />
                                                                    <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                                                        SMS notifications
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </div>

                                                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                                                            <label className="flex items-start">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.is_home_service}
                                                                    onChange={(e) => setData('is_home_service', e.target.checked)}
                                                                    className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 mt-0.5"
                                                                />
                                                                <div className="ml-3">
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                        Home service requested
                                                                    </span>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                        Service will be performed at your location
                                                                    </p>
                                                                </div>
                                                            </label>
                                                            
                                                            {data.is_home_service && (
                                                                <div className="mt-4">
                                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                                        Service Address
                                                                    </label>
                                                                    <div className="relative">
                                                                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                                                        <input
                                                                            type="text"
                                                                            value={data.service_address}
                                                                            onChange={(e) => setData('service_address', e.target.value)}
                                                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-600 dark:text-white transition-colors"
                                                                            placeholder="Address where service will be performed"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
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
                                            {selectedService?.requirements && selectedService.requirements.length > 0 && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                                                        <AlertCircle className="mr-2 text-amber-600" size={20} />
                                                        Service Requirements
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {selectedService.requirements.map((requirement, index) => (
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

                                            {/* Submit Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentStep(3)}
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
                        )}
                    </div>

                    {/* Professional Progress Steps */}
                
                </div>
            </div>
        </AppLayout>
    );
}