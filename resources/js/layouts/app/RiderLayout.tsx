import { useState, useEffect, ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Menu, 
    X, 
    Bell, 
    User, 
    MapPin, 
    Package, 
    DollarSign, 
    Clock, 
    Star, 
    Settings, 
    LogOut,
    Home,
    Navigation,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Shield,
    BarChart3
} from 'lucide-react';

// Components
import RiderSidebar from '@/components_rider/navigation/RiderSidebar';
import RiderTopbar from '@/components_rider/navigation/RiderTopbar';
import RiderNotificationPanel from '@/components_rider/notifications/RiderNotificationPanel';
import RiderProfileDropdown from '@/components_rider/navigation/RiderProfileDropdown';

interface Props {
    children: ReactNode;
    title?: string;
    showSidebar?: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface RiderProfile {
    id: number;
    user_id: number;
    rider_id: string;
    vehicle_type: string;
    license_plate: string;
    phone_number: string;
    status: 'active' | 'inactive' | 'busy' | 'offline';
    rating: number;
    total_deliveries: number;
    earnings_today: number;
    earnings_total: number;
    is_online: boolean;
    current_location?: {
        latitude: number;
        longitude: number;
        address: string;
    };
}

interface PageProps {
    auth: {
        user: User;
        rider: RiderProfile;
    };
    flash?: {
        success?: string;
        error?: string;
        info?: string;
    };
    notifications?: Array<{
        id: number;
        title: string;
        message: string;
        type: 'delivery' | 'payment' | 'system';
        is_read: boolean;
        created_at: string;
    }>;
}

export default function RiderLayout({ children, title, showSidebar = true }: Props) {
    const { auth, flash, notifications } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(auth.rider?.is_online || false);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            // You can replace this with a toast notification
            console.log('Success:', flash.success);
        }
        if (flash?.error) {
            console.log('Error:', flash.error);
        }
    }, [flash]);

    // Toggle online status
    const toggleOnlineStatus = async () => {
        try {
            const response = await fetch('/rider/toggle-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ is_online: !isOnline }),
            });

            if (response.ok) {
                setIsOnline(!isOnline);
            }
        } catch (error) {
            console.error('Failed to toggle online status:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Head title={title} />

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex h-screen">
                {/* Sidebar */}
                {showSidebar && (
                    <RiderSidebar 
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        rider={auth.rider}
                        isOnline={isOnline}
                        onToggleOnline={toggleOnlineStatus}
                    />
                )}

                {/* Main content */}
                <div className={`flex-1 flex flex-col overflow-hidden ${showSidebar ? 'lg:ml-64' : ''}`}>
                    {/* Top bar */}
                    <RiderTopbar
                        user={auth.user}
                        rider={auth.rider}
                        onMenuClick={() => setSidebarOpen(true)}
                        onNotificationClick={() => setNotificationPanelOpen(true)}
                        notificationCount={notifications?.filter(n => !n.is_read).length || 0}
                        isOnline={isOnline}
                        showMenuButton={showSidebar}
                    />

                    {/* Main content area */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Notification Panel */}
            <RiderNotificationPanel
                isOpen={notificationPanelOpen}
                onClose={() => setNotificationPanelOpen(false)}
                notifications={notifications || []}
            />
        </div>
    );
}