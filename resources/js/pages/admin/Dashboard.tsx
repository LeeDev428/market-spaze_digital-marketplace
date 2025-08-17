import AdminLayout from '../../layouts/app/AdminLayout';
import { DollarSign, ShoppingCart, Users, TrendingUp, Store, Package, BarChart3, Settings } from 'lucide-react';

const adminStats = [
    { label: 'Total Revenue', value: '₱2.4M', change: '+12%', icon: <DollarSign size={24} />, color: 'emerald' },
    { label: 'Total Orders', value: '1,247', change: '+8%', icon: <ShoppingCart size={24} />, color: 'blue' },
    { label: 'Total Users', value: '8,549', change: '+24%', icon: <Users size={24} />, color: 'purple' },
    { label: 'Growth Rate', value: '23.5%', change: '+2.1%', icon: <TrendingUp size={24} />, color: 'orange' },
];

const systemStats = [
    { label: 'Active Vendors', value: '156', change: '+5%', icon: <Store size={20} />, color: 'blue' },
    { label: 'Total Products', value: '2,847', change: '+18%', icon: <Package size={20} />, color: 'green' },
    { label: 'Monthly Orders', value: '892', change: '+12%', icon: <ShoppingCart size={20} />, color: 'purple' },
    { label: 'System Health', value: '99.9%', change: '+0.1%', icon: <BarChart3 size={20} />, color: 'emerald' },
];

const quickActions = [
    { label: 'User Management', icon: <Users size={20} />, href: '/admin/users', color: 'blue' },
    { label: 'Vendor Approval', icon: <Store size={20} />, href: '/admin/vendors', color: 'green' },
    { label: 'System Analytics', icon: <BarChart3 size={20} />, href: '/admin/analytics', color: 'purple' },
    { label: 'System Settings', icon: <Settings size={20} />, href: '/admin/settings', color: 'orange' },
];

export default function Dashboard() {
    return (
        <AdminLayout>
            {/* Main Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {adminStats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                                <p className={`text-sm mt-1 ${
                                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {stat.change} from last month
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${
                                stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                stat.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                stat.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* System Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {systemStats.map((stat, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${
                                    stat.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                    stat.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                    stat.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                }`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                                        <p className={`text-xs ${
                                            stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {stat.change}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action, index) => (
                    <a
                        key={index}
                        href={action.href}
                        className={`p-4 rounded-xl border-2 border-dashed transition-all hover:border-solid hover:shadow-md ${
                            action.color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' :
                            action.color === 'green' ? 'border-green-300 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' :
                            action.color === 'purple' ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20' :
                            'border-orange-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                                action.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                action.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                action.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                                {action.icon}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{action.label}</span>
                        </div>
                    </a>
                ))}
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Welcome to MarketSpaze Admin Panel</h1>
                <p className="text-orange-100 mb-4">
                    Manage your marketplace with comprehensive tools and analytics. Monitor performance, approve vendors, and ensure smooth operations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Platform Health</h3>
                        <p className="text-sm text-orange-100">All systems operational</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Recent Activity</h3>
                        <p className="text-sm text-orange-100">15 new vendor applications</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Support Queue</h3>
                        <p className="text-sm text-orange-100">3 pending tickets</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}