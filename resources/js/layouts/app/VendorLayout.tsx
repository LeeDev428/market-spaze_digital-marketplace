import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react'; // Add usePage import
import LogoutButton from '../../components_vendor/LogoutButton';
import { 
    Store, 
    Package, 
    ShoppingCart, 
    BarChart3, 
    Bell, 
    UserCircle, 
    Menu, 
    X,
    Search,
    Settings,
    ChevronDown,
    DollarSign,
    TrendingUp,
    Users,
    Eye,
    Star,
    MessageSquare,
    Truck,
    CreditCard
} from 'lucide-react';

const sidebarLinks = [
    { 
        label: 'Dashboard', 
        href: '/vendor/dashboard', 
        icon: <BarChart3 size={20} />,
        description: 'Overview & Analytics'
    },
    { 
        label: 'Appointments', 
        href: '/vendor/appointments', 
        icon: <Users size={20} />,
        description: 'Customer\'s Appointments'
    },
    { 
        label: 'My Store', 
        href: '/vendor/store', 
        icon: <Store size={20} />,
        description: 'Store Management'
    },
    { 
        label: 'Products', 
        href: '/vendor/products', 
        icon: <Package size={20} />,
        description: 'Product Catalog'
    },
    { 
        label: 'Orders', 
        href: '/vendor/orders', 
        icon: <ShoppingCart size={20} />,
        description: 'Order Management'
    },

    { 
        label: 'Reviews', 
        href: '/vendor/reviews', 
        icon: <Star size={20} />,
        description: 'Customer Reviews'
    },
    { 
        label: 'Messages', 
        href: '/vendor/messages', 
        icon: <MessageSquare size={20} />,
        description: 'Customer Support'
    },
    { 
        label: 'Shipping', 
        href: '/vendor/shipping', 
        icon: <Truck size={20} />,
        description: 'Delivery Management'
    },
    { 
        label: 'Payments', 
        href: '/vendor/payments', 
        icon: <CreditCard size={20} />,
        description: 'Financial Reports'
    },
    { 
        label: 'Settings', 
        href: '/vendor/settings', 
        icon: <Settings size={20} />,
        description: 'Store Settings'
    },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const { props } = usePage();
    const vendorStore = (props as any).vendorStore || null;
    const auth = (props as any).auth || null;
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [messageCount, setMessageCount] = useState(0);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 1024;

    useEffect(() => {
        if (sidebarOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen, isMobile]);

    useEffect(() => {
        if (!isMobile) setSidebarOpen(false);
    }, [isMobile]);

    // Fetch total messages count
    useEffect(() => {
        const fetchMessageCount = async () => {
            if (auth?.user?.id) {
                try {
                    const response = await fetch(`http://127.0.0.1:3003/api/messages/total-count/${auth.user.id}`);
                    const data = await response.json();
                    if (data.success) {
                        setMessageCount(data.total_count);
                    }
                } catch (error) {
                    console.error('Failed to fetch message count:', error);
                }
            }
        };

        fetchMessageCount();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchMessageCount, 30000);
        return () => clearInterval(interval);
    }, [auth?.user?.id]);

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
                shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
            `}>
                {/* Sidebar Header - Fixed */}
                <div className="flex-shrink-0 p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img
                                    src="/img/marketspazemainlogo.png"
                                    alt="MarketSpaze"
                                    className="h-10 w-10 rounded-xl shadow-lg"
                                />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">MarketSpaze</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Vendor Portal</p>
                            </div>
                        </div>
                        {isMobile && (
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X size={20} className="text-slate-500 dark:text-slate-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Store Info - Fixed */}
                <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 
                                  rounded-lg p-4 border border-blue-100 dark:border-slate-600">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg 
                                          flex items-center justify-center text-white font-bold text-lg">
                                {vendorStore?.business_name ? vendorStore.business_name.charAt(0).toUpperCase() : 'VS'}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    {vendorStore?.business_name || 'Your Store Name'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {vendorStore?.business_type || 'Active Store'}
                                </p>
                                <div className="flex items-center space-x-1 mt-1">
                                    <Star size={12} className="text-amber-400 fill-current" />
                                    <span className="text-xs text-slate-600 dark:text-slate-300">
                                        {vendorStore?.rating ? `${vendorStore.rating} (${vendorStore.total_reviews || 0} reviews)` : '4.8 (234 reviews)'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {sidebarLinks.map((link) => {
                        const isActive = currentPath === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`
                                    group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive 
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }
                                `}
                                onClick={() => {
                                    if (isMobile) setSidebarOpen(false);
                                }}
                            >
                                <div className={`
                                    p-2 rounded-lg transition-colors
                                    ${isActive 
                                        ? 'bg-white/20' 
                                        : 'bg-slate-100 dark:bg-slate-600 group-hover:bg-slate-200 dark:group-hover:bg-slate-500'
                                    }
                                `}>
                                    {link.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium">{link.label}</p>
                                        {link.label === 'Messages' && messageCount > 0 && (
                                            <span className={`
                                                text-xs px-2 py-1 rounded-full font-medium min-w-[20px] text-center
                                                ${isActive 
                                                    ? 'bg-white/20 text-white' 
                                                    : 'bg-blue-500 text-white'
                                                }
                                            `}>
                                                {messageCount > 99 ? '99+' : messageCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {link.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button - Fixed */}
                <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <div className={`${isMobile ? '' : 'ml-72'} min-h-screen flex flex-col`}>
                {/* Top Header */}
                <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-30">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Left Section */}
                            <div className="flex items-center space-x-4">
                                {isMobile && (
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <Menu size={24} className="text-slate-600 dark:text-slate-400" />
                                    </button>
                                )}
                                
                                {/* Search Bar */}
                                <div className="relative hidden md:block">
                                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products, orders..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg 
                                                 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                                 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center space-x-4">
                                {/* Quick Actions */}
                                <Link 
                                    href="/vendor/products/create"
                                    className="hidden md:flex items-center space-x-2 px-3 py-2 text-sm font-medium 
                                             text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 
                                             rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    <Package size={16} />
                                    <span>Add Product</span>
                                </Link>

                                {/* Notifications */}
                                <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <Bell size={20} className="text-slate-600 dark:text-slate-400" />
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs 
                                                   rounded-full flex items-center justify-center">5</span>
                                </button>

                                {/* Messages */}
                                <Link 
                                    href="/vendor/messages" 
                                    className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors inline-block"
                                >
                                    <MessageSquare size={20} className="text-slate-600 dark:text-slate-400" />
                                    {messageCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs 
                                                       rounded-full flex items-center justify-center min-w-[20px]">
                                            {messageCount > 99 ? '99+' : messageCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg 
                                                      flex items-center justify-center text-white font-semibold text-sm">
                                            {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'V'}
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {auth?.user?.name || 'Vendor Name'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {auth?.user?.email || 'vendor@example.com'}
                                            </p>
                                        </div>
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </button>

                                    {/* User Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg 
                                                      border border-slate-200 dark:border-slate-700 py-2 z-50">
                                            <Link href="/vendor/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 
                                                                             hover:bg-slate-100 dark:hover:bg-slate-700">My Profile</Link>
                                            <Link href="/vendor/store/Index_store" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 
                                                                            hover:bg-slate-100 dark:hover:bg-slate-700">Store Settings</Link>
                                            <Link href="/vendor/billing" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 
                                                                              hover:bg-slate-100 dark:hover:bg-slate-700">Billing</Link>
                                            <hr className="my-2 border-slate-200 dark:border-slate-700" />
                                            <div className="px-4 py-2">
                                                <LogoutButton />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6 bg-slate-50 dark:bg-slate-900">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4">
                    <div className="px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                &copy; {new Date().getFullYear()} MarketSpaze Vendor Portal. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-4 mt-2 md:mt-0">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Need help?</span>
                                <a href="/vendor/support" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}