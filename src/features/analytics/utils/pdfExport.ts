import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyLog, FuelPurchase } from '../../../types';

interface PdfExportOptions {
    logs: DailyLog[];
    purchases: FuelPurchase[];
    title?: string;
}

export function generateSalesReport({ logs, purchases, title = 'Araç Satış Raporu' }: PdfExportOptions): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 28);

    // Calculate totals
    const totalDist = logs.reduce((acc, l) => acc + l.dailyDistance, 0);
    const totalCostLogs = logs.reduce((acc, l) => acc + l.dailyCost, 0);
    const totalFuelLogs = logs.reduce((acc, l) => acc + l.dailyFuelConsumed, 0);

    const totalCostPurchases = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
    const totalFuelPurchases = purchases.reduce((acc, p) => acc + p.liters, 0);

    const totalCost = totalCostLogs + totalCostPurchases;
    const totalFuel = totalFuelLogs + totalFuelPurchases;
    const realAvg = totalDist > 0 ? (totalFuel / totalDist) * 100 : 0;

    // Summary Table
    autoTable(doc, {
        startY: 35,
        head: [['Özet Bilgiler', 'Değer']],
        body: [
            ['Toplam Kilometre', `${totalDist.toLocaleString()} km`],
            ['Toplam Yakıt Harcaması', `₺${totalCost.toLocaleString()}`],
            ['Toplam Yakıt (Litre)', `${totalFuel.toFixed(1)} L`],
            ['Ortalama Tüketim', `${realAvg.toFixed(2)} L/100km`],
            ['Kayıtlı Gün Sayısı', `${logs.length}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
    });

    // Fuel Purchases Table
    if (purchases.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY || 100;

        autoTable(doc, {
            startY: finalY + 10,
            head: [['Tarih', 'İstasyon', 'Litre', 'Fiyat/L', 'Toplam']],
            body: purchases.slice(0, 20).map(p => [
                new Date(p.date).toLocaleDateString('tr-TR'),
                p.station || '-',
                `${p.liters.toFixed(1)} L`,
                `₺${p.pricePerLiter.toFixed(2)}`,
                `₺${p.totalAmount.toLocaleString()}`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [46, 204, 113] }
        });
    }

    // Save
    doc.save(`yakit-rapor-${new Date().toISOString().slice(0, 10)}.pdf`);
}
