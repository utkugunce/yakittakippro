import React from 'react';
import { Car, Fuel, BarChart3, Warehouse, X } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onStart: () => void;
  onClose: () => void;
}

const STEPS = [
  { icon: Fuel, title: 'Yakıt & sürüş kaydı', desc: 'Her dolumu ve günlük sürüşünü saniyeler içinde kaydet.' },
  { icon: BarChart3, title: 'Otomatik analiz', desc: 'Tüketim, maliyet ve trendleri grafiklerle gör.' },
  { icon: Warehouse, title: 'Garaj', desc: 'Giderler, servis, şarj, sefer ve AI asistan tek yerde.' },
];

/** First-run welcome shown once when the app has no data yet. */
export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onStart, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        <div className="relative bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white">
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <h2 id="onboarding-title" className="text-xl font-bold">TripBook'a hoş geldin!</h2>
              <p className="text-sm opacity-90">Aracının yakıt ve masraf asistanı</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {STEPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 p-2 rounded-lg shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Daha sonra
            </button>
            <button
              onClick={onStart}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              İlk kaydımı ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
