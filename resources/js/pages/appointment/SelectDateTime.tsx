import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    ChevronLeft, 
    ChevronRight,
    DollarSign,
    Timer
} from 'lucide-react';
import { VendorStore, Service } from './types/appointmentTypes';
import { 
    getDaysInMonth, 
    getFirstDayOfWeek, 
    isPastDate, 
    isPastTime, 
    monthNames, 
    dayNames, 
    timeslots 
} from './utils/appointmentUtils';

interface Props {
    store: VendorStore;
    service: Service;
}

export default function SelectDateTime({ store, service }: Props) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handleBack = () => {
        router.get('/appointment/select-service', { store_id: store.id });
    };

    const handleTimeSelect = (time: string) => {
        if (selectedDate && !isPastTime(selectedDate, time)) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            
            router.get('/appointment/confirm-details', {
                store_id: store.id,
                service_id: service.id,
                appointment_date: `${year}-${month}-${day}`,
                appointment_time: time
            });
        }
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentYear, currentMonth, day);
        if (!isPastDate(clickedDate)) {
            setSelectedDate(clickedDate);
        }
    };

    // Calendar grid generation
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
    
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) week.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }
    if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Back Navigation & Service Summary */}
                    <div className="mb-8">
                        <button
                            onClick={handleBack}
                            className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-8 transition-colors group"
                        >
                            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to services</span>
                        </button>
                        
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">
                                            {service.name}
                                        </h2>
                                        <p className="text-blue-100 mb-4">
                                            with {store.business_name}
                                        </p>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center">
                                                <DollarSign className="mr-1" size={16} />
                                                <span>₱{service.price_min.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Timer className="mr-1" size={16} />
                                                <span>{service.duration_minutes || 60} mins</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calendar & Time Selection */}
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Calendar */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-700 p-6 border-b border-slate-200 dark:border-slate-600">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        Select Date
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handlePrevMonth}
                                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                                        </button>
                                        <span className="text-base font-medium text-slate-900 dark:text-white px-4">
                                            {monthNames[currentMonth]} {currentYear}
                                        </span>
                                        <button
                                            onClick={handleNextMonth}
                                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                {/* Day Names */}
                                <div className="grid grid-cols-7 gap-1 mb-4">
                                    {dayNames.map(day => (
                                        <div key={day} className="p-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {weeks.map((week, i) => (
                                        week.map((day, j) => {
                                            const date = day ? new Date(currentYear, currentMonth, day) : null;
                                            const isSelected = selectedDate && date &&
                                                selectedDate.getDate() === day &&
                                                selectedDate.getMonth() === currentMonth &&
                                                selectedDate.getFullYear() === currentYear;
                                            const isPast = date ? isPastDate(date) : false;
                                            const isToday = date && 
                                                date.getDate() === today.getDate() &&
                                                date.getMonth() === today.getMonth() &&
                                                date.getFullYear() === today.getFullYear();

                                            return (
                                                <div key={`${i}-${j}`} className="aspect-square">
                                                    {day ? (
                                                        <button
                                                            onClick={() => handleDateClick(day)}
                                                            disabled={isPast}
                                                            className={`w-full h-full flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 ${
                                                                isPast
                                                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                                    : isSelected
                                                                    ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                                                                    : isToday
                                                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300 dark:border-blue-600'
                                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105'
                                                            }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    ) : null}
                                                </div>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-700 p-6 border-b border-slate-200 dark:border-slate-600">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Available Times
                                </h3>
                                {selectedDate && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {selectedDate.toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                )}
                            </div>
                            
                            <div className="p-6">
                                {selectedDate ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {timeslots.map((time) => {
                                            const isTimePast = isPastTime(selectedDate, time);
                                            
                                            return (
                                                <button
                                                    key={time}
                                                    onClick={() => handleTimeSelect(time)}
                                                    disabled={isTimePast}
                                                    className={`p-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                        isTimePast
                                                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                                                            : 'bg-slate-50 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transform hover:scale-105'
                                                    }`}
                                                >
                                                    {time}
                                                    {isTimePast && (
                                                        <div className="text-xs text-slate-400 mt-1">
                                                            Past
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-slate-400 dark:text-slate-500 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                            Select a date first
                                        </h4>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Choose a date from the calendar to see available time slots
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Time Validation Notice */}
                    {selectedDate && (
                        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Timer className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Booking Policy
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                        <p>
                                            • Appointments must be booked at least 1 hour in advance
                                            <br />
                                            • Past dates and times are automatically disabled
                                            <br />
                                            • All times shown are available for booking
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
