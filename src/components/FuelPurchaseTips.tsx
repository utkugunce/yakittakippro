import React from 'react';
import { Lightbulb } from 'lucide-react';

const TIPS = [
  'Farklı istasyonlardan aldığınız yakıtları karşılaştırın.',
  'En iyi fiyatı bulmak için geçmiş alımları inceleyin.',
  'Yakıt alımlarınızı düzenli kaydedin, tasarrufunuzu takip edin.',
  'Yakıt alım notlarınıza istasyon ve fiyat ekleyin.',
  'Yakıt tüketiminizi analiz etmek için raporları kullanın.',
  'Yakıt alım serinizi bozmayın, her dolumu kaydedin!',
];

export const FuelPurchaseTips: React.FC = () => {
  const [tip, setTip] = React.useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4 animate-fadeIn">
      <Lightbulb className="w-4 h-4 text-emerald-500" />
      <span className="text-sm text-emerald-900">{tip}</span>
    </div>
  );
};
