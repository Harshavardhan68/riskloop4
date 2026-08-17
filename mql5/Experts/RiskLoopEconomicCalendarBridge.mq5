//+------------------------------------------------------------------+
//|                                RiskLoopEconomicCalendarBridge.mq5 |
//|                             Copyright 2026, RiskLoop Platform    |
//|                                  https://github.com/RiskLoop     |
//+------------------------------------------------------------------+
#property copyright   "Copyright 2026, RiskLoop Platform"
#property link        "https://github.com/RiskLoop"
#property version     "1.01"
#property description "MetaTrader 5 MQL5 Economic Calendar Bridge for RiskLoop"
#property description "Streams real-time economic calendar event records (India/INR baseline)"
#property description "to the RiskLoop backend service via authenticated HTTP WebRequest."

//+------------------------------------------------------------------+
//| INPUT PARAMETERS                                                 |
//+------------------------------------------------------------------+
input group "=== RiskLoop Backend API Configuration ==="
input string   InpBackendURL            = "http://localhost:3000/api/economic-calendar/mt5"; // RiskLoop Ingestion Endpoint
input string   InpBridgeSecret          = "YOUR_MT5_BRIDGE_SECRET";                          // Bridge Secret Header (Match MT5_CALENDAR_BRIDGE_SECRET in .env)
input int      InpTimeoutMs             = 5000;                                              // HTTP Request Timeout (ms)

input group "=== Calendar Filter Configuration ==="
input string   InpCountryCode           = "IN";                                              // Filter Country Code (e.g. IN, US, EU, GB)
input string   InpCurrency              = "INR";                                             // Filter Currency (e.g. INR, USD, EUR, GBP)
input int      InpDaysBack              = 7;                                                 // Historical Window (Days back from now)
input int      InpDaysForward           = 14;                                                // Upcoming Window (Days forward from now)

input group "=== Synchronization & Polling ==="
input int      InpUpdateIntervalSeconds = 60;                                                // Polling Interval for live updates (Seconds)
input bool     InpVerboseLogging        = true;                                              // Verbose Journal Diagnostic Output

//+------------------------------------------------------------------+
//| GLOBAL STATE & TRACKING                                          |
//+------------------------------------------------------------------+
ulong    g_lastChangeId = 0;              // Tracking ID for CalendarValueLast incremental updates
datetime g_lastSyncTime = 0;              // Last synchronization timestamp
int      g_totalEventsSent = 0;           // Running count of successfully transmitted events
int      g_totalDuplicatesSkipped = 0;    // Running count of skipped duplicates

// Cache to prevent duplicate WebRequests: stores signature hash of sent records
string   g_sentSignatures[];

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   Print("🚀 RiskLoop Economic Calendar Bridge initialized");
   PrintFormat("📍 Target URL: %s", InpBackendURL);
   PrintFormat("🌐 Country Filter: %s | Currency Filter: %s", InpCountryCode, InpCurrency);
   PrintFormat("⏱️ Sync Window: -%d days to +%d days | Update Interval: %d sec", InpDaysBack, InpDaysForward, InpUpdateIntervalSeconds);
   Print("ℹ️ Note: MQL5 Calendar events use Trade-Server time, converted to ISO-8601 UTC.");
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

   // Set timer for periodic synchronization (minimum 10 seconds)
   EventSetTimer(MathMax(10, InpUpdateIntervalSeconds));

   // Perform initial full synchronization
   SynchronizeFullCalendar();

   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   PrintFormat("🛑 RiskLoop Economic Calendar Bridge stopped (Reason: %d). Total Sent: %d records.", reason, g_totalEventsSent);
}

//+------------------------------------------------------------------+
//| Expert timer function (Periodic Polling)                         |
//+------------------------------------------------------------------+
void OnTimer()
{
   SynchronizeIncrementalCalendar();
}

//+------------------------------------------------------------------+
//| Helper: Escape JSON string literals                              |
//+------------------------------------------------------------------+
string JsonEscape(const string text)
{
   string out = text;
   StringReplace(out, "\\", "\\\\");
   StringReplace(out, "\"", "\\\"");
   StringReplace(out, "\r", "\\r");
   StringReplace(out, "\n", "\\n");
   StringReplace(out, "\t", "\\t");
   return out;
}

