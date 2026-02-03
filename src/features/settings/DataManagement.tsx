import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyLog } from '../../types';
import { Download, Upload, Trash2, AlertTriangle, FileJson, Check, FileSpreadsheet, ArrowRight, X, Loader2, FileText, Smartphone, Database } from 'lucide-react';

interface DataManagementProps {
    logs: DailyLog[];
    onImport: (logs: DailyLog[]) => void;
    onClear: () => void;
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

export const DataManagement: React.FC<DataManagementProps> = ({ logs, onImport, onClear }) => {
    const [importStatus, setImportStatus] = useState<{ success: boolean, message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    // Excel Mapping State
    const [mappingModalOpen, setMappingModalOpen] = useState(false);
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

    const handleExportJSON = () => {
        const dataStr = JSON.stringify(logs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `yakit_takip_yedek_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleExportExcel = () => {
        if (logs.length === 0) {
            alert("Dışa aktarılacak kayıt bulunamadı.");
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
        } catch (error) {
            console.error("Export error:", error);
            alert("Excel dosyası oluşturulurken bir hata oluştu.");
        }
    };

    const handleExportPDF = () => {
        if (logs.length === 0) {
            alert("Dışa aktarılacak kayıt bulunamadı.");
            return;
        }
        try {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(20);
            doc.setTextColor(59, 130, 246); // Blue
            doc.text('TripBook - Rapor', 14, 20);

            // Date
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 28);

            // Summary Stats
            const totalDistance = logs.reduce((sum, log) => sum + log.dailyDistance, 0);
            const totalCost = logs.reduce((sum, log) => sum + log.dailyCost, 0);
            const totalFuel = logs.reduce((sum, log) => sum + log.dailyFuelConsumed, 0);
            const avgConsumption = logs.length > 0 ? logs.reduce((sum, log) => sum + log.avgConsumption, 0) / logs.length : 0;

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text('Özet İstatistikler', 14, 40);

            doc.setFontSize(10);
            doc.text(`Toplam Mesafe: ${totalDistance.toLocaleString('tr-TR')} km`, 14, 48);
            doc.text(`Toplam Harcama: ₺${totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 14, 55);
            doc.text(`Toplam Yakıt: ${totalFuel.toFixed(1)} L`, 14, 62);
            doc.text(`Ortalama Tüketim: ${avgConsumption.toFixed(2)} L/100km`, 14, 69);
            doc.text(`Kayıt Sayısı: ${logs.length}`, 14, 76);

            // Table
            const tableData = logs.slice(0, 50).map(log => [
                new Date(log.date).toLocaleDateString('tr-TR'),
                log.currentOdometer.toLocaleString('tr-TR'),
                log.dailyDistance.toString(),
                log.avgConsumption.toFixed(1),
                `₺${log.dailyCost.toFixed(2)}`,
                log.isRefuelDay ? 'Evet' : '-'
            ]);

            autoTable(doc, {
                startY: 85,
                head: [['Tarih', 'Sayaç', 'Mesafe', 'Tüketim', 'Maliyet', 'Yakıt']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 30, halign: 'right' },
                    2: { cellWidth: 20, halign: 'right' },
                    3: { cellWidth: 22, halign: 'right' },
                    4: { cellWidth: 25, halign: 'right' },
                    5: { cellWidth: 18, halign: 'center' }
                }
            });

            const fileName = `yakit_rapor_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error("PDF export error:", error);
            alert("PDF dosyası oluşturulurken bir hata oluştu.");
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setImportStatus(null);

        const fileName = file.name.toLowerCase();

        // Handle JSON files
        if (fileName.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string);
                    if (Array.isArray(json)) {
                        onImport(json);
                        setImportStatus({ success: true, message: `${json.length} kayıt başarıyla içe aktarıldı.` });
                    } else {
                        setImportStatus({ success: false, message: "Dosya içeriği okunamadı." });
                    }
                } catch (error) {
                    setImportStatus({ success: false, message: "Bozuk veya hatalı JSON formatı." });
                }
                setLoading(false);
            };
            reader.readAsText(file);
        }
        // Handle Excel files
        else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            try {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    setImportStatus({ success: false, message: "Dosya boş veya okunamadı." });
                    setLoading(false);
                    return;
                }

                const headers = Object.keys(jsonData[0]);
                setExcelHeaders(headers);
                setExcelData(jsonData);

                // Auto-guess mapping logic same as before...
                const guess = (keywords: string[]) => {
                    const lowerHeaders = headers.map(h => h.toLowerCase());
                    for (const k of keywords) {
                        const idx = lowerHeaders.findIndex(h => h.includes(k.toLowerCase()));
                        if (idx !== -1) return headers[idx];
                    }
                    return '';
                };

                setColumnMapping({
                    date: guess(['tarih', 'date', 'zaman']),
                    currentOdometer: guess(['güncel', 'current', 'odo', 'sayaç']),
                    dailyDistance: guess(['yapılan', 'distance', 'mesafe', 'trip']),
                    avgConsumption: guess(['ortalama', 'avg', 'consumption', 'tüketim']),
                    fuelPrice: guess(['fiyat', 'price', 'tutar', 'cost']),
                    isRefuelDay: guess(['yakıt', 'refuel', 'alındı'])
                });

                setMappingModalOpen(true);
            } catch (error) {
                console.error("Read error:", error);
                setImportStatus({ success: false, message: "Dosya okunamadı." });
            }
            setLoading(false);
        } else {
            setImportStatus({ success: false, message: "Desteklenmeyen dosya formatı. JSON veya Excel (.xlsx) kullanın." });
            setLoading(false);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const executeExcelImport = () => {
        // Same implementation as original, simplified for brevity in this task context
        // Assuming the logic is copied over or if user wanted full rewrite I would include it.
        // Since I am editing the whole file, I MUST include the logic.
        const importedLogs: DailyLog[] = [];
        let successCount = 0;
        let skippedCount = 0;

        excelData.forEach((row) => {
            const rawDate = row[columnMapping.date];
            let dateStr = new Date().toISOString().split('T')[0];

            if (rawDate) {
                const toLocalYMD = (d: Date) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                };

                if (rawDate instanceof Date) {
                    dateStr = toLocalYMD(rawDate);
                } else if (typeof rawDate === 'string') {
                    if (rawDate.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                        const [day, month, year] = rawDate.split('.').map(Number);
                        const d = new Date(year, month - 1, day);
                        if (!isNaN(d.getTime())) dateStr = toLocalYMD(d);
                    } else {
                        const d = new Date(rawDate);
                        if (!isNaN(d.getTime())) dateStr = toLocalYMD(d);
                    }
                }
            }

            const dailyDistance = parseFloat(row[columnMapping.dailyDistance] || '0');
            const avgConsumption = parseFloat(row[columnMapping.avgConsumption] || '0');
            const fuelPrice = parseFloat(row[columnMapping.fuelPrice] || '0');
            const currentOdometer = parseFloat(row[columnMapping.currentOdometer] || '0');

            const rawRefuel = row[columnMapping.isRefuelDay];
            const isRefuelDay = rawRefuel === true || rawRefuel === 'Evet' || rawRefuel === 'Yes' || (fuelPrice > 0);

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
                    notes: ""
                };

                importedLogs.push(newLog);
                successCount++;
            } else {
                skippedCount++;
            }
        });

        onImport(importedLogs);
        setMappingModalOpen(false);
        setImportStatus({ success: true, message: `${successCount} kayıt başarıyla eklendi. ${skippedCount} satır atlandı.` });
    };

    const handleClearData = () => {
        if (window.confirm("DİKKAT! Tüm verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz.")) {
            onClear();
            setImportStatus({ success: true, message: "Tüm veriler temizlendi." });
        }
    };

    return (
        <div className="space-y-6">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Veri Yönetimi</h3>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        Verilerinizi dışa aktararak yedekleyebilir veya başka cihazlardan veri yükleyebilirsiniz.
                    </p>

                    {/* Export Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <button
                            onClick={handleExportJSON}
                            className="group flex flex-col items-center justify-center p-4 border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all hover:-translate-y-1"
                        >
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                                <FileJson className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                            </div>
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">JSON Yedek</span>
                            <span className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Tam Veri Yedeği</span>
                        </button>

                        <button
                            onClick={handleExportExcel}
                            className="group flex flex-col items-center justify-center p-4 border border-green-100 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/20 transition-all hover:-translate-y-1"
                        >
                            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg mb-2 group-hover:bg-green-200 dark:group-hover:bg-green-700 transition-colors">
                                <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-300" />
                            </div>
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">Excel Aktar</span>
                            <span className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Tablo Formatı</span>
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="group flex flex-col items-center justify-center p-4 border border-red-100 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all hover:-translate-y-1"
                        >
                            <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg mb-2 group-hover:bg-red-200 dark:group-hover:bg-red-700 transition-colors">
                                <FileText className="w-6 h-6 text-red-600 dark:text-red-300" />
                            </div>
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">PDF Rapor</span>
                            <span className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Yazdırılabilir</span>
                        </button>
                    </div>

                    {/* Import Button */}
                    <div className="relative">
                        <button
                            onClick={triggerFileInput}
                            disabled={loading}
                            className="w-full flex items-center justify-center p-5 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
                        >
                            <div className="flex flex-col items-center">
                                <div className="p-3 bg-gray-200 dark:bg-gray-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                                    ) : (
                                        <Upload className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    )}
                                </div>
                                <span className="font-bold text-gray-700 dark:text-gray-200">
                                    Yedek Dosyası Yükle
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    JSON veya Excel (.xlsx) dosyaları
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* iOS Fallback */}
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl md:hidden border border-gray-100 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                            <Smartphone className="w-4 h-4" />
                            iOS Dosya Seçimi
                        </div>
                        <input
                            type="file"
                            accept=".json,.xlsx,.xls"
                            onChange={handleFileChange}
                            className="block w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                        />
                    </div>

                    {importStatus && (
                        <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${importStatus.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                            {importStatus.success ? <Check className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
                            <div>
                                <h4 className="font-bold text-sm">{importStatus.success ? 'Başarılı' : 'Hata'}</h4>
                                <p className="text-sm opacity-90">{importStatus.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
                <div className="p-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 flex items-center gap-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="font-bold text-red-900 dark:text-red-200">Tehlikeli Bölge</h3>
                </div>

                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Bu işlem tüm kayıtlarınızı ve ayarlarınızı kalıcı olarak silecektir. Geri alınamaz.
                    </p>
                    <button
                        onClick={handleClearData}
                        className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        Tüm Verileri Sil
                    </button>
                </div>
            </div>

            {/* Excel Filter Modal */}
            {mappingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                Sütun Eşleştirme
                            </h3>
                            <button onClick={() => setMappingModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                                Excel dosyanızdaki sütunları uygulamanın veri alanlarıyla eşleştirin.
                            </div>

                            {Object.keys(FIELD_LABELS).map((key) => {
                                const fieldKey = key as AppField;
                                return (
                                    <div key={fieldKey} className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {FIELD_LABELS[fieldKey]}
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={columnMapping[fieldKey]}
                                                onChange={(e) => setColumnMapping(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                                                className="w-full pl-3 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">Seçiniz...</option>
                                                {excelHeaders.map(header => (
                                                    <option key={header} value={header}>{header}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
                            <button
                                onClick={() => setMappingModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={executeExcelImport}
                                disabled={!columnMapping.dailyDistance || !columnMapping.avgConsumption}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-600/20 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none"
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
