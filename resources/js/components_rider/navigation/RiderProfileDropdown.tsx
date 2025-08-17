import { Link } from '@inertiajs/react';
import { User, Settings, HelpCircle, LogOut, Star, Package } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    rider: any;
}

export default function RiderProfileDropdown({ isOpen, onClose, user, rider }: Props) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={onClose} />
            
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20">
                {/* User Info */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                    </div>
                    
                    {/* Rider Stats */}
                    <div className="mt-3 flex justify-between text-sm">
                        <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-400 fill-current" />
                            <span className="text-slate-600 dark:text-slate-400">
                                {rider?.rating?.toFixed(1) || '5.0'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Package size={14} className="text-blue-500" />
                            <span className="text-slate-600 dark:text-slate-400">
                                {rider?.total_deliveries || 0} deliveries
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                    <Link
                        href="/rider/profile"
                        onClick={onClose}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <User size={16} className="mr-3" />
                        View Profile
                    </Link>
                    
                    <Link
                        href="/rider/settings"
                        onClick={onClose}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <Settings size={16} className="mr-3" />
                        Settings
                    </Link>
                    
                    <Link
                        href="/rider/help"
                        onClick={onClose}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <HelpCircle size={16} className="mr-3" />
                        Help & Support
                    </Link>
                </div>

                {/* Logout */}
                <div className="py-2 border-t border-slate-200 dark:border-slate-700">
                    <Link
                        href="/logout"
                        method="post"
                        onClick={onClose}
                        className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut size={16} className="mr-3" />
                        Logout
                    </Link>
                </div>
            </div>
        </>
    );
}