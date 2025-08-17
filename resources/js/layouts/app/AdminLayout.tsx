import React, { useState, useEffect } from 'react';
import LogoutButton from '../../components_admin/LogoutButton';
import { 
    LayoutDashboard, 
    Users, 
    Store, 
    Bell, 
    UserCircle, 
    Menu, 
    X,
    Search,
    Settings,
    ChevronDown,
    Package,
    BarChart3,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Activity
} from 'lucide-react';

const sidebarLinks = [
    { 
        label: 'Dashboard', 
        href: '/admin/dashboard', 
        icon: <LayoutDashboard size={20} />,
        description: 'Overview & Analytics'
    },
    { 
        label: 'Users', 
        href: '/admin/users', 
        icon: <Users size={20} />,
        description: 'Manage Users'
    },
    { 
        label: 'Vendor Stores', 
        href: '/admin/vendor-stores', 
        icon: <Store size={20} />,
        description: 'Vendor Store Management'
    },
    { 
        label: 'Products', 
        href: '/admin/products', 
        icon: <Package size={20} />,
        description: 'Product Catalog'
    },
    { 
        label: 'Orders', 
        href: '/admin/orders', 
        icon: <ShoppingCart size={20} />,
        description: 'Order Management'
    },
    { 
        label: 'Analytics', 
        href: '/admin/analytics', 
        icon: <BarChart3 size={20} />,
        description: 'Reports & Insights'
    },
    { 
        label: 'Settings', 
        href: '/admin/settings', 
        icon: <Settings size={20} />,
        description: 'System Settings'
    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);

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
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">MarketSpaze</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
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

                {/* Navigation - Scrollable */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {sidebarLinks.map((link) => {
                        const isActive = currentPath === link.href;
                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                className={`
                                    group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive 
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
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
                                    <p className="font-medium">{link.label}</p>
                                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {link.description}
                                    </p>
                                </div>
                            </a>
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
                                        placeholder="Search anything..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg 
                                                 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white
                                                 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                                                 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <Bell size={20} className="text-slate-600 dark:text-slate-400" />
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs 
                                                   rounded-full flex items-center justify-center">3</span>
                                </button>

                                {/* Activity */}
                                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <Activity size={20} className="text-slate-600 dark:text-slate-400" />
                                </button>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg 
                                                      flex items-center justify-center text-white font-semibold text-sm">
                                            A
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Admin User</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">admin@marketspaze.com</p>
                                        </div>
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </button>

                                    {/* User Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg 
                                                      border border-slate-200 dark:border-slate-700 py-2 z-50">
                                            <a href="/admin/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 
                                                                             hover:bg-slate-100 dark:hover:bg-slate-700">Profile</a>
                                            <a href="/admin/settings" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 
                                                                              hover:bg-slate-100 dark:hover:bg-slate-700">Settings</a>
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
                                &copy; {new Date().getFullYear()} MarketSpaze. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-4 mt-2 md:mt-0">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Version 2.1.0</span>
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">All systems operational</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}