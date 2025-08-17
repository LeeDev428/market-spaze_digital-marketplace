import { Link, usePage } from '@inertiajs/react';
import { 
    Home, 
    Package, 
    MapPin, 
    DollarSign, 
    BarChart3, 
    User, 
    Settings, 
    LogOut,
    Navigation,
    Clock,
    Star,
    X
} from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    rider: any;
    isOnline: boolean;
    onToggleOnline: () => void;
}

export default function RiderSidebar({ isOpen, onClose, rider, isOnline, onToggleOnline }: Props) {
    const { url } = usePage();

    const navigation = [
        { name: 'Dashboard', href: '/rider/dashboard', icon: Home, current: url === '/rider/dashboard' },
        { name: 'Active Deliveries', href: '/rider/deliveries/active', icon: Package, current: url.startsWith('/rider/deliveries/active') },
        { name: 'Delivery History', href: '/rider/deliveries/history', icon: Clock, current: url.startsWith('/rider/deliveries/history') },
        { name: 'Navigation', href: '/rider/navigation', icon: MapPin, current: url === '/rider/navigation' },
        { name: 'Earnings', href: '/rider/earnings', icon: DollarSign, current: url === '/rider/earnings' },
        { name: 'Analytics', href: '/rider/analytics', icon: BarChart3, current: url === '/rider/analytics' },
        { name: 'Profile', href: '/rider/profile', icon: User, current: url === '/rider/profile' },
        { name: 'Settings', href: '/rider/settings', icon: Settings, current: url === '/rider/settings' },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg">
                    
                    {/* Rider Info Header - Fixed height */}
                    <div className="flex-shrink-0 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Navigation size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">Rider #{rider?.rider_id || 'N/A'}</h3>
                                <p className="text-blue-100 text-xs">{rider?.vehicle_type || 'Motorcycle'}</p>
                            </div>
                        </div>
                        
                        {/* Online Status Toggle */}
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-blue-100">Status:</span>
                            <button
                                onClick={onToggleOnline}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    isOnline
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-500 text-white'
                                }`}
                            >
                                {isOnline ? 'Online' : 'Offline'}
                            </button>
                        </div>
                    </div>

                    {/* Navigation - Scrollable flex-grow area */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        item.current
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Icon size={18} className="mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom section - Fixed at bottom */}
                    <div className="flex-shrink-0">
                        {/* Rider Stats */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Rating:</span>
                                    <div className="flex items-center space-x-1">
                                        <Star size={14} className="text-yellow-400 fill-current" />
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {rider?.rating ? Number(rider.rating).toFixed(1) : '5.0'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Deliveries:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {rider?.total_deliveries || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Logout - Always visible at bottom */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <Link
                                href="/logout"
                                method="post"
                                className="group flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full"
                            >
                                <LogOut size={18} className="mr-3" />
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar - Same fixes applied */}
            <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    
                    {/* Mobile Header - Fixed height */}
                    <div className="flex-shrink-0 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Navigation size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Rider #{rider?.rider_id || 'N/A'}</h3>
                                    <p className="text-blue-100 text-xs">{rider?.vehicle_type || 'Motorcycle'}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-blue-100">Status:</span>
                            <button
                                onClick={onToggleOnline}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    isOnline ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                                }`}
                            >
                                {isOnline ? 'Online' : 'Offline'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation - Scrollable */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        item.current
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Icon size={18} className="mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile bottom section - Fixed at bottom */}
                    <div className="flex-shrink-0">
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Rating:</span>
                                    <div className="flex items-center space-x-1">
                                        <Star size={14} className="text-yellow-400 fill-current" />
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {rider?.rating ? Number(rider.rating).toFixed(1) : '5.0'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Deliveries:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {rider?.total_deliveries || 0}
                                    </span>
                                </div>
                            </div>

                            <Link
                                href="/logout"
                                method="post"
                                className="group flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full"
                            >
                                <LogOut size={18} className="mr-3" />
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile backdrop */}
            {isOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
            )}
        </>
    );
}