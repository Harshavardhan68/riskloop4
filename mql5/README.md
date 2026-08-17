# RiskLoop — MetaTrader 5 (MQL5) Economic Calendar Bridge

This folder contains the standalone MetaTrader 5 Expert Advisor (**EA**) that streams live economic calendar events from MetaTrader 5 directly into the RiskLoop backend service.

---

## 📁 Files

* [`Experts/RiskLoopEconomicCalendarBridge.mq5`](./Experts/RiskLoopEconomicCalendarBridge.mq5): Standalone MQL5 Expert Advisor source code.

---

## ⚙️ Installation & Setup in MetaTrader 5

### 1. Copy the EA File
1. Open **MetaTrader 5**.
2. Click **File** $\rightarrow$ **Open Data Folder**.
3. Navigate to `MQL5/Experts/`.
4. Copy `RiskLoopEconomicCalendarBridge.mq5` into `MQL5/Experts/`.
5. Open the **MetaEditor** (press `F4`), open `RiskLoopEconomicCalendarBridge.mq5`, and click **Compile** (`F7`).

### 2. Enable WebRequest Permissions
MetaTrader 5 requires explicit permission for Expert Advisors to make external HTTP requests:
1. In MT5, open **Tools** $\rightarrow$ **Options** (or press `Ctrl + O`).
2. Go to the **Expert Advisors** tab.
3. Check the box: **Allow WebRequest for listed URL**.
4. Click the green `+` icon and add:
   ```
   http://localhost:3000
   ```
   *(If deploying RiskLoop on a remote VPS or server, enter your remote domain or IP instead, e.g. `https://api.yourdomain.com`)*.
5. Click **OK**.

### 3. Attach EA to Any Chart
1. In the MT5 Navigator window (`Ctrl + N`), expand **Expert Advisors**.
2. Drag **`RiskLoopEconomicCalendarBridge`** onto any open chart (e.g. `USDINR` or `EURUSD`).
3. Under the **Inputs** tab, verify or customize:
   * **`InpBackendURL`**: `http://localhost:3000/api/economic-calendar/mt5`
   * **`InpBridgeSecret`**: Your configured bridge secret matching `MT5_CALENDAR_BRIDGE_SECRET` in `backend/.env`
   * **`InpCountryCode`**: `IN` *(default: India)*
   * **`InpCurrency`**: `INR` *(default: Indian Rupee)*
   * **`InpDaysBack`**: `7` *(lookback window)*
   * **`InpDaysForward`**: `14` *(upcoming events window)*
   * **`InpUpdateIntervalSeconds`**: `60` *(polling interval)*
4. Click **OK**.

---

## 📡 Transmission & Data Format

The EA queries MQL5 functions (`CalendarValueHistory` & `CalendarValueLast`) and sends normalized JSON records to `POST /api/economic-calendar/mt5` with the `x-mt5-bridge-secret` authentication header.

```json
{
  "events": [
    {
      "id": "MT5_IN_1201010001_1787123400",
      "country": "India",
      "countryCode": "IN",
      "currency": "INR",
      "event": "RBI Interest Rate Decision",
      "eventCode": "IN_RBI_REPO",
      "eventTime": "2026-08-18T06:30:00.000Z",
      "impact": "high",
      "actual": "—",
      "forecast": "6.50%",
      "previous": "6.50%",
      "revisedPrevious": "—",
      "source": "MetaTrader 5 MQL5 Calendar"
    }
  ]
}
```
