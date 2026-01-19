import React from 'react';
import { Lightbulb } from 'lucide-react';

const TIPS = [
  'Karanlık mod, gece sürüşlerinde göz yorgunluğunu azaltır.',
  'Vurgu rengini değiştirerek uygulamanın görünümünü kişiselleştirebilirsiniz.',
  'Açık mod, gün ışığında daha iyi görünürlük sağlar.',
  'Farklı temalar ile uygulamayı kendinize göre özelleştirin.',
  'Tema ayarları anında uygulanır, kaydetmeye gerek yoktur.',
];

export const ThemeSettingsTips: React.FC = () => {
  const [tip, setTip] = React.useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  return (
    <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2 mb-4 animate-fadeIn">
      <Lightbulb className="w-4 h-4 text-violet-500" />
      <span className="text-sm text-violet-900">{tip}</span>
    </div>
  );
};
