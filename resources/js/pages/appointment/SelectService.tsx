import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Star, 
    Timer, 
    Shield, 
    CheckCircle, 
    ChevronRight, 
    Sparkles, 
    AlertCircle,
    Settings,
    Users,
    Clock4,
    BadgeCheck
} from 'lucide-react';
import { VendorStore, Service } from './types/appointmentTypes';

interface Props {
    store: VendorStore;
    services: Service[];
}

export default function SelectService({ store, services = [] }: Props) {
    const handleServiceSelect = (service: Service) => {
        router.get('/appointment/select-date-time', { 
            store_id: store.id,
            service_id: service.id 
        });
    };

    const handleBack = () => {
        router.get('/appointment/select-provider');
    };

    const ServiceCard = ({ service }: { service: Service }) => {
        const discountedPrice = service.discount_percentage 
            ? service.price_min * (1 - service.discount_percentage / 100)
            : null;

        return (
            <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
                {/* Service Header */}
                <div className="relative p-6 pb-4">
                    {service.popular && (
                        <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-400 to-pink-500 text-white">
                                <Sparkles size={12} className="mr-1" />
                                Popular
                            </span>
                        </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {service.name}
                            </h3>
                            {service.category && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    {service.category}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                        {service.description || 'Professional service tailored to your needs.'}
                    </p>

                    {/* Service Features */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Timer size={14} className="mr-2 text-blue-500" />
                            {service.duration_minutes || 60} mins
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Shield size={14} className="mr-2 text-green-500" />
                            Guaranteed
                        </div>
                    </div>

                    {/* What's Included */}
                    {service.includes && service.includes.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                                What's Included:
                            </h4>
                            <ul className="space-y-1">
                                {service.includes.slice(0, 3).map((item, index) => (
                                    <li key={index} className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                                        <CheckCircle size={12} className="mr-2 text-green-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Requirements */}
                    {service.requirements && service.requirements.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                                <AlertCircle size={12} className="mr-2 flex-shrink-0" />
                                <span>
                                    {service.requirements.length} requirement{service.requirements.length > 1 ? 's' : ''} needed
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pricing & Action */}
                <div className="px-6 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                                {discountedPrice ? (
                                    <>
                                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            ₱{discountedPrice.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-slate-400 line-through">
                                            ₱{service.price_min.toLocaleString()}
                                        </span>
                                        <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
                                            -{service.discount_percentage}%
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {service.price_min === service.price_max 
                                            ? `₱${service.price_min.toLocaleString()}`
                                            : `₱${service.price_min.toLocaleString()} - ₱${service.price_max.toLocaleString()}`
                                        }
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Starting price
                            </span>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center justify-end mb-1">
                                <Star className="text-yellow-400 fill-current" size={14} />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                    4.9
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                256 reviews
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleServiceSelect(service)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group"
                    >
                        <span>Select Service</span>
                        <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Back Navigation & Store Info */}
                    <div className="mb-8">
                        <button
                            onClick={handleBack}
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
                                            {store.business_name}
                                        </h2>
                                        <p className="text-indigo-100 mb-4">
                                            Choose from our professional services
                                        </p>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center">
                                                <Star className="text-yellow-400 fill-current mr-1" size={16} />
                                                <span>{store.rating || 4.8} Rating</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="mr-1" size={16} />
                                                <span>{store.total_reviews || 127} Reviews</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock4 className="mr-1" size={16} />
                                                <span>{store.response_time || 'Within 1 hour'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {store.verified && (
                                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                                            <BadgeCheck className="text-white" size={28} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    {services.length === 0 ? (
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
                            {services.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
