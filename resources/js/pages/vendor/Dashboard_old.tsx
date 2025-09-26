import VendorLayout from '../../layouts/app/VendorLayout';
import { DollarSign, ShoppingCart, Eye, Star, TrendingUp, Package, Users, MessageSquare, MapPin, Clock, CreditCard, Settings, CheckCircle, AlertCircle } from 'lucide-react';

// Laundry Service Stats
const laundryStats = [
    { label: 'Monthly Revenue', value: '₱45.2K', change: '+15%', icon: <DollarSign size={24} />, color: 'emerald' },
    { label: 'Orders Today', value: '12', change: '+3', icon: <ShoppingCart size={24} />, color: 'blue' },
    { label: 'Customer Rating', value: '4.8', change: '+0.2', icon: <Star size={24} />, color: 'amber' },
    { label: 'Service Areas', value: '5', change: '+1', icon: <MapPin size={24} />, color: 'purple' },
];

// Setup Progress Tracker
const setupSteps = [
    { 
        title: 'Business Profile Setup', 
        completed: true, 
        items: ['Business Name', 'Address/Service Areas', 'Contact Info', 'Service Description & Logo'] 
    },
    { 
        title: 'Service Configuration', 
        completed: false, 
        items: ['Pricing Setup', 'Service Categories', 'Time Slots & Capacity', 'Payment Methods'] 
    },
    { 
        title: 'Commission Agreement', 
        completed: false, 
        items: ['13% Platform Commission Agreement'] 
    },
];

// Quick Service Actions
const serviceActions = [
    { label: 'Set Pricing', icon: <DollarSign size={20} />, href: '/vendor/pricing', color: 'emerald', description: 'Per kg, per load, express rates' },
    { label: 'Time Slots', icon: <Clock size={20} />, href: '/vendor/schedule', color: 'blue', description: 'Manage daily capacity' },
    { label: 'Service Areas', icon: <MapPin size={20} />, href: '/vendor/areas', color: 'purple', description: 'Pickup & delivery zones' },
    { label: 'Payment Setup', icon: <CreditCard size={20} />, href: '/vendor/payments', color: 'orange', description: 'Bank, GCash, PayPal' },
];

export default function Dashboard() {
    return (
        <VendorLayout>
            {/* Dashboard Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Laundry Service Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Manage your laundry business operations and track performance
                </p>
            </div>

            {/* Setup Progress */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Setup Progress</h2>
                <div className="space-y-4">
                    {setupSteps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            <div className={`mt-1 ${step.completed ? 'text-green-500' : 'text-slate-400'}`}>
                                {step.completed ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-medium ${step.completed ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {step.title}
                                </h3>
                                <ul className="text-sm text-slate-600 dark:text-slate-400 mt-1 ml-4">
                                    {step.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="list-disc">{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Laundry Service Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {laundryStats.map((stat, index) => (
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
                                'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Service Configuration Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {serviceActions.map((action, index) => (
                    <a
                        key={index}
                        href={action.href}
                        className={`p-4 rounded-xl border-2 border-dashed transition-all hover:border-solid hover:shadow-md ${
                            action.color === 'emerald' ? 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' :
                            action.color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' :
                            action.color === 'purple' ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20' :
                            'border-orange-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        }`}
                    >
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                                action.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                action.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                action.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                                {action.icon}
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-white">{action.label}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{action.description}</p>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Commission Agreement Notice */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                    <div className="text-orange-600 dark:text-orange-400 mt-1">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                            Platform Commission Agreement
                        </h3>
                        <p className="text-orange-800 dark:text-orange-200 text-sm mb-3">
                            Complete your service setup to activate the 13% platform commission agreement and start accepting orders.
                        </p>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Review Agreement
                        </button>
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
}