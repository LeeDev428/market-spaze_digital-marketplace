import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { 
    Building2, 
    Star, 
    MapPin, 
    Phone, 
    Settings, 
    CheckCircle, 
    ChevronRight, 
    BadgeCheck, 
    Zap, 
    Home,
    Search,
    Grid3X3,
    List
} from 'lucide-react';
import { VendorStore } from './types/appointmentTypes';

interface Props {
    vendorStores: VendorStore[];
}

export default function SelectProvider({ vendorStores = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredStores = useMemo(() => {
        let filtered = vendorStores.filter(store => {
            const matchesSearch = store.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                store.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });

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

    const handleStoreSelect = (store: VendorStore) => {
        router.get('/appointment/select-service', { 
            store_id: store.id 
        });
    };

    const VendorCard = ({ store }: { store: VendorStore }) => {
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
                        onClick={() => handleStoreSelect(store)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
                    >
                        <span>Select Provider</span>
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
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                            Select a Provider
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Choose from our verified professional service providers
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
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
                                <VendorCard key={store.id} store={store} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
