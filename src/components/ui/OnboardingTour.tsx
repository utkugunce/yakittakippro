import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

interface Step {
    target: string; // ID of the element to highlight
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const steps: Step[] = [
    {
        target: 'nav-home',
        title: 'Hoşgeldiniz! 👋',
        description: 'Burası ana paneliniz. Yakıt durumunu, özet bilgileri ve yaklaşan bakımları buradan takip edebilirsiniz.',
        position: 'top'
    },
    {
        target: 'nav-add-btn',
        title: 'Hızlı Ekleme ⚡',
        description: 'Yakıt fişlerinizi veya günlük sürüşlerinizi bu butona tıklayarak hemen ekleyebilirsiniz.',
        position: 'top'
    },
    {
        target: 'gamification-card',
        title: 'Puan Kazanın 🏆',
        description: 'Her veri girişiniz size XP (puan) kazandırır. Seviye atlayıp yeni rozetlerin kilidini açın!',
        position: 'bottom'
    },
    {
        target: 'nav-more',
        title: 'Daha Fazlası 🚀',
        description: 'Ayarlar, Raporlar ve Bakım modülüne buradan ulaşabilirsiniz.',
        position: 'top'
    }
];

export const OnboardingTour: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenOnboarding_v1');
        if (!hasSeenTour) {
            // Short delay to ensure UI mounts
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenOnboarding_v1', 'true');
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            {/* Backdrop with hole logic is complex, using simple overlay for MVP */}
            <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={handleClose} />

            {/* Tooltip Card - Centered for simplicity in MVP, or positioned if we had time involving `getBoundingClientRect` */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-xs w-full relative pointer-events-auto animate-in zoom-in-95 duration-300 mx-4">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 font-bold text-xl">
                        {currentStep + 1}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                        {step.description}
                    </p>

                    <div className="flex items-center justify-between w-full">
                        <div className="flex gap-1">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all ${idx === currentStep ? 'w-6 bg-primary-600' : 'w-1.5 bg-gray-200 dark:bg-gray-700'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                        >
                            {currentStep === steps.length - 1 ? 'Başla' : 'İlerle'}
                            {currentStep === steps.length - 1 ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
