import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { DailyLog } from './types';
import { FileSpreadsheet, Loader2, Download, Upload, Check, ArrowRight, X } from 'lucide-react';

interface ExcelImportProps {
  logs: DailyLog[]; // Received logs to export
  onImport: (logs: DailyLog[]) => void;
}

type AppField = 'date' | 'currentOdometer' | 'dailyDistance' | 'avgConsumption' | 'fuelPrice' | 'isRefuelDay';

const FIELD_LABELS: Record<AppField, string> = {
  date: "Tarih",
  currentOdometer: "Güncel KM",
  dailyDistance: "Yapılan KM",
  avgConsumption: "Ort. Tüketim",
  fuelPrice: "Benzin Fiyatı",
  isRefuelDay: "Yakıt Alındı mı?"
};

export const ExcelImport: React.FC<ExcelImportProps> = ({ logs, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);

  // Mapping State
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<AppField, string>>({
    date: '',
    currentOdometer: '',
    dailyDistance: '',
    avgConsumption: '',
    fuelPrice: '',
    isRefuelDay: ''
  });

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setShowOptions(false);
  };

  const handleExportLogs = () => {
    if (logs.length === 0) {
      alert("Dışa aktarılacak kayıt bulunamadı.");
      setShowOptions(false);
      return;
    }

    try {
      const exportData = logs.map(log => ({
        "Tarih": new Date(log.date).toLocaleDateString('tr-TR'),
        "Güncel KM": log.currentOdometer,
        "Yapılan KM": log.dailyDistance,
        "Ort. Tüketim (L/100km)": log.avgConsumption,
        "Benzin Fiyatı (TL)": log.fuelPrice,
        "Yakıt Alındı": log.isRefuelDay ? "Evet" : "Hayır",
        "Tüketilen Yakıt (L)": log.dailyFuelConsumed,
        "Maliyet (TL)": log.dailyCost,
        "KM Başına (TL)": log.costPerKm,
        "Notlar": log.notes || ""
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Yakit_Kayitlari");
      const fileName = `yakit_takip_yedek_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      setShowOptions(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Excel dosyası oluşturulurken bir hata oluştu.");
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const headers = ["Tarih", "Güncel KM", "Yapılan KM", "Ortalama Tüketim", "Benzin Fiyatı", "Yakıt Alındı"];
      const exampleData = [
        {
          "Tarih": new Date().toISOString().split('T')[0],
          "Güncel KM": 12500,
          "Yapılan KM": 45.5,
          "Ortalama Tüketim": 6.5,
          "Benzin Fiyatı": 42.50,
          "Yakıt Alındı": "Hayır"
        }
      ];
      const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Veri Girişi Şablonu");
      XLSX.writeFile(wb, "yakit_takip_sablon.xlsx");
      setShowOptions(false);
    } catch (error) {
      alert("Şablon oluşturulurken bir hata oluştu.");
    }
  };

  // 1. Read File & Extract Headers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert("Dosya boş veya okunamadı.");
        setLoading(false);
        return;
      }

      const headers = Object.keys(jsonData[0]);
      setExcelHeaders(headers);
      setExcelData(jsonData);

      // Auto-guess mapping
      const initialMapping = { ...columnMapping };
      const guess = (keywords: string[]) => {
        const lowerHeaders = headers.map(h => h.toLowerCase());
        for (const k of keywords) {
          const idx = lowerHeaders.findIndex(h => h.includes(k.toLowerCase()));
          if (idx !== -1) return headers[idx];
        }
        return '';
      };

      initialMapping.date = guess(['tarih', 'date', 'zaman']);
      initialMapping.currentOdometer = guess(['güncel', 'current', 'odo', 'km', 'sayaç']);
      initialMapping.dailyDistance = guess(['yapılan', 'distance', 'mesafe', 'trip']);
      initialMapping.avgConsumption = guess(['ortalama', 'avg', 'consumption', 'tüketim']);
      initialMapping.fuelPrice = guess(['fiyat', 'price', 'tutar', 'cost']);
      initialMapping.isRefuelDay = guess(['yakıt', 'refuel', 'alındı']);

      setColumnMapping(initialMapping);
      setMappingModalOpen(true);

    } catch (error) {
      console.error("Read error:", error);
      alert("Dosya okunamadı.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. Execute Import with Mapping
  const executeImport = () => {
    const importedLogs: DailyLog[] = [];
    let successCount = 0;
    let skippedCount = 0;

    excelData.forEach((row) => {
      // Date Parsing
      const rawDate = row[columnMapping.date];
      let dateStr = new Date().toISOString().split('T')[0];

      if (rawDate) {
        if (rawDate instanceof Date) {
          dateStr = rawDate.toISOString().split('T')[0];
        } else if (typeof rawDate === 'string') {
          // Try simple parse
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) dateStr = d.toISOString().split('T')[0];
        }
      }

      const dailyDistance = parseFloat(row[columnMapping.dailyDistance] || '0');
      const avgConsumption = parseFloat(row[columnMapping.avgConsumption] || '0');
      const fuelPrice = parseFloat(row[columnMapping.fuelPrice] || '0');
      const currentOdometer = parseFloat(row[columnMapping.currentOdometer] || '0');

      const rawRefuel = row[columnMapping.isRefuelDay];
      const isRefuelDay = rawRefuel === true || rawRefuel === 'Evet' || rawRefuel === 'Yes' || (fuelPrice > 0);

      // Validation logic same as before
      if (!dailyDistance || dailyDistance <= 0) {
        skippedCount++;
        return;
      }

      if (dailyDistance > 0 && avgConsumption > 0) {
        const dailyFuelConsumed = (dailyDistance * avgConsumption) / 100;
        const dailyCost = dailyFuelConsumed * (fuelPrice > 0 ? fuelPrice : 0);
        const costPerKm = dailyDistance > 0 ? dailyCost / dailyDistance : 0;

        const newLog: DailyLog = {
          id: crypto.randomUUID(),
          date: dateStr,
          currentOdometer,
          dailyDistance,
          avgConsumption,
          isRefuelDay,
          fuelPrice: fuelPrice || 0,
          dailyFuelConsumed,
          dailyCost,
          costPerKm,
          notes: "" // Default empty note for imported
        };

        importedLogs.push(newLog);
        successCount++;
      } else {
        skippedCount++;
      }
    });

    onImport(importedLogs);
    setMappingModalOpen(false);
    alert(`${successCount} kayıt başarıyla eklendi.\n${skippedCount} adet uygun olmayan satır atlandı.`);
  };

  return (
    <div className="relative" ref={menuRef}>
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
        <span className="hidden sm:inline">Excel</span>
      </button>

      {/* Menu Dropdown */}
      {showOptions && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          <div className="py-1">
            <button
              onClick={handleExportLogs}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 border-b border-gray-50 dark:border-gray-700"
            >
              <Download className="w-4 h-4 text-purple-500" />
              <span>Excel İndir (Yedek)</span>
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 border-b border-gray-50 dark:border-gray-700"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-500" />
              <span>Şablon İndir</span>
            </button>
            <button
              onClick={handleUploadClick}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4 text-green-500" />
              <span>Veri Yükle</span>
            </button>
          </div>
        </div>
      )}

      {/* Mapping Modal */}
      {mappingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Sütun Eşleştirme
              </h3>
              <button
                onClick={() => setMappingModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Excel dosyanızdaki sütunları uygulama alanlarıyla eşleştirin.
              </p>

              {Object.keys(FIELD_LABELS).map((key) => {
                const fieldKey = key as AppField;
                return (
                  <div key={fieldKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">
                      {FIELD_LABELS[fieldKey]}
                    </label>
                    <ArrowRight className="hidden sm:block w-4 h-4 text-gray-400" />
                    <select
                      value={columnMapping[fieldKey]}
                      onChange={(e) => setColumnMapping(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seçiniz...</option>
                      {excelHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setMappingModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={executeImport}
                disabled={!columnMapping.dailyDistance || !columnMapping.avgConsumption}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                İçe Aktar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};