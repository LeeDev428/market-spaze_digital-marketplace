import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FailedMessageProps {
    title?: string;
    message: string;
    errors?: string[];
    onClose?: () => void;
    autoClose?: boolean;
    duration?: number;
}

export default function FailedMessage({ 
    title = "Error!", 
    message, 
    errors = [], 
    onClose, 
    autoClose = false, 
    duration = 7000 
}: FailedMessageProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
    };

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className="bg-white dark:bg-slate-800 border-l-4 border-red-500 rounded-lg shadow-lg p-4 min-w-[350px] max-w-md">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                        </div>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                            {title}
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {message}
                        </p>
                        
                        {/* Show validation errors */}
                        {errors.length > 0 && (
                            <ul className="mt-2 text-xs text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
                
                {/* Progress bar */}
                {autoClose && (
                    <div className="mt-3 w-full bg-red-200 dark:bg-red-800 rounded-full h-1">
                        <div 
                            className="bg-red-500 h-1 rounded-full transition-all ease-linear"
                            style={{
                                animation: `shrink ${duration}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>
            
            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}