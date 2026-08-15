# Broker Logos Setup Guide

## Overview
The Connect Broker modal now displays 17 brokers with official logo support.

## Broker List

### Indian Brokers (8)
1. **FYERS** - `logos/fyers.png`
2. **Angel One** - `logos/angel-one.png`
3. **Dhan** - `logos/dhan.png`
4. **Upstox** - `logos/upstox.png`
5. **Shoonya** - `logos/shoonya.png`
6. **Alice Blue** - `logos/alice-blue.png`
7. **Kotak Neo** - `logos/kotak-neo.png`
8. **SAMCO** - `logos/samco.png`

### MetaTrader 5 Platform
9. **MetaTrader 5** - `logos/mt5.png`

### MetaTrader 5 Supported Brokers (8)
10. **IC Markets** - `logos/ic-markets.png`
11. **Pepperstone** - `logos/pepperstone.png`
12. **FP Markets** - `logos/fp-markets.png`
13. **XM** - `logos/xm.png`
14. **FXTM** - `logos/fxtm.png`
15. **Vantage** - `logos/vantage.png`
16. **Exness** - `logos/exness.png`
17. **Fusion Markets** - `logos/fusion-markets.png`

---

## Setup Instructions

### Step 1: Create Logos Directory

Create a `logos` folder in your project root:

```
riskloop2-main/
├── index.html
├── script.js
├── styles.css
└── logos/          ← Create this folder
    ├── fyers.png
    ├── angel-one.png
    ├── dhan.png
    └── ...
```

### Step 2: Download Official Logos

For each broker, download their official logo:

#### Where to Find Logos:

1. **Broker Websites** - Visit the official website (e.g., fyers.in, angelone.in)
   - Look for "Brand Assets" or "Press Kit" pages
   - Download logo files (PNG or SVG preferred)

2. **Google Image Search**
   - Search: "[Broker Name] official logo PNG"
   - Use "Tools" → "Size" → "Large" for better quality
   - Right-click and save image

3. **Brand Asset Pages** (if available)
   - FYERS: https://fyers.in/
   - Angel One: https://www.angelone.in/
   - Dhan: https://dhan.co/
   - Upstox: https://upstox.com/
   - IC Markets: https://www.icmarkets.com/
   - Pepperstone: https://pepperstone.com/
   - FP Markets: https://www.fpmarkets.com/
   - XM: https://www.xm.com/
   - FXTM: https://www.forextime.com/
   - Vantage: https://www.vantagemarkets.com/
   - Exness: https://www.exness.com/
   - Fusion Markets: https://www.fusionmarkets.com/

### Step 3: Prepare Logo Images

**Recommended Specifications:**
- **Format:** PNG with transparent background (or SVG)
- **Size:** 200x200 pixels minimum (will be displayed at 40x40)
- **Aspect Ratio:** Square (1:1) preferred
- **Background:** Transparent or white

**File Naming:**
- Use lowercase with hyphens
- Match the file names exactly as shown in the broker list above
- Examples: `fyers.png`, `angel-one.png`, `kotak-neo.png`

### Step 4: Add Logos to Project

1. Save each logo file in the `logos/` folder
2. Name them exactly as specified in the list above
3. Make sure file extensions match (.png, .svg, or .jpg)

### Step 5: Update Logo Paths (if needed)

If you use different file formats or paths, update `script.js`:

```javascript
const BROKERS = [
  { id: 'fyers', name: 'FYERS', logo: 'logos/fyers.svg' },  // Change .png to .svg
  { id: 'angel-one', name: 'Angel One', logo: 'logos/angel-one.jpg' },  // or .jpg
  // ...
];
```

---

## Fallback Behavior

If a logo image fails to load:
- The card will show the first letter of the broker name
- Example: "F" for FYERS, "A" for Angel One
- Styled with bold font to match the design

---

## Testing

After adding logos:

1. Open http://localhost:8000/
2. Navigate to Journal page
3. Click "Connect Broker"
4. Verify all broker logos display correctly
5. Check browser console (F12) for any image loading errors

---

## Logo Display Specifications

- **Container:** 40x40 pixels with rounded corners
- **Padding:** 4px inside container
- **Fit:** Object-fit contain (maintains aspect ratio)
- **Border:** 1.5px solid border matching theme
- **Background:** Dark surface color

---

## Alternative: Using CDN or External URLs

If logos are hosted online, you can use direct URLs:

```javascript
const BROKERS = [
  { 
    id: 'fyers', 
    name: 'FYERS', 
    logo: 'https://example.com/logos/fyers.png' 
  },
  // ...
];
```

---

## Need Help?

- Check browser console for 404 errors on missing images
- Verify file names match exactly (case-sensitive on some systems)
- Ensure logos folder is in the correct location
- Test with one broker first before adding all logos

---

## Current Status

✅ Code updated to support logo images  
✅ Broker list updated with correct names  
✅ CSS styling ready for images  
✅ Fallback system in place  
⏳ Logo image files need to be added by user  
