
import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary', fullScreen = false }) => {
    // Size classes
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    // Color classes
    const colorClasses = {
        primary: 'border-blue-600 border-t-transparent',
        white: 'border-white border-t-transparent',
    };

    const spinner = (
        <div
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
            role="status"
            aria-label="loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                {spinner}
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading...</p>
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
