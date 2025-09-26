import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft,
    Star,
    Timer,
    Shield,
    CheckCircle,
    AlertTriangle,
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    MessageSquare,
    Award,
    Users,
    Heart,
    Share2,
    BadgeCheck,
    Camera,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Appointments', href: '/appointments' },
    { title: 'Service Details', href: '#' },
];

interface ServiceDetailsProps {
    service?: {
        id: number;
        name: string;
        description: string;
        category: string;
        price_min: number;
        price_max: number;
        duration_minutes: number;
        discount_percentage?: number;
        popular?: boolean;
        includes?: string[];
        requirements?: string[];
        images?: string[];
    };
    vendor?: {
        id: number;
        business_name: string;
        description: string;
        address: string;
        contact_phone: string;
        contact_email: string;
        rating?: number;
        total_reviews?: number;
        verified?: boolean;
        response_time?: string;
    };
}

export default function ServiceDetails({ service, vendor }: ServiceDetailsProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);

    // Safety check for undefined service
    if (!service || !vendor) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Service Details" />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <div className="container mx-auto px-4 py-8">
                        <div className="text-center">
                            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Service Not Found</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">The requested service could not be found.</p>
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="mr-2" size={20} />
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const discountedPrice = service.discount_percentage 
        ? service.price_min * (1 - service.discount_percentage / 100)
        : null;

    const images = service?.images || [
        '/img/service-placeholder-1.jpg',
        '/img/service-placeholder-2.jpg',
        '/img/service-placeholder-3.jpg'
    ];

    const handleBookService = () => {
        // Navigate back to appointments with this service selected
        window.location.href = `/appointments?service=${service?.id}`;
    };

    const handleContactVendor = () => {
        // Navigate to messages with this vendor
        window.location.href = `/messages?vendor=${vendor.id}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${service.name} - Service Details`} />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-8 transition-colors group"
                    >
                        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Services</span>
                    </button>

                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg">
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={service.name}
                                        className="w-full h-96 object-cover"
                                    />
                                    {service.popular && (
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                                <Star size={14} className="mr-1" />
                                                Popular Choice
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-colors">
                                            <Heart size={20} className="text-slate-600 dark:text-slate-400" />
                                        </button>
                                        <button className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-colors">
                                            <Share2 size={20} className="text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button
                                                onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                                
                                {/* Thumbnail Images */}
                                {images.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                                    currentImageIndex === index 
                                                        ? 'border-blue-500' 
                                                        : 'border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${service.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Service Details */}
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                                            {service.category}
                                        </span>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <Star className="text-yellow-400 fill-current mr-1" size={16} />
                                            <span className="font-medium">4.9</span>
                                            <span className="ml-1">(256 reviews)</span>
                                        </div>
                                    </div>
                                    
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                        {service.name}
                                    </h1>

                                    {/* Pricing */}
                                    <div className="flex items-center gap-3 mb-4">
                                        {discountedPrice ? (
                                            <>
                                                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                                                    ₱{discountedPrice.toLocaleString()}
                                                </span>
                                                <span className="text-xl text-slate-400 line-through">
                                                    ₱{service.price_min.toLocaleString()}
                                                </span>
                                                <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                                                    {service.discount_percentage}% OFF
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                                {service.price_min === service.price_max 
                                                    ? `₱${service.price_min.toLocaleString()}`
                                                    : `₱${service.price_min.toLocaleString()} - ₱${service.price_max.toLocaleString()}`
                                                }
                                            </span>
                                        )}
                                    </div>

                                    {/* Key Features */}
                                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-6">
                                        <div className="flex items-center">
                                            <Timer size={16} className="mr-2 text-blue-500" />
                                            {service.duration_minutes} minutes
                                        </div>
                                        <div className="flex items-center">
                                            <Shield size={16} className="mr-2 text-green-500" />
                                            Guaranteed Service
                                        </div>
                                        <div className="flex items-center">
                                            <Award size={16} className="mr-2 text-purple-500" />
                                            Professional
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleBookService}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
                                        >
                                            <Calendar size={20} className="mr-2" />
                                            Book Service
                                        </button>
                                        <button
                                            onClick={handleContactVendor}
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
                                        >
                                            <MessageSquare size={20} className="mr-2" />
                                            Message Vendor
                                        </button>
                                    </div>
                                </div>

                                {/* Vendor Info */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            Service Provider
                                        </h3>
                                        {vendor.verified && (
                                            <span className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                                                <BadgeCheck size={16} className="mr-1" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {vendor.business_name}
                                        </h4>
                                        
                                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center">
                                                <Star className="text-yellow-400 fill-current mr-1" size={16} />
                                                <span>{vendor.rating || 4.8} Rating</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="mr-1" size={16} />
                                                <span>{vendor.total_reviews || 127} Reviews</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock size={16} className="mr-1" />
                                                <span>{vendor.response_time || 'Within 1 hour'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <MapPin size={16} className="mr-2 flex-shrink-0" />
                                            <span>{vendor.address}</span>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <a
                                                href={`tel:${vendor.contact_phone}`}
                                                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                <Phone size={16} className="mr-2" />
                                                {vendor.contact_phone}
                                            </a>
                                            <a
                                                href={`mailto:${vendor.contact_email}`}
                                                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                <Mail size={16} className="mr-2" />
                                                {vendor.contact_email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="mt-8 grid lg:grid-cols-3 gap-6">
                            {/* Description */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                                    Service Description
                                </h3>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className={`text-slate-600 dark:text-slate-400 leading-relaxed ${!showFullDescription ? 'line-clamp-4' : ''}`}>
                                        {service.description || `Experience professional ${service.name.toLowerCase()} service with our expert team. We provide comprehensive solutions tailored to your specific needs, ensuring quality results and customer satisfaction. Our experienced professionals use industry-standard tools and techniques to deliver exceptional service that exceeds expectations.`}
                                    </p>
                                    {service.description && service.description.length > 200 && (
                                        <button
                                            onClick={() => setShowFullDescription(!showFullDescription)}
                                            className="text-blue-600 dark:text-blue-400 hover:underline mt-2 text-sm font-medium"
                                        >
                                            {showFullDescription ? 'Show Less' : 'Read More'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* What's Included & Requirements */}
                            <div className="space-y-6">
                                {/* What's Included */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                        What's Included
                                    </h3>
                                    <ul className="space-y-3">
                                        {(service.includes || [
                                            'Professional consultation',
                                            'Quality service guarantee',
                                            'Expert technician',
                                            'Follow-up support',
                                            'Service warranty'
                                        ]).map((item, index) => (
                                            <li key={index} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                                <CheckCircle size={16} className="mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Requirements */}
                                {service.requirements && service.requirements.length > 0 && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                            Requirements
                                        </h3>
                                        <ul className="space-y-3">
                                            {service.requirements.map((requirement, index) => (
                                                <li key={index} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                                    <AlertTriangle size={16} className="mr-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                                    {requirement}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}