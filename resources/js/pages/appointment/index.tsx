import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function AppointmentIndex() {
    useEffect(() => {
        // Automatically redirect to the first step
        router.get('/appointment/select-provider');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Redirecting to appointment booking...</p>
            </div>
        </div>
    );
}
