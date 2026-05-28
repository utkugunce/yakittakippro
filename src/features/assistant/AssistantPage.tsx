import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowLeft, Send, Loader2, User } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { askAssistant } from '../../lib/aiChat';
import { computeTco } from '../../lib/tco';
import { buildReminders } from '../../lib/reminders';
import { formatCurrency } from '../../utils/dateUtils';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTIONS = [
  'Bu yıl toplam ne kadar harcadım?',
  'Ortalama yakıt tüketimim nasıl?',
  'Yaklaşan bakım/hatırlatma var mı?',
  'Tasarruf için ne önerirsin?',
];

export const AssistantPage: React.FC = () => {
  const store = useAppStore();
  const { logs, fuelPurchases, chargeSessions, expenses, serviceRecords, maintenanceItems, documents, geminiApiKey } =
    store;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Compact, privacy-conscious summary of the user's data for the model.
  const context = useMemo(() => {
    const year = new Date().getFullYear();
    const tco = computeTco({ year, logs, purchases: fuelPurchases, charges: chargeSessions, expenses, services: serviceRecords });
    const lastOdo = logs.length ? Math.max(...logs.map((l) => l.currentOdometer)) : 0;
    const avgCons =
      logs.length > 0
        ? (logs.reduce((s, l) => s + l.dailyFuelConsumed, 0) / Math.max(1, logs.reduce((s, l) => s + l.dailyDistance, 0))) * 100
        : 0;
    const reminders = buildReminders({ maintenance: maintenanceItems, documents, currentOdometer: lastOdo });
    return [
      `Yıl: ${year}`,
      `Kayıt sayısı: ${logs.length} sürüş, ${fuelPurchases.length} yakıt alımı, ${chargeSessions.length} şarj`,
      `${year} toplam maliyet: ${formatCurrency(tco.total)} (yakıt ${formatCurrency(tco.fuel)}, şarj ${formatCurrency(tco.charging)}, servis ${formatCurrency(tco.service)}, diğer ${formatCurrency(tco.expensesTotal)})`,
      `Ortalama tüketim: ${avgCons.toFixed(1)} L/100km`,
      `Güncel km: ${lastOdo.toLocaleString('tr-TR')}`,
      reminders.length
        ? `Yaklaşan hatırlatmalar: ${reminders.map((r) => `${r.title} (${r.detail})`).join('; ')}`
        : 'Yaklaşan hatırlatma yok.',
    ].join('\n');
  }, [logs, fuelPurchases, chargeSessions, expenses, serviceRecords, maintenanceItems, documents]);

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const answer = await askAssistant(q, context, geminiApiKey || undefined);
      setMessages((m) => [...m, { role: 'assistant', text: answer || 'Yanıt alınamadı.' }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: e instanceof Error ? e.message : 'Bir hata oluştu.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/garage" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-2.5 rounded-xl shadow">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Asistan</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Verilerine dayalı soru-cevap</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 min-h-[320px] flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
            <Bot className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-400">Verilerinle ilgili bir şey sor.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="px-3 py-1.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-300'}`}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Düşünüyor…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Sorunu yaz…"
          className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500"
        />
        <button type="submit" disabled={loading || !input.trim()} className="px-4 rounded-xl bg-primary-600 text-white disabled:opacity-50 flex items-center justify-center">
          <Send className="w-5 h-5" />
        </button>
      </form>
      <p className="text-[11px] text-gray-400 text-center">
        Yanıtlar yapay zeka tarafından üretilir; önemli kararlar için doğrulayın.
      </p>
    </div>
  );
};
