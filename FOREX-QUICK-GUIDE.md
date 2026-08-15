# Forex Sessions Timeline - Quick User Guide

## What You'll See

The Forex Sessions timeline now displays as a classic **24-hour horizontal chart** showing when the four major forex trading sessions are open:

- **Sydney** (Australia)
- **Tokyo** (Japan)  
- **London** (United Kingdom)
- **New York** (United States)

## Key Features

### 1. Session Bars
Each session appears as a horizontal bar showing:
- **City name** on the left
- **Current local time** for that city on the right (e.g., "10:55 AM local")
- **Color indicates status**:
  - 🟢 **Green** = Session is OPEN
  - ⚫ **Gray** = Session is CLOSED
  - 🟡 **Amber** = Opening within 15 minutes

### 2. Current Time Indicator
A **gold vertical line** shows where you are in the 24-hour cycle:
- Moves in real-time
- Crosses all session rows
- Helps you see which sessions are currently active

### 3. Hour Markers
The top of the timeline shows hours:
- **12 AM, 2, 4, 6, 8, 10, 12 PM, 2, 4, 6, 8, 10, 12 AM**
- These adjust based on your selected timezone

### 4. Timezone Selector
Click the timezone dropdown (top right) to:
- View the timeline in different timezones
- Search for specific cities/regions
- See how session times appear in your local time

### 5. Session Overlaps
The timeline accurately shows when sessions overlap:
- **Sydney ↔ Tokyo**: 7-hour overlap (early morning UTC)
- **Tokyo ↔ London**: 1-hour overlap (morning UTC)
- **London ↔ New York**: 4-hour overlap (afternoon UTC) - **Most active trading period!**

## How to Use

### See Current Market Activity
- Look at the **gold vertical line** - this is "now"
- Any **green bar** touching the line = that session is currently open
- The **overlap areas** show when multiple markets are trading simultaneously

### Check Session Times
- **Hover over any bar** to see:
  - Session open/close times
  - Status (Open/Closed/Opening Soon)
  - Countdown to next status change

### Change Your Timezone
1. Click the timezone selector (e.g., "UTC ▼")
2. Search or scroll to find your timezone
3. Click to select
4. The hour markers update, but session bars stay in their correct positions

### See Local Times
Each bar automatically shows the current time in that city:
- Sydney shows Australian Eastern time
- Tokyo shows Japan Standard Time
- London shows British time (GMT/BST)
- New York shows Eastern Time (EST/EDT)

**Updates every 10 seconds** so you always see current times!

## Understanding DST (Daylight Saving Time)

The timeline **automatically handles DST**:
- Session times adjust when cities enter/exit DST
- No manual updates needed
- Times are always accurate for each city's current rules

## Best Times to Trade

Based on overlap visibility:

### High Liquidity Periods
1. **London/New York Overlap** (13:00-17:00 UTC)
   - Largest overlap (4 hours)
   - Highest trading volume
   - Major EUR/USD, GBP/USD activity

2. **Sydney/Tokyo Overlap** (00:00-07:00 UTC)
   - Asian session activity
   - AUD/JPY, NZD/JPY pairs active

3. **Tokyo/London Overlap** (08:00-09:00 UTC)
   - Brief but important
   - EUR/JPY, GBP/JPY moves

### Lower Activity Periods
- After New York closes (22:00-00:00 UTC)
- Before Sydney opens (07:00-22:00 UTC single sessions)
- Gray bars = lower liquidity

## Tips

✅ **DO:**
- Use overlaps for maximum liquidity
- Check local times to coordinate with economic news releases
- Use the timezone selector to plan trades in your local time
- Watch the current time indicator for real-time awareness

❌ **DON'T:**
- Trade during completely gray periods (all sessions closed)
- Forget about DST transitions (but the chart handles this!)
- Ignore overlap periods - that's when spreads are tightest

## Keyboard Shortcuts

- **Click** bar → Show session details
- **Hover** bar → Quick info tooltip
- **Scroll** horizontally on mobile if needed
- **Esc** → Close timezone dropdown

## Mobile Usage

On smaller screens:
- **Swipe left/right** to see the full 24-hour timeline
- Bars are slightly smaller but still readable
- Tap any bar to see details
- Timezone selector works the same way

## Troubleshooting

**Q: Why do session times look different than expected?**  
A: You may be viewing in a different timezone. Click the timezone selector and choose your location.

**Q: Why does London overlap the entire Tokyo session?**  
A: It doesn't! The new design shows accurate overlaps. London only overlaps Tokyo by 1 hour (08:00-09:00 UTC).

**Q: Local times not updating?**  
A: They update every 10 seconds. If still not working, refresh the page.

**Q: Current time line not moving?**  
A: It updates every second. Make sure you're on the Market page and the page is active.

## Technical Details

- **Session times**: Based on actual forex market hours (UTC)
- **Local time format**: Uses your browser's timezone database
- **Update frequency**: 
  - Clock: Every 1 second
  - Local times: Every 10 seconds
  - Session status: Every minute
- **Timezone support**: 100+ timezones via browser Intl API

## Need Help?

If you encounter any issues:
1. Try refreshing the page
2. Clear browser cache
3. Ensure JavaScript is enabled
4. Check browser console for errors

---

**Pro Tip**: Bookmark this page with `#market` in the URL to jump straight to the Market view!

Example: `file:///path/to/index.html#market`
