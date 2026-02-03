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
    </div>
  );
};