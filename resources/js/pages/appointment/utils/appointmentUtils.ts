export const timeslots = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
];

export const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

// Enhanced function to check if time is in the past (including today)
export function isPastTime(date: Date, timeString: string): boolean {
    const now = new Date();
    
    // Convert time string to 24-hour format
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
        hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
    }
    
    // Create appointment datetime
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hour24, minutes, 0, 0);
    
    // Add 1 hour buffer to current time for booking
    const minimumBookingTime = new Date(now.getTime() + (60 * 60 * 1000));
    
    return appointmentDateTime <= minimumBookingTime;
}

export function generateAppointmentNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Generate 4 random capital letters
    const randomLetters = Array.from({ length: 4 }, () => 
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    
    return `APT-${year}-${month}-${day}-${hours}${minutes}${seconds}-${randomLetters}`;
}
