import React from 'react';
import { Activity, PieChart as PieChartIcon } from 'lucide-react';
import { DailyLog, FuelPurchase } from '../../types';
import { useChartData } from './hooks/useChartData';
import {
  ChartCard,
  EmptyChartState,
  CostChart,
  ConsumptionChart,
  MonthlyTrendChart,
  StationPieChart,
  BrandCharts
} from './components';

import { CorrelationChart } from '../charts/components/advanced/CorrelationChart';
import { MonthlyCostChart } from '../charts/components/advanced/MonthlyCostChart';
import { EfficiencyTrendChart } from '../charts/components/advanced/EfficiencyTrendChart';

interface ChartsProps {
  logs: DailyLog[];
  purchases?: FuelPurchase[];
}

export const Charts: React.FC<ChartsProps> = ({ logs, purchases = [] }) => {
  const { dailyData, monthlyData, stationData, hasEnoughData } = useChartData(logs, purchases);

  if (!hasEnoughData) {
    return (
      <ChartCard title="Grafikler" icon={<Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />}>
        <EmptyChartState
          title="Yetersiz Veri"
          message="Grafiklerin oluşturulması için en az 2 gün veri girişi yapmanız gerekmektedir."
        />
      </ChartCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Station Distribution Chart */}
      {stationData.length > 0 && (
        <ChartCard
          title="İstasyon Tercihleri"
          subtitle="En sık ziyaret edilen istasyonlar"
          icon={<PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBgColor="bg-blue-50 dark:bg-blue-900/30"
        >
          <StationPieChart data={stationData} />
        </ChartCard>
      )}

      {/* Cost Chart */}
      <ChartCard title="Son 15 Günlük Maliyet (TL)">
        <CostChart data={dailyData} />
      </ChartCard>

      {/* Consumption Chart */}
      <ChartCard title="Tüketim Trendi & Fiyat">
        <ConsumptionChart data={dailyData} />
      </ChartCard>

      {/* Monthly Trend Chart */}
      {monthlyData.length >= 2 && (
        <ChartCard
          title="Aylık Trend (Son 6 Ay)"
          icon={<Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
          iconBgColor="bg-primary-50 dark:bg-gray-700"
        >
          <MonthlyTrendChart data={monthlyData} />
        </ChartCard>
      )}

      {/* Brand Analysis Charts */}
      <BrandCharts logs={logs} purchases={purchases} />

      {/* Advanced Analytics Section */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-600" />
          Gelişmiş Analizler
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Hız vs Tüketim Analizi"
            subtitle="Daha hızlı gitmek ne kadar yaktırıyor?"
            icon={<Activity className="w-5 h-5 text-purple-600" />}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          >
            <CorrelationChart logs={logs} />
          </ChartCard>

          <ChartCard
            title="Verimlilik Trendi"
            subtitle="Zamanla sürüş alışkanlığınızın değişimi"
            icon={<Activity className="w-5 h-5 text-orange-600" />}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          >
            <EfficiencyTrendChart logs={logs} />
          </ChartCard>
        </div>

        <div className="mt-6">
          <ChartCard
            title="Detaylı Maliyet Dağılımı"
            subtitle="Aylık Yakıt Giderleriniz"
          >
            <MonthlyCostChart purchases={purchases} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};