import { DollarSign, Package, Clock, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
    stats: {
        earnings_today: number;
        earnings_week: number;
        earnings_month: number;
        deliveries_today: number;
        deliveries_week: number;
        deliveries_month: number;
        average_rating: number;
        completion_rate: number;
        active_orders: number;
    };
}

export default function RiderStatsCards({ stats }: Props) {
    const cards = [
        {
            title: 'Today\'s Earnings',
            value: `₱${stats.earnings_today.toFixed(2)}`,
            change: '+12%',
            changeType: 'increase',
            icon: DollarSign,
            color: 'green',
            description: 'vs yesterday'
        },
        {
            title: 'Active Deliveries',
            value: stats.active_orders.toString(),
            change: '',
            changeType: 'neutral',
            icon: Package,
            color: 'blue',
            description: 'pending deliveries'
        },
        {
            title: 'Deliveries Today',
            value: stats.deliveries_today.toString(),
            change: '+8%',
            changeType: 'increase',
            icon: Clock,
            color: 'purple',
            description: 'vs yesterday'
        },
        {
            title: 'Average Rating',
            value: stats.average_rating.toFixed(1),
            change: '+0.1',
            changeType: 'increase',
            icon: Star,
            color: 'yellow',
            description: 'out of 5.0'
        },
    ];

    const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
        const colors = {
            green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' },
            blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
            purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
            yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' },
        };
        return colors[color as keyof typeof colors][type];
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.title}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                    {card.value}
                                </p>
                            </div>
                            <div className={`w-12 h-12 ${getColorClasses(card.color, 'bg')} text-white rounded-lg flex items-center justify-center`}>
                                <Icon size={24} />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {card.description}
                            </p>
                            {card.change && (
                                <div className={`flex items-center space-x-1 text-xs font-medium ${
                                    card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {card.changeType === 'increase' ? (
                                        <TrendingUp size={12} />
                                    ) : (
                                        <TrendingDown size={12} />
                                    )}
                                    <span>{card.change}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}