//+------------------------------------------------------------------+
//| Helper: Convert Trade-Server datetime to ISO-8601 UTC String     |
//+------------------------------------------------------------------+
string DateTimeToISO8601(const datetime dt)
{
   MqlDateTime mdt;
   TimeToStruct(dt, mdt);

   return StringFormat("%04d-%02d-%02dT%02d:%02d:%02d.000Z",
                       mdt.year, mdt.mon, mdt.day,
                       mdt.hour, mdt.min, mdt.sec);
}

//+------------------------------------------------------------------+
//| Helper: Format Raw MQL5 Scaled Long Calendar Value               |
//| Raw values in MQL5 are scaled by 1,000,000.                      |
//| Missing/Unavailable values are represented by LONG_MIN.          |
//+------------------------------------------------------------------+
string FormatCalendarValue(const long rawValue, const uint digits, const ENUM_CALENDAR_EVENT_UNIT unit, const ENUM_CALENDAR_EVENT_MULTIPLIER multiplier)
{
   // In MQL5, unavailable or future unset values equal LONG_MIN (-9223372036854775808)
   if(rawValue == LONG_MIN || rawValue < -9000000000000000000LL)
   {
      return "—";
   }

   double scaled = (double)rawValue / 1000000.0;
   string numStr = DoubleToString(scaled, (int)MathMin(digits, 4));

   // Multipliers in MQL5: Thousands, Millions, Billions, Trillions
   switch(multiplier)
   {
      case CALENDAR_MULTIPLIER_THOUSANDS:
         numStr = numStr + "K";
         break;
      case CALENDAR_MULTIPLIER_MILLIONS:
         numStr = numStr + "M";
         break;
      case CALENDAR_MULTIPLIER_BILLIONS:
         numStr = numStr + "B";
         break;
      case CALENDAR_MULTIPLIER_TRILLIONS:
         numStr = numStr + "T";
         break;
      default:
         break;
   }

   // Unit suffix (Percent)
   if(unit == CALENDAR_UNIT_PERCENT)
   {
      numStr = numStr + "%";
   }

   return numStr;
}

//+------------------------------------------------------------------+
//| Helper: Map MQL5 Calendar Event Importance to Standard Schema    |
//+------------------------------------------------------------------+
string MapImportance(const ENUM_CALENDAR_EVENT_IMPORTANCE importance)
{
   switch(importance)
   {
      case CALENDAR_IMPORTANCE_HIGH:
         return "high";
      case CALENDAR_IMPORTANCE_MODERATE:
         return "medium";
      case CALENDAR_IMPORTANCE_LOW:
         return "low";
      case CALENDAR_IMPORTANCE_NONE:
      default:
         return "none";
   }
}

//+------------------------------------------------------------------+
//| Helper: Check & record signature to avoid duplicate transmissions |
//+------------------------------------------------------------------+
bool IsDuplicateRecord(const string signature)
{
   int size = ArraySize(g_sentSignatures);
   for(int i = 0; i < size; i++)
   {
      if(g_sentSignatures[i] == signature)
         return true;
   }

   // Register new signature
   ArrayResize(g_sentSignatures, size + 1);
   g_sentSignatures[size] = signature;
   return false;
}

