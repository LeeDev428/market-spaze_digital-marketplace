import { Head } from '@inertiajs/react';
import RiderLayout from '@/layouts/app/RiderLayout';
import { 
    DollarSign, 
    Package, 
    Star, 
    TrendingUp, 
    Clock, 
    Bell,
    MapPin,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface RiderStats {
    today_earnings: number;
    total_earnings: number;
    completed_deliveries: number;
    active_deliveries: number;
    rating: number;
    status: string;
    is_online: boolean;
}

interface Rider {
    id: number;
    rider_id: string;
    name: string;
    email: string;
    phone: string;
    vehicle_type: string;
    license_number: string;
    status: string;
    is_online: boolean;
    rating: number;
}

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
        rider: {
            id: number;
            user_id?: number;
            rider_id: string;
            vehicle_type: string;
            license_plate: string;
            phone_number: string;
            status: string;
            rating: number;
            total_deliveries: number;
            earnings_today: number;
            earnings_total: number;
            is_online: boolean;
        };
    };
    rider?: Rider;
    stats: RiderStats;
    activeAppointments: any[];
    recentAppointments: any[];
    notifications: any[];
}

export default function RiderDashboard({ auth, rider, stats, activeAppointments, recentAppointments, notifications }: Props) {
    // Use auth.rider for layout compatibility, fallback to rider prop
    const riderData = auth?.rider || rider;
    const activeDeliveries = activeAppointments;
    const recentDeliveries = recentAppointments;
    
    // Debug logging
    console.log('Dashboard Props:', { auth, rider, stats, activeAppointments, recentAppointments, notifications });
    console.log('RiderData:', riderData);
    
    return (
        <RiderLayout>
            <Head title="Rider Dashboard" />
            
            <div className="space-y-6">
              
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {auth?.user?.name || 'Rider'}! 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Rider ID: {riderData?.rider_id || 'Loading...'}
                        </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {/* Online/Offline Status */}
                        <div className={`flex items-center px-3 py-2 rounded-lg ${
                            stats?.is_online 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                stats?.is_online ? 'bg-green-500' : 'bg-gray-500'
                            }`}></div>
                            {stats?.is_online ? 'Online' : 'Offline'}
                        </div>
                        
                        <form action="/rider/toggle-status" method="POST" style={{display: 'inline'}}>
                            <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                            <button
                                type="submit"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    stats?.is_online 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                            >
                                {stats?.is_online ? 'Go Offline' : 'Go Online'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <DollarSign className="h-8 w-8 text-green-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Earnings</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">₱{stats?.today_earnings || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">₱{stats?.total_earnings || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-purple-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Deliveries</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.completed_deliveries || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <Star className="h-8 w-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.rating || 5.0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/rider/deliveries/active"
                            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <Package className="h-8 w-8 text-blue-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Deliveries</p>
                                <p className="text-xs text-blue-600 dark:text-blue-300">{stats?.active_deliveries || 0} pending</p>
                            </div>
                        </a>

                        <a
                            href="/rider/earnings"
                            className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                            <DollarSign className="h-8 w-8 text-green-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">View Earnings</p>
                                <p className="text-xs text-green-600 dark:text-green-300">Financial reports</p>
                            </div>
                        </a>

                        <a
                            href="/rider/profile"
                            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                            <MapPin className="h-8 w-8 text-purple-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Update Profile</p>
                                <p className="text-xs text-purple-600 dark:text-purple-300">Manage info</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Active Deliveries */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Active Deliveries ({activeDeliveries?.length || 0})
                        </h3>
                    </div>
                    
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {activeDeliveries && activeDeliveries.length > 0 ? (
                            activeDeliveries.map((delivery, index) => (
                                <div key={delivery.id || index} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Delivery #{delivery.delivery_number || `DEL${index + 1}`}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {delivery.pickup_address || 'Pickup'} → {delivery.delivery_address || 'Delivery'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {delivery.status || 'pending'}
                                            </span>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                ₱{delivery.delivery_fee || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <Package size={48} className="mx-auto text-gray-400 mb-3" />
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    No active deliveries
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {stats?.is_online 
                                        ? "You're online and ready to receive delivery requests!" 
                                        : "Go online to start receiving delivery requests."
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Deliveries */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Recent Deliveries
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                            {recentDeliveries && recentDeliveries.length > 0 ? (
                                recentDeliveries.slice(0, 5).map((delivery, index) => (
                                    <div key={delivery.id || index} className="px-6 py-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <CheckCircle size={16} className="text-green-500 mr-2" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        #{delivery.delivery_number || `DEL${index + 1}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {delivery.completed_at || 'Completed'}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-green-600">
                                                ₱{delivery.delivery_fee || 0}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-8 text-center">
                                    <Clock size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">No recent deliveries</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Recent Notifications
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notification, index) => (
                                    <div key={notification.id || index} className="px-6 py-3">
                                        <div className="flex items-start">
                                            <Bell size={16} className="text-blue-500 mt-1 mr-3" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {notification.title || 'Notification'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {notification.message || 'You have a new notification'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-8 text-center">
                                    <Bell size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">No new notifications</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                System Status: All systems operational
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                You're connected and ready to receive delivery requests.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </RiderLayout>
    );
}