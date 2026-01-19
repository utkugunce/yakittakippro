import React from 'react';
import { Lightbulb } from 'lucide-react';

const TIPS = [
  'Bakım kayıtlarınızı düzenli tutmak aracınızın ömrünü uzatır.',
  'Yaklaşan bakımlar için hatırlatıcılar kurun.',
  'Parça değişimlerini kaydederek geçmişinizi takip edin.',
  'Geciken bakımlar aracınızın performansını olumsuz etkileyebilir.',
  'Bakım geçmişinizi dışa aktararak yedekleyebilirsiniz.',
  'Periyodik bakım, beklenmedik arızaların önüne geçer.',
];

export const MaintenanceTips: React.FC = () => {
  const [tip, setTip] = React.useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-4 animate-fadeIn">
      <Lightbulb className="w-4 h-4 text-blue-500" />
      <span className="text-sm text-blue-900">{tip}</span>
    </div>
  );
};
