import { CheckCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SuccessMessageProps {
    title?: string;
    message: string;
    onClose?: () => void;
    autoClose?: boolean;
    duration?: number;
}

export default function SuccessMessage({ 
    title = "Success!", 
    message, 
    onClose, 
    autoClose = true, 
    duration = 5000 
}: SuccessMessageProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [progressWidth, setProgressWidth] = useState(100);

    useEffect(() => {
        if (autoClose) {
            // Start progress bar animation
            const startTime = Date.now();
            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
                setProgressWidth(remaining);
                
                if (remaining <= 0) {
                    clearInterval(interval);
                }
            }, 50);

            // Auto close timer
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300);
            }, duration);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        }
    }, [autoClose, duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className="bg-white dark:bg-slate-800 border-l-4 border-green-500 rounded-lg shadow-lg p-4 min-w-[350px] max-w-md">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                        </div>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                            {title}
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
                
                {/* Progress bar - FIXED */}
                {autoClose && (
                    <div className="mt-3 w-full bg-green-200 dark:bg-green-800 rounded-full h-1 overflow-hidden">
                        <div 
                            className="bg-green-500 h-1 rounded-full transition-all ease-linear duration-75"
                            style={{
                                width: `${progressWidth}%`
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}