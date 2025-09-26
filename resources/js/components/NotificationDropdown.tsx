import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
    id: number;
    type: string;
    status: string;
    message: string;
    appointment_number: string;
    customer_name?: string;
    vendor_name?: string;
    appointment_date: string;
    appointment_time: string;
    timestamp: string;
    is_read: boolean;
}

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, triggerRef }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications/appointments', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, triggerRef]);

    // Get status icon and color
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'pending':
                return { icon: <Clock className="h-4 w-4" />, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' };
            case 'confirmed':
                return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600 bg-green-100', label: 'Confirmed' };
            case 'in_progress':
                return { icon: <AlertCircle className="h-4 w-4" />, color: 'text-blue-600 bg-blue-100', label: 'In Progress' };
            case 'completed':
                return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600 bg-green-100', label: 'Completed' };
            case 'cancelled':
                return { icon: <XCircle className="h-4 w-4" />, color: 'text-red-600 bg-red-100', label: 'Cancelled' };
            default:
                return { icon: <Calendar className="h-4 w-4" />, color: 'text-gray-600 bg-gray-100', label: status };
        }
    };

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            
            if (diffInMinutes < 1) return 'Just now';
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
            if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
            
            return format(date, 'MMM d, yyyy');
        } catch (error) {
            return 'Unknown';
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notifications
                    </h3>
                    {notifications.length > 0 && (
                        <button
                            onClick={() => {
                                // Mark all as read API call
                                fetch('/api/notifications/mark-all-read', {
                                    method: 'POST',
                                    headers: {
                                        'Accept': 'application/json',
                                        'X-Requested-With': 'XMLHttpRequest',
                                    }
                                }).then(() => {
                                    fetchNotifications();
                                });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center">
                        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            You'll see appointment updates here
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification) => {
                            const statusDisplay = getStatusDisplay(notification.status);
                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Status Icon */}
                                        <div className={`p-2 rounded-full ${statusDisplay.color} flex-shrink-0`}>
                                            {statusDisplay.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                {notification.message}
                                            </p>
                                            
                                            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                                <span className={`px-2 py-1 rounded-full ${statusDisplay.color} font-medium`}>
                                                    {statusDisplay.label}
                                                </span>
                                                <span>#{notification.appointment_number}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {format(new Date(notification.appointment_date), 'MMM d, yyyy')} at{' '}
                                                    {format(new Date(`2000-01-01 ${notification.appointment_time}`), 'h:mm a')}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatTimestamp(notification.timestamp)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Unread indicator */}
                                        {!notification.is_read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;