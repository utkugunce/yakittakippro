import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
    helperText?: React.ReactNode;
    containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, icon: Icon, error, helperText, containerClassName, className = "", ...props }, ref) => {
        return (
            <div className={containerClassName}>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    {label}
                </label>
                <div className="relative">
                    {Icon && (
                        <Icon className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    )}
                    <input
                        ref={ref}
                        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 min-h-[48px] bg-[#333333] dark:bg-gray-700 text-gray-100 placeholder-gray-500 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all touch-manipulation [color-scheme:dark] appearance-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-transparent'
                            } ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
                )}
                {helperText && !error && (
                    <div className="text-xs text-gray-400 mt-1">{helperText}</div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