//+------------------------------------------------------------------+
//| Transmit JSON Payload to RiskLoop Backend via WebRequest         |
//+------------------------------------------------------------------+
bool SendJsonToRiskLoop(const string jsonPayload, const int recordCount)
{
   char postData[];
   char resultData[];
   string resultHeaders;
   int responseCode = 0;

   // Convert JSON string to UTF-8 char array
   StringToCharArray(jsonPayload, postData, 0, WHOLE_ARRAY, CP_UTF8);
   int dataSize = ArraySize(postData);
   if(dataSize > 0 && postData[dataSize - 1] == '\0')
      ArrayResize(postData, dataSize - 1); // remove null terminator for HTTP POST body

   // Build HTTP Request Headers with bridge secret
   string headers = "Content-Type: application/json\r\n" +
                    "x-mt5-bridge-secret: " + InpBridgeSecret + "\r\n" +
                    "User-Agent: RiskLoop-MT5-Bridge/1.0\r\n";

   ResetLastError();
   responseCode = WebRequest("POST",
                             InpBackendURL,
                             headers,
                             InpTimeoutMs,
                             postData,
                             resultData,
                             resultHeaders);

   if(responseCode == -1)
   {
      int err = GetLastError();
      PrintFormat("❌ [RiskLoopBridge] WebRequest failed. Error Code: %d", err);
      if(err == 4060) // ERR_FUNCTION_NOT_ALLOWED
      {
         Print("⚠️ Permission Error 4060: WebRequest is not allowed for this URL.");
         PrintFormat("👉 Solution: In MT5, open Tools -> Options -> Expert Advisors, check 'Allow WebRequest for listed URL', and add: '%s'", InpBackendURL);
      }
      return false;
   }

   string responseText = CharArrayToString(resultData, 0, WHOLE_ARRAY, CP_UTF8);

   if(responseCode >= 200 && responseCode < 300)
   {
      g_totalEventsSent += recordCount;
      if(InpVerboseLogging)
      {
         PrintFormat("✅ [RiskLoopBridge] Successfully pushed %d India/INR event(s) to RiskLoop (HTTP %d). Total Sent: %d",
                     recordCount, responseCode, g_totalEventsSent);
      }
      return true;
   }
   else
   {
      PrintFormat("⚠️ [RiskLoopBridge] Server responded with HTTP %d: %s", responseCode, responseText);
      return false;
   }
}

//+------------------------------------------------------------------+
//| Build JSON Array from Array of MqlCalendarValue records          |
//+------------------------------------------------------------------+
string BuildEventsJson(const MqlCalendarValue &values[], int &outUniqueCount, int &outSkippedCount)
{
   string json = "{\"events\":[";
   int total = ArraySize(values);
   outUniqueCount = 0;
   outSkippedCount = 0;

   bool first = true;

   for(int i = 0; i < total; i++)
   {
      MqlCalendarValue val = values[i];
      MqlCalendarEvent eventMeta;
      MqlCalendarCountry countryMeta;

      // Resolve event metadata
      if(!CalendarEventById(val.event_id, eventMeta))
      {
         continue;
      }

      // Resolve country metadata
      if(!CalendarCountryById(eventMeta.country_id, countryMeta))
      {
         countryMeta.name = "India";
         countryMeta.code = "IN";
         countryMeta.currency = "INR";
      }

      // Filter check (India / INR baseline)
      if(StringLen(InpCountryCode) > 0 && StringCompare(countryMeta.code, InpCountryCode, false) != 0)
         continue;

      if(StringLen(InpCurrency) > 0 && StringCompare(countryMeta.currency, InpCurrency, false) != 0)
         continue;

      // Construct a unique record signature for deduplication
      string signature = IntegerToString(val.id) + "_" +
                         IntegerToString(val.actual_value) + "_" +
                         IntegerToString(val.forecast_value) + "_" +
                         IntegerToString(val.prev_value) + "_" +
                         IntegerToString(val.revision);

      if(IsDuplicateRecord(signature))
      {
         outSkippedCount++;
         continue;
      }

      // Extract formatted numerical values using digits, unit, and multiplier
      string actualStr   = FormatCalendarValue(val.actual_value, eventMeta.digits, eventMeta.unit, eventMeta.multiplier);
      string forecastStr = FormatCalendarValue(val.forecast_value, eventMeta.digits, eventMeta.unit, eventMeta.multiplier);
      string prevStr     = FormatCalendarValue(val.prev_value, eventMeta.digits, eventMeta.unit, eventMeta.multiplier);
      string revPrevStr  = FormatCalendarValue(val.revised_prev_value, eventMeta.digits, eventMeta.unit, eventMeta.multiplier);
      string isoTime     = DateTimeToISO8601(val.time);
      string impactStr   = MapImportance(eventMeta.importance);
      string eventCode   = StringLen(eventMeta.event_code) > 0 ? eventMeta.event_code : ("EV_" + IntegerToString(eventMeta.id));
      string uniqueId    = "MT5_" + countryMeta.code + "_" + IntegerToString(eventMeta.id) + "_" + IntegerToString((long)val.time);

      if(!first)
         json += ",";

      json += "{";
      json += "\"id\":\"" + JsonEscape(uniqueId) + "\",";
      json += "\"country\":\"" + JsonEscape(countryMeta.name) + "\",";
      json += "\"countryCode\":\"" + JsonEscape(countryMeta.code) + "\",";
      json += "\"currency\":\"" + JsonEscape(countryMeta.currency) + "\",";
      json += "\"event\":\"" + JsonEscape(eventMeta.name) + "\",";
      json += "\"eventCode\":\"" + JsonEscape(eventCode) + "\",";
      json += "\"eventTime\":\"" + JsonEscape(isoTime) + "\",";
      json += "\"impact\":\"" + JsonEscape(impactStr) + "\",";
      json += "\"actual\":\"" + JsonEscape(actualStr) + "\",";
      json += "\"forecast\":\"" + JsonEscape(forecastStr) + "\",";
      json += "\"previous\":\"" + JsonEscape(prevStr) + "\",";
      json += "\"revisedPrevious\":\"" + JsonEscape(revPrevStr) + "\",";
      json += "\"source\":\"MetaTrader 5 MQL5 Calendar\"";
      json += "}";

      first = false;
      outUniqueCount++;
   }

   json += "]}";
   return json;
}

