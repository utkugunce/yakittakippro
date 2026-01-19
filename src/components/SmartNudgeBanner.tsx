import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Bell } from 'lucide-react';
import { SmartNudge } from '../hooks/useSmartNudges';

interface SmartNudgeBannerProps {
    nudges: SmartNudge[];
    onAction: (handler: string) => void;
    onDismiss: (id: string) => void;
}

export const SmartNudgeBanner: React.FC<SmartNudgeBannerProps> = ({ nudges, onAction, onDismiss }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [isVisible, setIsVisible] = useState(true);

    // Load dismissed nudges from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('dismissed_nudges');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Only restore dismissals from today
                const today = new Date().toDateString();
                if (parsed.date === today) {
                    setDismissed(new Set(parsed.ids));
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    // Filter out dismissed nudges
    const activeNudges = nudges.filter(n => !dismissed.has(n.id));

    // Auto-rotate nudges
    useEffect(() => {
        if (activeNudges.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activeNudges.length);
        }, 8000); // Rotate every 8 seconds

        return () => clearInterval(interval);
    }, [activeNudges.length]);

    // Reset index if it's out of bounds
    useEffect(() => {
        if (currentIndex >= activeNudges.length) {
            setCurrentIndex(0);
        }
    }, [activeNudges.length, currentIndex]);

    const handleDismiss = (id: string) => {
        const newDismissed = new Set(dismissed);
        newDismissed.add(id);
        setDismissed(newDismissed);
        
        // Persist to localStorage with today's date
        localStorage.setItem('dismissed_nudges', JSON.stringify({
            date: new Date().toDateString(),
            ids: Array.from(newDismissed)
        }));
        
        onDismiss(id);
    };

    const handleHideAll = () => {
        setIsVisible(false);
    };

    if (!isVisible || activeNudges.length === 0) {
        return null;
    }

    const currentNudge = activeNudges[currentIndex];
    if (!currentNudge) return null;

    // Priority-based styling
    const priorityStyles = {
        high: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
        medium: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900',
        low: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
    };

    const buttonStyles = {
        high: 'bg-white/20 hover:bg-white/30 text-white',
        medium: 'bg-black/10 hover:bg-black/20 text-gray-900',
        low: 'bg-white/20 hover:bg-white/30 text-white'
    };

    return (
        <div className={`relative overflow-hidden rounded-xl shadow-lg ${priorityStyles[currentNudge.priority]} transition-all duration-500 animate-in fade-in slide-in-from-top-2`}>
            {/* Progress dots */}
            {activeNudges.length > 1 && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {activeNudges.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                idx === currentIndex 
                                    ? 'bg-white w-4' 
                                    : 'bg-white/40 hover:bg-white/60'
                            }`}
                            aria-label={`Nudge ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Main content */}
            <div className="p-4 pt-6">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0">
                        {currentNudge.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm mb-0.5">
                            {currentNudge.title}
                        </h4>
                        <p className="text-sm opacity-90 leading-snug">
                            {currentNudge.message}
                        </p>

                        {/* Action button */}
                        {currentNudge.action && (
                            <button
                                onClick={() => onAction(currentNudge.action!.handler)}
                                className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${buttonStyles[currentNudge.priority]}`}
                            >
                                {currentNudge.action.label}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Dismiss button */}
                    {currentNudge.dismissable && (
                        <button
                            onClick={() => handleDismiss(currentNudge.id)}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                            title="Kapat"
                            aria-label="Kapat"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Hide all button */}
            {activeNudges.length > 1 && (
                <div className="px-4 pb-3 pt-1">
                    <button
                        onClick={handleHideAll}
                        className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                    >
                        Tüm bildirimleri gizle
                    </button>
                </div>
            )}
        </div>
    );
};

// Compact version for header/bottom bar
export const SmartNudgeChip: React.FC<{ nudge: SmartNudge; onClick: () => void }> = ({ nudge, onClick }) => {
    const priorityColors = {
        high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    };

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95 ${priorityColors[nudge.priority]}`}
        >
            <span>{nudge.icon}</span>
            <span className="max-w-[150px] truncate">{nudge.title}</span>
            <Bell className="w-3 h-3 animate-pulse" />
        </button>
    );
};
