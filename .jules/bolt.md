# Performance Journal

## 2024-05-23: Initial Assessment
- **Goal:** Improve initial load performance by lazy loading heavy components.
- **Identified Bottlenecks:**
  - `App.tsx` statically imports `FuelMap` (Leaflet) and `Reports` (jsPDF, XLSX). These are only needed in the 'reports' tab.
  - `EntryForm.tsx` statically imports `PhotoScanner` (Tesseract.js). This is only needed when the user clicks 'Fotoğraftan'.
- **Plan:** Implement code splitting using `React.lazy` and `Suspense` for these components.
