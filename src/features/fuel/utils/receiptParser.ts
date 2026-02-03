export interface ExtractedReceiptData {
    date?: string;
    totalAmount?: number;
    liters?: number;
    pricePerLiter?: number;
    station?: string;
}

export const parseReceiptText = (text: string): ExtractedReceiptData => {
    const lines = text.split('\n').map(l => l.trim().toUpperCase());
    const data: ExtractedReceiptData = {};

    // 1. Find Date (DD.MM.YYYY or DD/MM/YYYY)
    // Regex matches 01-31 . 01-12 . 2000-2099
    const dateRegex = /(\d{2})[./](\d{2})[./](20\d{2})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
        // Convert to YYYY-MM-DD for input field
        const [_, day, month, year] = dateMatch;
        data.date = `${year}-${month}-${day}`;
    }

    // 2. Find Total Amount (Look for "TOPLAM", "TUTAR" or just large numbers/currency symbols)
    // Looking for lines with TL or currency format
    // Strategy: Look for "TOPLAM" or "*TOPLAM" line first
    const totalLine = lines.find(l => l.includes('TOPLAM') || l.includes('GENEL TOPLAM') || l.includes('NİHAİ TOPLAM'));
    if (totalLine) {
        data.totalAmount = extractCurrency(totalLine);
    }

    // If no total found, look for largest number that looks like currency? heavy heuristic.
    // Let's stick to explicit keywords for V1.

    // 3. Find Liters (Look for "LT", "LITRE", "MIKTAR")
    // Common pattern: 45,20 LT x 22,10 TL
    const literLine = lines.find(l => l.includes('LT') || l.includes('LITRE') || l.includes('MİKTAR'));
    if (literLine) {
        // Extract number before "LT"
        // Example: 10,00 LT
        const literMatch = literLine.match(/(\d+[.,]\d+)\s*(LT|LITRE)/);
        if (literMatch) {
            data.liters = parseTurkishFloat(literMatch[1]);
        }
    }

    // 4. Find Price Per Liter
    // Often near Liter data: "B.FIYAT", "BIRIM FIYAT"
    const priceLine = lines.find(l => l.includes('FIYAT') || l.includes('FİYAT'));
    if (priceLine) {
        // Try to get first number in line?
        const priceMatch = priceLine.match(/(\d+[.,]\d+)/);
        if (priceMatch) {
            const val = parseTurkishFloat(priceMatch[1]);
            // Sanity check: Price usually between 20-60 TL currently
            if (val > 10 && val < 60) {
                data.pricePerLiter = val;
            }
        }
    }

    // 5. Station Name (Usually exact first or second line)
    // Heuristic: Take first line that isn't a header/garbage
    if (lines.length > 0) {
        // Skip common header garbage
        const potentialName = lines.find(l => l.length > 3 && !l.includes('FIŞ') && !l.includes('NO:') && !l.includes('TARIH'));
        if (potentialName) {
            data.station = toTitleCase(potentialName);
        }
    }

    // Sanity Checks / Inference
    if (data.totalAmount && data.pricePerLiter && !data.liters) {
        data.liters = parseFloat((data.totalAmount / data.pricePerLiter).toFixed(2));
    }
    if (data.totalAmount && data.liters && !data.pricePerLiter) {
        data.pricePerLiter = parseFloat((data.totalAmount / data.liters).toFixed(2));
    }

    return data;
};

// Helper: 45,50 -> 45.50
const parseTurkishFloat = (str: string): number => {
    // Remove symbols, keep digits, comma, dot
    const clean = str.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(clean);
};

// Helper: Extract number from string like "TOPLAM: 1.250,50 TL"
const extractCurrency = (str: string): number | undefined => {
    // Find number pattern at end of string or after keyword
    // Match 1.250,00 or 1250,00
    // Try to find the last valid number in the string
    const matches = str.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g);
    if (!matches) return undefined;

    // Usually the amount is the last number
    return parseTurkishFloat(matches[matches.length - 1]);
};

const toTitleCase = (str: string) => {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
};
