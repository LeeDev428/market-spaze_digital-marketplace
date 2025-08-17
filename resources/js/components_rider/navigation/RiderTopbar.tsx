import { Menu, Bell, ChevronDown, Navigation, Zap, ZapOff } from 'lucide-react';
import { useState } from 'react';
import RiderProfileDropdown from './RiderProfileDropdown';

interface Props {
    user: any;
    rider: any;
    onMenuClick: () => void;
    onNotificationClick: () => void;
    notificationCount: number;
    isOnline: boolean;
    showMenuButton?: boolean;
}

export default function RiderTopbar({ 
    user, 
    rider, 
    onMenuClick, 
    onNotificationClick, 
    notificationCount, 
    isOnline,
    showMenuButton = true 
}: Props) {
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    return (
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    {showMenuButton && (
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                            <Menu size={24} />
                        </button>
                    )}

                    {/* Logo/Title for mobile */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center lg:hidden">
                            <Navigation size={16} className="text-white" />
                        </div>
                        <h1 className="font-semibold text-slate-900 dark:text-white lg:text-xl">
                            Rider Portal
                        </h1>
                    </div>
                </div>

                {/* Center Section - Status */}
                <div className="hidden md:flex items-center space-x-2">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                        isOnline 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                        {isOnline ? (
                            <>
                                <Zap size={16} className="text-green-600" />
                                <span>Online</span>
                            </>
                        ) : (
                            <>
                                <ZapOff size={16} className="text-slate-500" />
                                <span>Offline</span>
                            </>
                        )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        Today: ₱{rider?.earnings_today?.toFixed(2) || '0.00'}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button
                        onClick={onNotificationClick}
                        className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        <Bell size={20} />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden md:block font-medium">{user.name}</span>
                            <ChevronDown size={16} />
                        </button>

                        <RiderProfileDropdown
                            isOpen={profileDropdownOpen}
                            onClose={() => setProfileDropdownOpen(false)}
                            user={user}
                            rider={rider}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}