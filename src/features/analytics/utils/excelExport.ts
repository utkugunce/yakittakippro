import * as XLSX from 'xlsx';
import { DailyLog, FuelPurchase } from '../../../types';

interface ExcelExportOptions {
    logs: DailyLog[];
    purchases: FuelPurchase[];
    filename?: string;
}

/**
 * Export logs and purchases to Excel file
 */
export function exportToExcel({ logs, purchases, filename }: ExcelExportOptions): void {
    const wb = XLSX.utils.book_new();

    // Logs Sheet
    if (logs.length > 0) {
        const logsData = logs.map(log => ({
            'Tarih': new Date(log.date).toLocaleDateString('tr-TR'),
            'Mesafe (km)': log.dailyDistance,
            'Maliyet (₺)': log.dailyCost.toFixed(2),
            'Yakıt (L)': log.dailyFuelConsumed.toFixed(2),
            'Tüketim (L/100km)': log.avgConsumption.toFixed(2),
            'Benzin Fiyatı': log.fuelPrice.toFixed(2),
            'İstasyon': log.fuelStation || '-'
        }));
        const ws1 = XLSX.utils.json_to_sheet(logsData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Günlük Kayıtlar');
    }

    // Purchases Sheet
    if (purchases.length > 0) {
        const purchasesData = purchases.map(p => ({
            'Tarih': new Date(p.date).toLocaleDateString('tr-TR'),
            'İstasyon': p.station || '-',
            'Litre': p.liters.toFixed(2),
            'Fiyat/L (₺)': p.pricePerLiter.toFixed(2),
            'Toplam (₺)': p.totalAmount.toFixed(2),
            'Şehir': p.city || '-'
        }));
        const ws2 = XLSX.utils.json_to_sheet(purchasesData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Yakıt Alımları');
    }

    // Summary Sheet
    const totalDist = logs.reduce((sum, l) => sum + l.dailyDistance, 0);
    const totalCost = logs.reduce((sum, l) => sum + l.dailyCost, 0) +
        purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalFuel = logs.reduce((sum, l) => sum + l.dailyFuelConsumed, 0) +
        purchases.reduce((sum, p) => sum + p.liters, 0);

    const summaryData = [
        { 'Metrik': 'Toplam Mesafe', 'Değer': `${totalDist.toLocaleString()} km` },
        { 'Metrik': 'Toplam Harcama', 'Değer': `₺${totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}` },
        { 'Metrik': 'Toplam Yakıt', 'Değer': `${totalFuel.toFixed(1)} L` },
        { 'Metrik': 'Ortalama Tüketim', 'Değer': totalDist > 0 ? `${((totalFuel / totalDist) * 100).toFixed(2)} L/100km` : '-' },
        { 'Metrik': 'Kayıt Sayısı', 'Değer': `${logs.length} gün` },
        { 'Metrik': 'Yakıt Alımı Sayısı', 'Değer': `${purchases.length} alım` }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');

    // Save
    const defaultFilename = `yakit-rapor-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename || defaultFilename);
}

/**
 * Export logs and purchases to CSV file
 */
export function exportToCSV({ logs, purchases, filename }: ExcelExportOptions): void {
    const rows: string[] = [];

    // Header
    rows.push('Tarih,Mesafe,Maliyet,Yakıt,Tüketim,Fiyat,İstasyon');

    // Log rows
    logs.forEach(log => {
        rows.push([
            new Date(log.date).toLocaleDateString('tr-TR'),
            log.dailyDistance,
            log.dailyCost.toFixed(2),
            log.dailyFuelConsumed.toFixed(2),
            log.avgConsumption.toFixed(2),
            log.fuelPrice.toFixed(2),
            `"${log.fuelStation || '-'}"`
        ].join(','));
    });

    // BOM for UTF-8
    const bom = '\uFEFF';
    const csvContent = bom + rows.join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `yakit-rapor-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