//+------------------------------------------------------------------+
//| Full Calendar Synchronization (Historical & Upcoming Window)     |
//+------------------------------------------------------------------+
void SynchronizeFullCalendar()
{
   datetime now = TimeCurrent();
   datetime dateFrom = now - (InpDaysBack * 86400);
   datetime dateTo   = now + (InpDaysForward * 86400);

   if(InpVerboseLogging)
   {
      PrintFormat("🔍 [RiskLoopBridge] Querying MQL5 Calendar for country '%s' from %s to %s...",
                  InpCountryCode, TimeToString(dateFrom, TIME_DATE), TimeToString(dateTo, TIME_DATE));
   }

   MqlCalendarValue values[];
   ResetLastError();

   // Query historical and upcoming calendar values for filtered country
   int count = CalendarValueHistory(values, dateFrom, dateTo, InpCountryCode, InpCurrency);

   if(count < 0)
   {
      int err = GetLastError();
      PrintFormat("❌ [RiskLoopBridge] CalendarValueHistory failed. Error: %d. (Ensure MT5 Calendar is enabled for country '%s')",
                  err, InpCountryCode);
      return;
   }

   if(InpVerboseLogging)
   {
      PrintFormat("📋 [RiskLoopBridge] Found %d raw India/INR calendar record(s) in window.", count);
   }

   if(count == 0)
      return;

   int uniqueCount = 0;
   int skippedCount = 0;
   string jsonPayload = BuildEventsJson(values, uniqueCount, skippedCount);

   g_totalDuplicatesSkipped += skippedCount;

   if(uniqueCount > 0)
   {
      SendJsonToRiskLoop(jsonPayload, uniqueCount);
   }
   else if(skippedCount > 0 && InpVerboseLogging)
   {
      PrintFormat("ℹ️ [RiskLoopBridge] %d record(s) skipped (already synced).", skippedCount);
   }

   g_lastSyncTime = now;
}

//+------------------------------------------------------------------+
//| Incremental Calendar Synchronization (Polls Recent Changes)      |
//+------------------------------------------------------------------+
void SynchronizeIncrementalCalendar()
{
   MqlCalendarValue values[];
   ResetLastError();

   // Poll recent changes using CalendarValueLast
   int count = CalendarValueLast(g_lastChangeId, values, InpCountryCode, InpCurrency);

   if(count < 0)
   {
      // Fallback to full sync if incremental poll encounters error
      SynchronizeFullCalendar();
      return;
   }

   if(count == 0)
   {
      // No updates
      return;
   }

   int uniqueCount = 0;
   int skippedCount = 0;
   string jsonPayload = BuildEventsJson(values, uniqueCount, skippedCount);

   g_totalDuplicatesSkipped += skippedCount;

   if(uniqueCount > 0)
   {
      SendJsonToRiskLoop(jsonPayload, uniqueCount);
   }
}
//+------------------------------------------------------------------+
