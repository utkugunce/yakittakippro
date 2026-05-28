export interface ScanResult {
    date?: string;
    totalAmount?: number;
    liters?: number;
    unitPrice?: number;
    text: string;
}

export const scanReceipt = async (file: File): Promise<ScanResult> => {
    try {
        // Dynamic import to reduce initial bundle size
        const Tesseract = (await import('tesseract.js')).default;

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

// Exported so the parsing heuristics can be unit-tested without running Tesseract.
export const parseReceiptText = (text: string): ScanResult => {
    const result: ScanResult = {
        text: text
    };

    // 1. Date Detection (DD.MM.YYYY or DD/MM/YYYY)
    // Matches 01.01.2024, 1.1.24 etc.
    const dateMatch = text.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
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

    // 2. Total / liters / unit price detection by scanning lines for keywords.
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
