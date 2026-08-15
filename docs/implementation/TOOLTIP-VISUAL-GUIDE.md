# Tooltip Positioning - Visual Guide

## Overview
Session hover tooltips now use a **horizontal-first positioning strategy** that keeps them contained within the Market Sessions card at all times.

---

## Scenario 1: Normal Desktop View

### Session Bar in Left/Middle Area
```
╔════════════════════════════════════════════════════════════╗
║ SITE NAVBAR / HEADER (safe - no overlap)                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ ┌────────────────────────────────────────────────────────┐║
║ │ MARKET SESSIONS CARD                                   │║
║ │                                                        │║
║ │  Pre-Open:                                            │║
║ │  ┌─────────────┐ ┌──────────────────────┐            │║
║ │  │ Bar         │ │ Pre-Open Session     │            │║
║ │  │ [HOVER]     │ │ OPENING SOON    9:00 │            │║
║ │  └─────────────┘ │ Opens:  9:00 AM IST  │            │║
║ │                  │ Closes: 9:15 AM IST  │            │║
║ │                  │ Opens In: 5m         │            │║
║ │                  └──────────────────────┘            │║
║ │                                   ↑                   │║
║ │                          Tooltip to right             │║
║ │                          (default position)           │║
║ │                                                        │║
║ │  NSE/BSE:                                             │║
║ │  ┌─────────────┐ ┌──────────────────────┐            │║
║ │  │ Bar         │ │ NSE Equity Session   │            │║
║ │  └─────────────┘ │ OPEN                 │            │║
║ │                  └──────────────────────┘            │║
║ └────────────────────────────────────────────────────────┘║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

**Key Points**:
- ✅ Tooltip appears to the **right** of the bar
- ✅ Aligned vertically with the bar top
- ✅ 12px gap between bar and tooltip
- ✅ Fully contained within card
- ✅ No navbar overlap

---

## Scenario 2: Bar Near Right Edge

### Session Bar at End of Timeline
```
╔════════════════════════════════════════════════════════════╗
║ MARKET SESSIONS CARD                                       ║
║                                                            ║
║  Equity F&O:                                              ║
║              ┌──────────────────────┐ ┌────────────────┐  ║
║              │ Equity F&O Session   │ │ Bar            │  ║
║              │ OPEN            9:20 │ │ [HOVER]        │  ║
║              │ Opens:  9:15 AM IST  │ └────────────────┘  ║
║              │ Closes: 3:30 PM IST  │                     ║
║              │ Closes In: 6h 10m    │                     ║
║              └──────────────────────┘                     ║
║                        ↑                                   ║
║               Tooltip to left                              ║
║               (flipped because no space right)             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

**Key Points**:
- ✅ Tooltip **flips to left** when bar near right edge
- ✅ Still aligned vertically with bar
- ✅ Stays within card bounds
- ✅ Smart horizontal positioning

---

## Scenario 3: Narrow Viewport (Mobile)

### Fallback to Below Positioning
```
╔═══════════════════════════════╗
║ MARKET SESSIONS CARD          ║
║                               ║
║  Pre-Open:                    ║
║  ┌──────────────────────────┐ ║
║  │ Bar [HOVER]              │ ║
║  └──────────────────────────┘ ║
║  ┌──────────────────────────┐ ║
║  │ Pre-Open Session         │ ║
║  │ OPENING SOON        9:00 │ ║
║  │ Opens:  9:00 AM IST      │ ║
║  │ Closes: 9:15 AM IST      │ ║
║  │ Opens In: 5m             │ ║
║  └──────────────────────────┘ ║
║          ↑                    ║
║  Tooltip below (constrained)  ║
║                               ║
║  NSE/BSE:                     ║
║  ┌──────────────────────────┐ ║
║  │ Bar                      │ ║
║  └──────────────────────────┘ ║
║                               ║
╚═══════════════════════════════╝
```

**Key Points**:
- ✅ Falls back to **below** on narrow screens
- ✅ Tooltip width adjusts to fit
- ✅ Constrained to card height
- ✅ Never escapes card

---

## Scenario 4: Forex Sessions

### Horizontal Timeline with Proper Containment
```
╔════════════════════════════════════════════════════════════╗
║ FOREX SESSIONS CARD                                        ║
║                                                            ║
║  12 AM  2   4   6   8   10  12 PM  2   4   6   8   10    ║
║  ─────────────────────────────────────────────────────────║
║                                                            ║
║  ┌──────────────┐ ┌──────────────────────┐               ║
║  │ SYDNEY       │ │ Sydney Session       │               ║
║  │ 8:23 AM local│ │ OPEN                 │               ║
║  └──────────────┘ │ Opens:  10:00 PM UTC │               ║
║                   │ Closes: 7:00 AM UTC  │               ║
║                   │ Closes In: 3h 15m    │               ║
║                   └──────────────────────┘               ║
║                                                            ║
║  ┌──────────┐                                             ║
║  │ TOKYO    │                                             ║
║  └──────────┘                                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

**Key Points**:
- ✅ Same horizontal-first logic
- ✅ Timezone info displayed correctly
- ✅ Card-constrained positioning
- ✅ Works for all 4 forex sessions

---

## Positioning Decision Flow

```
User hovers over session bar
         ↓
