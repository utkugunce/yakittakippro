import Tesseract from 'tesseract.js';

export const parseReceiptWithOCR = async (imageFile: File): Promise<{
    liters: number | null;
    pricePerLiter: number | null;
    totalAmount: number | null;
    error: string | null;
}> => {
    try {
        // 1. Run Tesseract OCR in Turkish language mode
        const result = await Tesseract.recognize(
            imageFile,
            'tur', // Turkish
            { logger: m => console.log('OCR Progress:', m.status, Math.round(m.progress * 100) + '%') }
        );

        const text = result.data.text.toUpperCase();
        console.log('--- Raw OCR Output ---');
        console.log(text);
        console.log('----------------------');

        // 2. Fallback Parsing Logic Regex
        // This is simple baseline heuristic parsing since receipt formats vary highly
        // and OCR is prone to dirty reads (e.g 0 instead of O, , instead of .)

        // Normalize text: replace common OCR mistakes
        const normalizedText = text
            .replace(/,/g, '.') // Convert commas to dots for floats
            .replace(/\s+/g, ' ') // Collapse spaces
            .replace(/O/g, '0') // O to 0 in numbers
            .replace(/I|L|l/g, '1'); // Replace l,I,L with 1 if surrounded by digits (heuristic, risky but sometimes needed for receipts)

        // Regex for Total (TUTAR, TOPLAM)
        // Looking for TOPLAM or TUTAR followed by roughly a decimal number
        const totalMatch = normalizedText.match(/(?:TOPLAM|TUTAR|TOP\.?)\s*[:=]?\s*[\*]*\s*(\d+[\.\,]\d{2})/);
        const totalAmount = totalMatch ? parseFloat(totalMatch[1]) : null;

        // Regex for Liters (LITRE, LT)
        // Looking for LT, LITRE or similar followed by a decimal
        const litersMatch = normalizedText.match(/(?:L[I1]TRE|LT|MKT|M[I1]KTAR)\s*[:=]?\s*[\*]?\s*(\d+[\.\,]\d+)/);
        const liters = litersMatch ? parseFloat(litersMatch[1]) : null;

        // Regex for Price Per Liter (B.FIYAT, BIRIM FIYAT)
        const priceMatch = normalizedText.match(/(?:B[I1]R[I1]M|F[I1]YAT|B\.F[I1]YAT)\s*[:=]?\s*[\*]?\s*(\d+[\.\,]\d{2})/);
        const pricePerLiter = priceMatch ? parseFloat(priceMatch[1]) : null;

        return {
            liters,
            pricePerLiter,
            totalAmount,
            error: null
        };

    } catch (error: any) {
        console.error('OCR Error:', error);
        return {
            liters: null,
            pricePerLiter: null,
            totalAmount: null,
            error: error.message || 'Fiş okunamadı.'
        };
    }
};
