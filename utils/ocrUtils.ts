import Tesseract from 'tesseract.js';

export interface ScanResult {
    date?: string;
    totalAmount?: number;
    liters?: number;
    unitPrice?: number;
    text: string;
}

export interface DashboardScanResult {
    odometer?: number;
    consumption?: number;
    distance?: number;
    text: string;
}

export const scanDashboard = async (file: File): Promise<DashboardScanResult> => {
    try {
        const result = await Tesseract.recognize(
            file,
            'eng+tur',
            {
                logger: m => console.log(m)
            }
        );

        const text = result.data.text;
        console.log("Dashboard OCR Text:", text);

        return parseDashboardText(text);
    } catch (error) {
        console.error("OCR Error:", error);
        throw error;
    }
};

const parseDashboardText = (text: string): DashboardScanResult => {
    const result: DashboardScanResult = {
        text: text
    };

    // Clean text
    const cleanedText = text.replace(/,/g, '.').replace(/o/gi, '0').replace(/O/g, '0');
    const lines = cleanedText.split('\n');

    // Look for odometer (usually a large number like 12345 or 123456)
    // Pattern: 5-6 digit numbers that represent total kilometers
    const odometerMatch = cleanedText.match(/\b(\d{4,6})\s*(?:km|KM)?\b/);
    if (odometerMatch) {
        const value = parseInt(odometerMatch[1]);
        if (value > 1000 && value < 1000000) { // Reasonable odometer range
            result.odometer = value;
        }
    }

    // Look for consumption (L/100km) - usually 3-15 range with decimal
    // Patterns: "6.5 L/100km", "AVG 7.2", "ORT 6.8"
    const consumptionPatterns = [
        /(\d{1,2}[.,]\d)\s*(?:L\/100|lt\/100|l\/100)/i,
        /(?:AVG|ORT|ORTALAMA|AVERAGE).*?(\d{1,2}[.,]\d)/i,
        /(\d{1,2}[.,]\d)\s*(?:L|lt)/i
    ];

    for (const pattern of consumptionPatterns) {
        const match = cleanedText.match(pattern);
        if (match) {
            const value = parseFloat(match[1].replace(',', '.'));
            if (value >= 3 && value <= 25) { // Reasonable consumption range
                result.consumption = value;
                break;
            }
        }
    }

    // Look for trip distance (usually smaller number with km)
    // Patterns: "TRIP 45.2", "YOLCULUK 120", "MESAFE 85"
    const distancePatterns = [
        /(?:TRIP|YOLCULUK|MESAFE|GÜNLÜK).*?(\d{1,4}[.,]?\d?)\s*(?:km)?/i,
        /(\d{1,3}[.,]\d)\s*km/i
    ];

    for (const pattern of distancePatterns) {
        const match = cleanedText.match(pattern);
        if (match) {
            const value = parseFloat(match[1].replace(',', '.'));
            if (value > 0 && value < 2000) { // Reasonable daily distance
                result.distance = value;
                break;
            }
        }
    }

    return result;
};

export const scanReceipt = async (file: File): Promise<ScanResult> => {
    try {
        const result = await Tesseract.recognize(
            file,
            'eng+tur', // Scan for both English and Turkish
            {
                logger: m => console.log(m)
            }
        );

        const text = result.data.text;
        console.log("OCR Text:", text);

        return parseReceiptText(text);
    } catch (error) {
        console.error("OCR Error:", error);
        throw error;
    }
};

const parseReceiptText = (text: string): ScanResult => {
    // Clean text: remove spaces around newlines, unify separators
    const cleanedText = text.replace(/,/g, '.').replace(/\s+/g, ' ');

    const result: ScanResult = {
        text: text
    };

    // 1. Date Detection (DD.MM.YYYY or DD/MM/YYYY)
    // Matches 01.01.2024, 1.1.24 etc.
    const dateMatch = text.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
    if (dateMatch) {
        let day = parseInt(dateMatch[1]);
        let month = parseInt(dateMatch[2]);
        let year = parseInt(dateMatch[3]);

        // Fix 2-digit year
        if (year < 100) year += 2000;

        // Construct YYYY-MM-DD
        const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // Validate date
        const d = new Date(formattedDate);
        if (!isNaN(d.getTime())) {
            result.date = formattedDate;
        }
    }

    // 2. Total Amount Detection (Look for 'TOPLAM', 'TUTAR' followed by numbers)
    // Common patterns: "TOPLAM: 1.234,56", "TOPLAM TUTAR 500.00"
    const totalRegex = /(?:TOPLAM|TUTAR|ODENECEK).*?(\d+[.,]\d{2})/i;
    // Fallback: Find the largest number with 2 decimals (risky but often works for total)

    // We'll scan lines for "TOPLAM" or similar keywords
    const lines = text.split('\n');

    // Strategy: Look for specific keywords and grab the number on that line
    for (const line of lines) {
        const upperLine = line.toUpperCase();

        // LITERS (Litre, LT)
        if (upperLine.includes('LITRE') || upperLine.includes('LT') || upperLine.includes('MIKTAR')) {
            const match = line.match(/(\d+[.,]\d{2})/);
            if (match) {
                result.liters = parseFloat(match[1].replace(',', '.'));
            }
        }

        // UNIT PRICE (Birim Fiyat, TL/LT)
        if (upperLine.includes('FIYAT') || upperLine.includes('TL/L')) {
            const match = line.match(/(\d+[.,]\d{2})/);
            if (match) {
                result.unitPrice = parseFloat(match[1].replace(',', '.'));
            }
        }

        // TOTAL (Toplam, Tutar)
        // Usually the last big number, or explicitly labeled
        if (upperLine.includes('TOPLAM') || upperLine.includes('TUTAR')) {
            const match = line.match(/(\d+[.,]\d{2})/);
            if (match) {
                result.totalAmount = parseFloat(match[1].replace(',', '.'));
            }
        }
    }

    return result;
};
