import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyLog } from './types';
import { Download, Upload, Trash2, AlertTriangle, FileJson, Check, FileSpreadsheet, ArrowRight, X, Loader2, FileText } from 'lucide-react';

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
            doc.text('Yakıt Takip Pro - Rapor', 14, 20);

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

            // Footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Sayfa ${i} / ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            }

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
                        const isValid = json.every(item => item.id && item.date && item.dailyDistance !== undefined);
                        if (isValid) {
                            onImport(json);
                            setImportStatus({ success: true, message: `${json.length} kayıt başarıyla içe aktarıldı.` });
                        } else {
                            setImportStatus({ success: false, message: "Geçersiz dosya formatı." });
                        }
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

                // Auto-guess mapping
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
        const importedLogs: DailyLog[] = [];
        let successCount = 0;
        let skippedCount = 0;

        excelData.forEach((row) => {
            const rawDate = row[columnMapping.date];
            let dateStr = new Date().toISOString().split('T')[0];

            if (rawDate) {
                // Helper to format as YYYY-MM-DD using local time to avoid timezone shifts
                const toLocalYMD = (d: Date) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                };

                if (rawDate instanceof Date) {
                    dateStr = toLocalYMD(rawDate);
                } else if (typeof rawDate === 'string') {
                    // Try parsing DD.MM.YYYY format common in Turkey
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
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,.xlsx,.xls"
                onChange={handleFileChange}
                style={{ position: 'fixed', top: '-100px', left: '-100px', opacity: 0 }}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <FileJson className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Veri Yedekleme & Geri Yükleme
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                    Verilerinizi JSON veya Excel formatında yedekleyebilir ve geri yükleyebilirsiniz.
                </p>

                {/* Export Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                        onClick={handleExportJSON}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                    >
                        <Download className="w-6 h-6 text-blue-500 mb-2" />
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-200">JSON</span>
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                    >
                        <FileSpreadsheet className="w-6 h-6 text-green-500 mb-2" />
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-200">Excel</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    >
                        <FileText className="w-6 h-6 text-red-500 mb-2" />
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-200">PDF</span>
                    </button>
                </div>

                {/* Import Button */}
                <button
                    onClick={triggerFileInput}
                    disabled={loading}
                    className="w-full flex items-center justify-center p-4 border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all"
                >
                    {loading ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mr-2" /> : <Upload className="w-6 h-6 text-emerald-500 mr-2" />}
                    <span className="font-bold text-gray-700 dark:text-gray-200">Yedek Yükle (JSON veya Excel)</span>
                </button>

                {/* Visible iOS Fallback */}
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl md:hidden">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">📱 iOS için:</p>
                    <input
                        type="file"
                        accept=".json,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    />
                </div>

                {importStatus && (
                    <div className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${importStatus.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                        {importStatus.success ? <Check className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                        <p className="text-sm">{importStatus.message}</p>
                    </div>
                )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 p-6">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4 flex items-center">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Tehlikeli Bölge
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Tüm verilerinizi sıfırlamak istiyorsanız bu seçeneği kullanın.
                    </p>
                    <button
                        onClick={handleClearData}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm whitespace-nowrap"
                    >
                        Tüm Verileri Sil
                    </button>
                </div>
            </div>

            {/* Column Mapping Modal for Excel */}
            {mappingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                Sütun Eşleştirme
                            </h3>
                            <button onClick={() => setMappingModalOpen(false)} className="text-gray-400 hover:text-red-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Excel sütunlarını uygulama alanlarıyla eşleştirin.
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
                                            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
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
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                            >
                                İptal
                            </button>
                            <button
                                onClick={executeExcelImport}
                                disabled={!columnMapping.dailyDistance || !columnMapping.avgConsumption}
                                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
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
