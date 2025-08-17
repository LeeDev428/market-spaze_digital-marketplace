import { Head, Link, router } from '@inertiajs/react';
import RiderLayout from '@/layouts/app/RiderLayout';
import { 
    Calendar, 
    Clock, 
    Package, 
    CheckCircle, 
    XCircle, 
    Timer, 
    Eye, 
    ArrowLeft,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface AppointmentSummary {
    date: string;
    total_count: number;
    pending_count: number;
    confirmed_count: number;
    in_progress_count: number;
    completed_count: number;
    cancelled_count: number;
    appointments: Array<{
        id: number;
        appointment_number: string;
        customer_name: string;
        appointment_time: string;
        status: string;
        service_name?: string;
        customer_phone: string;
    }>;
}

interface Props {
    appointmentsByDate: AppointmentSummary[];
    currentMonth: string;
    currentYear: number;
    stats: {
        total_appointments: number;
        pending_count: number;
        confirmed_count: number;
        in_progress_count: number;
        completed_count: number;
        cancelled_count: number;
    };
    rider?: {
        id: number;
        rider_id: string;
        name: string;
        phone: string;
        vehicle_type: string;
        status: string;
        rating: number;
        total_deliveries: number;
    };
}

export default function AllAppointmentsCalendar({ appointmentsByDate, currentMonth, currentYear, stats, rider }: Props) {
    const [selectedDate, setSelectedDate] = useState<string>('');
    
    // Convert appointments by date to a map for easy lookup
    const appointmentsMap = new Map(
        appointmentsByDate.map(item => [item.date, item])
    );

    const selectedDateData = selectedDate ? appointmentsMap.get(selectedDate) : null;

    // Navigation functions
    const navigateToMonth = (year: number, month: string) => {
        router.get('/rider/deliveries/calendar', {
            year: year,
            month: month
        });
    };

    const goToPreviousMonth = () => {
        const currentDate = new Date(`${currentMonth} 1, ${currentYear}`);
        currentDate.setMonth(currentDate.getMonth() - 1);
        
        const newYear = currentDate.getFullYear();
        const newMonth = currentDate.toLocaleString('en-US', { month: 'long' });
        
        navigateToMonth(newYear, newMonth);
    };

    const goToNextMonth = () => {
        const currentDate = new Date(`${currentMonth} 1, ${currentYear}`);
        currentDate.setMonth(currentDate.getMonth() + 1);
        
        const newYear = currentDate.getFullYear();
        const newMonth = currentDate.toLocaleString('en-US', { month: 'long' });
        
        navigateToMonth(newYear, newMonth);
    };

    const goToCurrentMonth = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.toLocaleString('en-US', { month: 'long' });
        
        navigateToMonth(currentYear, currentMonth);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTime = (time: string) => {
        try {
            if (!time) return 'Invalid Time';
            
            // Handle full datetime format like '2025-08-14T19:30:00.000000Z'
            if (time.includes('T')) {
                const dateTime = new Date(time);
                if (isNaN(dateTime.getTime())) {
                    return time;
                }
                return dateTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
            
            // Handle time-only format like '19:30:00'
            const timeObj = new Date(`2000-01-01T${time}`);
            if (isNaN(timeObj.getTime())) {
                return time;
            }
            
            return timeObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return time || 'Invalid Time';
        }
    };

    const formatDateDisplay = (date: string) => {
        try {
            if (!date) return 'Invalid Date';
            
            // Handle full datetime format like '2025-08-14T19:30:00.000000Z'
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                return date; // Return original if invalid
            }
            return dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return date || 'Invalid Date';
        }
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentYear;
        const month = new Date(`${currentMonth} 1, ${year}`).getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const current = new Date(startDate);
        
        for (let i = 0; i < 42; i++) {
            // Fix: Use local date formatting instead of UTC to avoid timezone offset
            const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
            const isCurrentMonth = current.getMonth() === month;
            const appointmentData = appointmentsMap.get(dateStr);
            
            // Fix: Use local date for today comparison as well
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            days.push({
                date: current.getDate(),
                dateStr,
                isCurrentMonth,
                appointmentData,
                isToday: dateStr === todayStr
            });
            
            current.setDate(current.getDate() + 1);
        }
        
        return days;
    };

    const calendarDays = generateCalendarDays();

    return (
        <RiderLayout>
            <Head title="All Appointments - Calendar View" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/rider/deliveries/active"
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Active Deliveries
                        </Link>
                        <div className="border-l border-gray-300 dark:border-gray-600 h-6"></div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                All Appointments - Calendar View
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Browse appointments by date
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/rider/deliveries/all"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Eye size={16} className="mr-2" />
                            View All Details
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                            {/* Calendar Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {currentMonth} {currentYear}
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={goToPreviousMonth}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Previous Month"
                                        >
                                            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            onClick={goToCurrentMonth}
                                            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            title="Go to Current Month"
                                        >
                                            Today
                                        </button>
                                        <button 
                                            onClick={goToNextMonth}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Next Month"
                                        >
                                            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="p-6">
                                {/* Day Headers */}
                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-2">
                                    {calendarDays.map((day, index) => {
                                        const hasAppointments = day.appointmentData && day.appointmentData.total_count > 0;
                                        const isSelected = selectedDate === day.dateStr;
                                        
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedDate(day.dateStr)}
                                                className={`
                                                    aspect-square p-2 rounded-lg border cursor-pointer transition-all duration-200
                                                    ${day.isCurrentMonth ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600 opacity-50'}
                                                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' : ''}
                                                    ${day.isToday ? 'border-blue-500 bg-blue-100 dark:bg-blue-800' : 'border-gray-200 dark:border-gray-600'}
                                                    ${hasAppointments ? 'border-orange-300 bg-orange-50 dark:bg-orange-900' : ''}
                                                    hover:bg-gray-100 dark:hover:bg-gray-600
                                                `}
                                            >
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {day.date}
                                                </div>
                                                {hasAppointments && (
                                                    <div className="mt-1">
                                                        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                            {day.appointmentData!.total_count} appts
                                                        </div>
                                                        <div className="flex space-x-1 mt-1">
                                                            {day.appointmentData!.pending_count > 0 && (
                                                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                            )}
                                                            {day.appointmentData!.confirmed_count > 0 && (
                                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                            )}
                                                            {day.appointmentData!.in_progress_count > 0 && (
                                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                            )}
                                                            {day.appointmentData!.completed_count > 0 && (
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Monthly Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <Package size={20} className="mr-2 text-blue-500" />
                                {selectedDateData ? `Stats for ${formatDateDisplay(selectedDate)}` : 'Monthly Stats'}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {selectedDateData ? selectedDateData.total_count : stats.total_appointments}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-yellow-600">Pending</span>
                                    <span className="font-semibold text-yellow-600">
                                        {selectedDateData ? selectedDateData.pending_count : stats.pending_count}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-600">Available</span>
                                    <span className="font-semibold text-blue-600">
                                        {selectedDateData ? selectedDateData.confirmed_count : stats.confirmed_count}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-600">In Progress</span>
                                    <span className="font-semibold text-green-600">
                                        {selectedDateData ? selectedDateData.in_progress_count : stats.in_progress_count}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Completed</span>
                                    <span className="font-semibold text-gray-600">
                                        {selectedDateData ? selectedDateData.completed_count : stats.completed_count}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-red-600">Cancelled</span>
                                    <span className="font-semibold text-red-600">
                                        {selectedDateData ? selectedDateData.cancelled_count : stats.cancelled_count}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Selected Date Info */}
                        {selectedDateData && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Calendar size={20} className="mr-2 text-green-500" />
                                    {formatDateDisplay(selectedDate)}
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {selectedDateData.total_count}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                                        </div>
                                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {selectedDateData.confirmed_count}
                                            </div>
                                            <div className="text-xs text-blue-600">Available</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {selectedDateData.appointments.slice(0, 3).map((appointment) => (
                                            <div key={appointment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                            {appointment.customer_name}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            {formatTime(appointment.appointment_time)}
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                        {appointment.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {selectedDateData.appointments.length > 3 && (
                                            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                                +{selectedDateData.appointments.length - 3} more appointments
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Link
                                        href={`/rider/deliveries/all?date_from=${selectedDate}&date_to=${selectedDate}`}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Eye size={16} className="mr-2" />
                                        View All Details
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Status Legend
                            </h3>
                            
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RiderLayout>
    );
}
