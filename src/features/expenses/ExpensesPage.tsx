import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Trash2, ArrowLeft, PlusCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { toast } from '../../stores/toastStore';
import { expenseInputSchema, firstIssueMessage } from '../../lib/validation';
import { computeTco, EXPENSE_CATEGORY_LABELS } from '../../lib/tco';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import type { Expense, ExpenseCategory } from '../../types';

const today = () => new Date().toISOString().split('T')[0];
const CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

export const ExpensesPage: React.FC = () => {
  const { logs, fuelPurchases, chargeSessions, expenses, serviceRecords, addExpense, deleteExpense } =
    useAppStore();

  const year = new Date().getFullYear();
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState<ExpenseCategory>('toll');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');

  const tco = useMemo(
    () =>
      computeTco({
        year,
        logs,
        purchases: fuelPurchases,
        charges: chargeSessions,
        expenses,
        services: serviceRecords,
      }),
    [year, logs, fuelPurchases, chargeSessions, expenses, serviceRecords]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = expenseInputSchema.safeParse({ amount });
    if (!parsed.success) {
      toast.error(firstIssueMessage(parsed.error));
      return;
    }
    const expense: Expense = {
      id: crypto.randomUUID(),
      date: new Date(date).toISOString(),
      category,
      amount: parsed.data.amount,
      title: title.trim() || undefined,
    };
    addExpense(expense);
    toast.success('Gider eklendi.');
    setAmount('');
    setTitle('');
  };

  const costRows: Array<[string, number]> = [
    ['Yakıt', tco.fuel],
    ['Şarj', tco.charging],
    ['Servis', tco.service],
    ...CATEGORIES.map((c) => [EXPENSE_CATEGORY_LABELS[c], tco.expensesByCategory[c] || 0] as [string, number]),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/garage" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Giderler & Toplam Maliyet</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">HGS, MTV, sigorta, muayene ve diğer masraflar</p>
          </div>
        </div>
      </div>

      {/* TCO summary */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
        <p className="text-sm opacity-90">{year} Toplam Araç Maliyeti</p>
        <p className="text-3xl font-extrabold mt-1">{formatCurrency(tco.total)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="space-y-1.5">
          {costRows.filter(([, v]) => v > 0).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{label}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(value)}</span>
            </div>
          ))}
          {tco.total === 0 && <p className="text-center text-sm text-gray-400 py-2">Bu yıl için kayıt yok.</p>}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tarih</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Kategori</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tutar (₺)</span>
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Açıklama (ops.)</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Köprü geçişi…" className="mt-1 w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 focus:ring-2 focus:ring-primary-500" />
          </label>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors">
          <PlusCircle className="w-4 h-4" /> Gider Ekle
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {expenses.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Henüz gider yok.</p>}
        {expenses.map((ex) => (
          <div key={ex.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">
                {EXPENSE_CATEGORY_LABELS[ex.category]} · {formatCurrency(ex.amount)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(ex.date)}{ex.title ? ` · ${ex.title}` : ''}
              </p>
            </div>
            <button onClick={() => { deleteExpense(ex.id); toast.info('Gider silindi.'); }} className="p-2 text-gray-400 hover:text-red-500" aria-label="Sil">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
