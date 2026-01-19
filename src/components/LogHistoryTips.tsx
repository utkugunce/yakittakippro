import React from 'react';
import { Lightbulb } from 'lucide-react';

const TIPS = [
  'Düzenli kayıt tutmak, yakıt tüketimini optimize etmenize yardımcı olur.',
  'Uzun süreli seriler, daha doğru analizler sağlar.',
  'En iyi günlerinizi inceleyerek sürüş alışkanlıklarınızı geliştirin.',
  'Kayıtlarınızı dışa aktararak yedekleyebilirsiniz.',
  'Farklı yakıt türlerini karşılaştırmak için filtreleri kullanın.',
  'Kayıt serinizi bozmayın, her gün giriş yapın!',
];

export const LogHistoryTips: React.FC = () => {
  const [tip, setTip] = React.useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  return (
    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 mb-4 animate-fadeIn">
      <Lightbulb className="w-4 h-4 text-yellow-500" />
      <span className="text-sm text-yellow-900">{tip}</span>
    </div>
  );
};
