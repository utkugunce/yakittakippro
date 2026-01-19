import React from 'react';
import { FileText, Sparkles, TrendingUp, Calendar } from 'lucide-react';

interface ReportHeaderProps {
  totalLogs: number;
  totalPurchases: number;
  dateRange?: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ 
  totalLogs, 
  totalPurchases,
  dateRange 
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 shadow-xl">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Detaylı Raporlar
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-sm text-white/70 mt-0.5">
                Sürüş performansınızın tam analizi
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span className="text-white/80 text-xs">Kayıt</span>
              </div>
              <p className="text-xl font-bold text-white">{totalLogs + totalPurchases}</p>
            </div>
            
            {dateRange && (
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-300" />
                  <span className="text-white/80 text-xs">Dönem</span>
                </div>
                <p className="text-sm font-medium text-white">{dateRange}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