Calculate space: right, left, below, above
(All relative to CARD bounds, not viewport)
         ↓
┌────────────────────────────────────────┐
│ Enough space RIGHT? (>= 232px)         │
│ ├─ YES → Position to right ✓           │
│ └─ NO → Continue                       │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│ Enough space LEFT? (>= 232px)          │
│ ├─ YES → Position to left ✓            │
│ └─ NO → Continue                       │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│ Fallback: Position BELOW               │
│ - Check if fits within card height     │
│ - If not, try above (within card)      │
│ - Last resort: clip to card bounds ✓   │
└────────────────────────────────────────┘
         ↓
Apply final safety checks:
- Force within card bounds
- Minimum 16px from edges
- Never negative positions
         ↓
Tooltip positioned ✓
```

---

## Comparison: Before vs After

### BEFORE (Problem)
```
╔════════════════════════════════════╗
║ ┌────────────────────┐             ║ ← Tooltip escaped!
║ │ Tooltip (cut off!) │             ║
╠════════════════════════════════════╣
║ NAVBAR (overlaps tooltip) ❌       ║
╠════════════════════════════════════╣
║ MARKET CARD                        ║
║ ┌────────────┐                     ║
║ │ Bar        │                     ║
║ └────────────┘                     ║
╚════════════════════════════════════╝
```

### AFTER (Fixed)
```
╔════════════════════════════════════╗
║ NAVBAR (safe) ✓                    ║
╠════════════════════════════════════╣
║ MARKET CARD                        ║
║ ┌────────────┐ ┌──────────────┐   ║
║ │ Bar        │ │ Tooltip to → │   ║
║ └────────────┘ │ right        │   ║
║                └──────────────┘   ║
║ (Always contained) ✓               ║
╚════════════════════════════════════╝
```

---

## Space Requirements

### Minimum Space Needed

**For Right/Left Positioning**:
- Tooltip width: ~220px
- Gap: 12px
- **Total**: ~232px horizontal space

**For Below Positioning**:
- Tooltip height: ~110px
- Gap: 12px
- **Total**: ~122px vertical space

### Calculation Example
```javascript
const tw = 220; // Tooltip width
const gap = 12;  // Gap from bar
const minSpaceNeeded = tw + gap; // 232px

if (spaceRight >= minSpaceNeeded) {
  // Position to right ✓
}
```

---

## Mobile Behavior

### Portrait Mode (< 768px)
```
┌─────────────────────┐
│ Card                │
│ ┌─────────────────┐ │
│ │ Bar             │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Tooltip below   │ │
│ │ (no h-space)    │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### Landscape Mode (768px - 1024px)
```
┌───────────────────────────────┐
│ Card                          │
│ ┌────────┐ ┌────────────────┐│
│ │ Bar    │ │ Tooltip right  ││
│ └────────┘ └────────────────┘│
│ (horizontal space available)  │
└───────────────────────────────┘
```

---

## Edge Cases Handled

### 1. Very Narrow Card
```
┌────────┐
│ Card   │
│ ┌────┐ │
│ │Bar │ │
│ └────┘ │
│ ┌────┐ │
│ │Tip │ │ ← Clips to fit
│ └────┘ │
└────────┘
```

### 2. Very Short Card
```
┌──────────────────────┐
│ ┌──┐ ┌────────────┐ │
│ │B │ │ Tooltip    │ │ ← Vertical clip
│ └──┘ └────────────┘ │
└──────────────────────┘
```

### 3. Bar at Very Top
```
┌──────────────────────┐
│ ┌──┐ ┌────────────┐ │ ← Right position
│ │B │ │ Tooltip    │ │   (not above!)
│ └──┘ └────────────┘ │
└──────────────────────┘
```

---

## Summary

✅ **Default**: Right of bar (horizontal-first)  
✅ **Fallback 1**: Left of bar (smart flip)  
✅ **Fallback 2**: Below bar (narrow viewport)  
✅ **Constraint**: Always within card container  
✅ **Result**: No navbar overlap, professional UX  

The new positioning strategy makes perfect sense for horizontal timelines and ensures tooltips are always readable and properly contained!
