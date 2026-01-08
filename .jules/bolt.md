## 2024-05-22 - Initial Setup
**Learning:** Initialized Bolt's journal.
**Action:** Use this to track critical performance learnings.

## 2024-05-22 - Render Loop Performance
**Learning:** Found O(N) calculation `Math.max(...logs.map(...))` inside `App.tsx` render loop. This causes inefficient re-calculation on every render and risks stack overflow with large datasets (>100k items) due to spread operator.
**Action:** Memoized the calculation using `useMemo` and replaced spread operator with `reduce` to ensure O(N) safety and prevent re-calculation during UI interactions like tab switching.
