import React, { useState } from 'react';
import { Lightbulb, X, ChevronRight, Sparkles } from 'lucide-react';

const TIPS = [
  {
    title: 'Periyodik Bakım',
    text: 'Düzenli yağ değişimi motor ömrünü %30 uzatabilir.',
    color: 'from-violet-500 to-purple-500'
  },
  {
    title: 'Lastik Bakımı',
    text: 'Her 10.000 km\'de lastik rotasyonu yaparak ömrü uzatın.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Fren Kontrolü',
    text: 'Balata kalınlığını 3mm altına düşmeden değiştirin.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    title: 'Akü Sağlığı',
    text: 'Akü terminallerini yılda 2 kez temizleyin.',
    color: 'from-emerald-500 to-teal-500'
  }
];

export const MaintenanceTips: React.FC = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const tip = TIPS[currentTip];

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % TIPS.length);
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${tip.color} rounded-2xl p-4 text-white shadow-lg mb-6`}>
      {/* Decorative elements */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute right-10 bottom-2 w-12 h-12 rounded-full bg-white/5" />

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-white/80">İpucu</span>
        </div>

        {/* Content */}
        <h4 className="font-bold text-sm mb-1">{tip.title}</h4>
        <p className="text-xs text-white/90 leading-relaxed mb-3">{tip.text}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {TIPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTip(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentTip ? 'w-4 bg-white' : 'bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
          <button
            onClick={nextTip}
            className="flex items-center gap-1 text-[11px] font-bold text-white/80 hover:text-white transition-colors"
          >
            Sonraki
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
