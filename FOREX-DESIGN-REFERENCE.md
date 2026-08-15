# Forex Sessions Timeline - Design Reference

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Forex Sessions                            [Clock: 14:23:45] [▼ UTC]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  12 AM  2   4   6   8   10  12 PM  2   4   6   8   10  12 AM       │
│  ─┴────┴───┴───┴───┴───┴───┴────┴───┴───┴───┴───┴───┴───┴─         │
│                                                                       │
│  ║                                                                    │
│  ║ ┌──────────────────────────────┐                                 │
│  ║ │ SYDNEY        8:23 AM local  │                                 │
│  ║ └──────────────────────────────┘                                 │
│  ║                                                                    │
│  ║ ┌──────────────┐                                                 │
│  ║ │ TOKYO   6:23 AM local │                                        │
│  ║ └──────────────┘                                                 │
│  ║                                                                    │
│  ║         ┌──────────────┐                                         │
│  ║         │ LONDON  9:23 AM local │                                │
│  ║         └──────────────┘                                         │
│  ║                                                                    │
│  ║                  ┌──────────────┐                                │
│  ║                  │ NEW YORK  4:23 AM local │                     │
│  ║                  └──────────────┘                                │
│  ║                                                                    │
│  ↓ Current Time (gold vertical line)                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Session Overlaps (UTC Times)

### Sydney (22:00 - 07:00 UTC) 🟢
- Crosses midnight
- Overlaps with Tokyo: 00:00-07:00 (7 hours)

### Tokyo (00:00 - 09:00 UTC) 🟢
- Overlaps with Sydney: 00:00-07:00 (7 hours)
- Overlaps with London: 08:00-09:00 (1 hour)

### London (08:00 - 17:00 UTC) 🟢
- Small overlap with Tokyo: 08:00-09:00 (1 hour)
- Largest overlap with New York: 13:00-17:00 (4 hours)

### New York (13:00 - 22:00 UTC) 🟢
- Overlaps with London: 13:00-17:00 (4 hours)

## Color Legend

| Status | Color | Usage |
|--------|-------|-------|
| **Open** | Green `#48B79A` | All open sessions use this green |
| **Closed** | Gray `rgba(107,114,128,0.35)` | Inactive/closed sessions |
| **Opening Soon** | Amber `#F59E0B` | Sessions opening within 15 minutes |
| **Current Time** | Gold (accent) | The vertical indicator line |

## Bar Components

Each session bar displays:

```
┌─────────────────────────────────────────┐
│ CITY NAME                 TIME local    │
└─────────────────────────────────────────┘
 ↑                          ↑
 Left side                  Right side
 (City name)                (Local time)
```

### Left Side (City Name)
- Font: 11px, bold, uppercase
- Color: White with 95% opacity (open) or 45% opacity (closed)
- Position: Left-aligned with 12px padding

### Right Side (Local Time)
- Font: 10px, monospace
- Format: "10:55 AM local"
- Updates every 10 seconds
- Shows actual city timezone (DST aware)

## Current Time Indicator

```
     ⬤  ← Dot (10px, gold, glowing)
     ║
     ║  ← Vertical line (2px, gold)
     ║
     ║
     ║
    (Crosses all session rows)
```

- **Position**: Calculated based on current time in selected timezone
- **Color**: Accent gold (`var(--accent)`)
- **Effects**: Glow shadow, smooth transitions
- **Updates**: Real-time (every second for position)

## Hover Tooltip

When hovering over a session bar:

```
┌──────────────────────────┐
│ Tokyo Session    [OPEN]  │
├──────────────────────────┤
│ Opens:    12:00 AM       │
│ Closes:   9:00 AM        │
│ Closes In: 2h 37m        │
└──────────────────────────┘
```

- Shows session name and status badge
- Displays open/close times in selected timezone
- Shows countdown to next status change
- Positioned near cursor with smart bounds checking

## Timezone Selector

```
┌─────────────────┐
│ [UTC ▼]        │  ← Button
└─────────────────┘
        │
        ▼
┌─────────────────────────┐
│ Search...               │
├─────────────────────────┤
│ COMMON                  │
│  UTC           +00:00   │
│  New York      -05:00   │
│  London        +00:00   │
│                         │
│ ASIA/PACIFIC            │
│  Tokyo         +09:00   │
│  Sydney        +11:00   │
│  ...                    │
└─────────────────────────┘
```

- Dropdown with searchable timezone list
- Grouped by region
- Shows UTC offset
- Active timezone highlighted
- Changes axis labels when selected
- Session bars remain in UTC positions

## Responsive Behavior

### Desktop (>768px)
- Full width timeline
- 36px tall bars
- All labels visible
- No horizontal scroll (fits most screens)

### Tablet (480-768px)
- 32px tall bars
- Horizontal scroll if needed
- Smaller fonts (10px city, 9px time)

### Mobile (<480px)
- 28px tall bars
- Horizontal scroll enabled
- Smaller fonts (9px city, 8px time)
- Touch-friendly interactions

## Spacing & Dimensions

| Element | Size | Notes |
|---------|------|-------|
| **Bar Height** | 36px (desktop) | Reduced on mobile |
| **Bar Padding** | 12px horizontal | Inner spacing |
| **Bar Gap** | 2px | Vertical space between sessions |
| **Border Radius** | 4px | Slightly rounded corners |
| **Axis Height** | 28px | Top timeline area |
| **Needle Width** | 2px | Current time line |
| **Grid Opacity** | 0.3 | Vertical hour lines |

## Animation & Transitions

1. **Bar Status Changes**: 0.3s ease
2. **Needle Movement**: 0.6s ease
3. **Tooltip Appearance**: 0.15s ease with slide-up
4. **Hover Effects**: 0.2s brightness filter
5. **Timezone Dropdown**: 0.2s chevron rotation

## Typography

- **City Names**: Inter, 11px, bold, uppercase, letter-spacing 0.02em
- **Local Times**: IBM Plex Mono, 10px, semibold
- **Hour Markers**: IBM Plex Mono, 11px, semibold
- **Tooltip**: Inter + Space Grotesk for headers

## Accessibility Features

- ✅ ARIA labels on timezone selector
- ✅ Keyboard navigation support
- ✅ Focus visible indicators
- ✅ Touch-friendly tap targets (minimum 44px)
- ✅ Color contrast meets WCAG AA standards
- ✅ Screen reader friendly labels

## Implementation Notes

### CSS Variables Used
- `--surface`: Card background
- `--border`: Grid lines and separators
- `--text`: Primary text color
- `--text-muted`: Secondary text color
- `--accent`: Current time indicator and highlights
- `--clay-raised`: Card elevation shadow

### JavaScript Functions
- `getSessionLocalTime()`: Returns formatted local time for each city
- `convertToTimezone()`: Converts UTC minutes to selected timezone
- `getStatus()`: Determines if session is open/closed/soon
- `update()`: Updates bar colors and local times
- `buildStatic()`: Creates initial DOM structure

### Browser APIs Used
- `Intl.DateTimeFormat`: For timezone-aware time formatting
- `Date.getUTCHours()`: For current UTC time
- `setInterval()`: For real-time updates
- `getBoundingClientRect()`: For tooltip positioning

---

**Design System**: Claymorphism (soft, puffy surfaces with dual shadows)
**Color Philosophy**: Single green for active, gray for inactive, gold for current time
**Layout Philosophy**: Classic forex chart, industry-standard appearance
