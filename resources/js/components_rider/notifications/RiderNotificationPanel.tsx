import { X, Package, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'delivery' | 'payment' | 'system';
    is_read: boolean;
    created_at: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
}

export default function RiderNotificationPanel({ isOpen, onClose, notifications }: Props) {
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'delivery':
                return <Package size={20} className="text-blue-500" />;
            case 'payment':
                return <DollarSign size={20} className="text-green-500" />;
            case 'system':
                return <AlertTriangle size={20} className="text-orange-500" />;
            default:
                return <CheckCircle size={20} className="text-slate-500" />;
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            await fetch(`/rider/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            // Refresh notifications or update state
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
            
            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-xl z-50 transform transition-transform duration-300">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-blue-100 text-sm mt-1">
                        {notifications.filter(n => !n.is_read).length} unread notifications
                    </p>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <CheckCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <h4 className="font-medium text-slate-900 dark:text-white mb-2">All caught up!</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                You have no new notifications
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                                        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                    }`}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <h4 className={`text-sm font-medium ${
                                                    !notification.is_read 
                                                        ? 'text-slate-900 dark:text-white' 
                                                        : 'text-slate-700 dark:text-slate-300'
                                                }`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.is_read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => {
                                // Mark all as read
                                notifications.forEach(n => !n.is_read && markAsRead(n.id));
                            }}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Mark All as Read
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}