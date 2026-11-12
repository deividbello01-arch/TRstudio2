//+------------------------------------------------------------------+
//|                                    TRstudio_MT5_AutoExecutor.mq5 |
//|                        TRstudio Institutional Quantitative Suite |
//|                                         http://localhost:3000    |
//+------------------------------------------------------------------+
#property copyright "TRstudio Institutional Quantitative Suite"
#property link      "http://localhost:3000"
#property version   "3.00"
#property description "Sincronización bidireccional en tiempo real entre MetaTrader 5 y TRstudio Web."
#property description "Envía automáticamente Balance, Equidad, Margen Libre, Login y Servidor desde tu cuenta MT5."
#property description "Ejecuta órdenes Market/Limit, cierres parciales, Break Even y cierre total desde la web."

#include <Trade\Trade.mqh>

//--- Parámetros de Entrada del Expert Advisor
input string   InpServerUrl      = "http://localhost:3000"; // URL del Servidor Web TRstudio
input int      InpPollSeconds    = 1;                       // Intervalo de sincronización (segundos)
input ulong    InpMagicNumber    = 889900;                  // Magic Number institucional TRstudio
input ulong    InpSlippagePoints = 20;                      // Deslizamiento máximo permitido (puntos)
input bool     InpUseTP2AsMainTP = false;                   // false = Usar TP1 | true = Usar TP2

CTrade trade;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(InpSlippagePoints);
   trade.SetTypeFilling(ORDER_FILLING_IOC);
   trade.SetAsyncMode(false);

   EventSetTimer(MathMax(1, InpPollSeconds));
   SyncAccountTelemetryWithWeb();
   Print("=================================================================");
   Print("TRstudio_MT5_AutoExecutor v3.0 INICIADO");
   Print("Cuenta MT5 detectada: #", AccountInfoInteger(ACCOUNT_LOGIN), " | Balance: ", AccountInfoDouble(ACCOUNT_BALANCE), " ", AccountInfoString(ACCOUNT_CURRENCY));
   Print("Asegúrate de añadir ", InpServerUrl, " en Herramientas -> Opciones -> Asesores Expertos -> Permitir WebRequest");
   Print("=================================================================");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
  }

//+------------------------------------------------------------------+
//| Sincroniza Balance, Equidad, Margen y Cuenta hacia TRstudio Web  |
//+------------------------------------------------------------------+
void SyncAccountTelemetryWithWeb()
  {
   string syncUrl = InpServerUrl + "/api/mt5/ea-sync";
   long   loginId = AccountInfoInteger(ACCOUNT_LOGIN);
   long   lev     = AccountInfoInteger(ACCOUNT_LEVERAGE);
   double bal     = AccountInfoDouble(ACCOUNT_BALANCE);
   double eq      = AccountInfoDouble(ACCOUNT_EQUITY);
   double mar     = AccountInfoDouble(ACCOUNT_MARGIN);
   double freeMar = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   double fltPnl  = AccountInfoDouble(ACCOUNT_PROFIT);
   string srv     = AccountInfoString(ACCOUNT_SERVER);
   string name    = AccountInfoString(ACCOUNT_NAME);
   string ccy     = AccountInfoString(ACCOUNT_CURRENCY);

   string body = StringFormat(
      "{\"login\":\"%I64d\",\"brokerServer\":\"%s\",\"accountName\":\"%s\",\"currency\":\"%s\",\"leverage\":\"1:%I64d\",\"balance\":%.2f,\"equity\":%.2f,\"margin\":%.2f,\"freeMargin\":%.2f,\"floatingPnlUsd\":%.2f}",
      loginId, srv, name, ccy, lev, bal, eq, mar, freeMar, fltPnl
   );

   char post[];
   StringToCharArray(body, post, 0, StringLen(body), CP_UTF8);
   char res[];
   string resHeaders;
   string headers = "Content-Type: application/json\r\n";
   WebRequest("POST", syncUrl, headers, 1500, post, res, resHeaders);
  }

//+------------------------------------------------------------------+
//| Extrae el valor de una clave JSON simple                         |
//+------------------------------------------------------------------+
string ExtractJsonString(const string json, const string key)
  {
   string pattern = "\"" + key + "\":";
   int pos = StringFind(json, pattern);
   if(pos < 0) return "";
   int start = pos + StringLen(pattern);
   while(start < StringLen(json) && (StringGetCharacter(json, start) == ' ' || StringGetCharacter(json, start) == '\"'))
      start++;
   int end = start;
   while(end < StringLen(json))
     {
      ushort ch = StringGetCharacter(json, end);
      if(ch == '\"' || ch == ',' || ch == '}') break;
      end++;
     }
   return StringSubstr(json, start, end - start);
  }

//+------------------------------------------------------------------+
//| Normaliza el volumen al paso de lote del broker                  |
//+------------------------------------------------------------------+
double NormalizeLotsForSymbol(const string sym, double rawLots)
  {
   double minVol  = SymbolInfoDouble(sym, SYMBOL_VOLUME_MIN);
   double maxVol  = SymbolInfoDouble(sym, SYMBOL_VOLUME_MAX);
   double stepVol = SymbolInfoDouble(sym, SYMBOL_VOLUME_STEP);

   if(minVol <= 0) minVol = 0.01;
   if(maxVol <= 0) maxVol = 100.0;
   if(stepVol <= 0) stepVol = 0.01;

   double steps = MathFloor((rawLots + 1e-9) / stepVol);
   double norm  = steps * stepVol;
   if(norm < minVol) norm = minVol;
   if(norm > maxVol) norm = maxVol;
   return NormalizeDouble(norm, 2);
  }

//+------------------------------------------------------------------+
//| Timer function: Sincroniza Cuenta y Consulta Cola de Órdenes     |
//+------------------------------------------------------------------+
void OnTimer()
  {
   // 1) Enviar Balance y Equidad reales de la cuenta MT5 a la web
   SyncAccountTelemetryWithWeb();

   // 2) Consultar órdenes pendientes desde la web
   string url = InpServerUrl + "/api/mt5/ea-queue";
   char   postData[];
   char   result[];
   string resultHeaders;

   ResetLastError();
   int res = WebRequest("GET", url, "", 2000, postData, result, resultHeaders);
   if(res != 200) return;

   string payload = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
   if(StringFind(payload, "\"hasPending\":true") < 0)
      return;

   string orderId      = ExtractJsonString(payload, "id");
   string cmdType      = ExtractJsonString(payload, "cmdType");
   string targetTicket = ExtractJsonString(payload, "ticket");
   string brokerSymbol = ExtractJsonString(payload, "brokerSymbol");
   string asset        = ExtractJsonString(payload, "asset");
   string action       = ExtractJsonString(payload, "action");
   string orderType    = ExtractJsonString(payload, "orderType");
   double lots         = StringToDouble(ExtractJsonString(payload, "lots"));
   double entryPrice   = StringToDouble(ExtractJsonString(payload, "entryPrice"));
   double stopLoss     = StringToDouble(ExtractJsonString(payload, "stopLoss"));
   double tp1          = StringToDouble(ExtractJsonString(payload, "takeProfit1"));
   double tp2          = StringToDouble(ExtractJsonString(payload, "takeProfit2"));

   if(orderId == "") return;

   bool executed = false;
   ulong mt5Ticket = 0;

   // Comando de cierre total o individual desde la web
   if(cmdType == "CLOSE_ALL")
     {
      for(int i = PositionsTotal() - 1; i >= 0; i--)
        {
         ulong t = PositionGetTicket(i);
         if(t > 0) trade.PositionClose(t);
        }
      executed = true;
     }
   else if(cmdType == "CLOSE_TICKET")
     {
      ulong t = (ulong)StringToInteger(targetTicket);
      if(t > 0) executed = trade.PositionClose(t);
     }
   else if(cmdType == "MODIFY_SL_TP")
     {
      ulong t = (ulong)StringToInteger(targetTicket);
      if(t > 0 && PositionSelectByTicket(t))
        {
         string posSym = PositionGetString(POSITION_SYMBOL);
         int d = (int)SymbolInfoInteger(posSym, SYMBOL_DIGITS);
         double newSl = stopLoss > 0 ? NormalizeDouble(stopLoss, d) : PositionGetDouble(POSITION_SL);
         double newTp = tp1 > 0 ? NormalizeDouble(tp1, d) : PositionGetDouble(POSITION_TP);
         executed = trade.PositionModify(t, newSl, newTp);
        }
     }
   else
     {
      // Nueva orden Market o Limit
      string sym = brokerSymbol;
      if(!SymbolSelect(sym, true))
        {
         if(SymbolSelect(asset, true))
            sym = asset;
         else
            sym = _Symbol;
        }

      int digits = (int)SymbolInfoInteger(sym, SYMBOL_DIGITS);
      double normLots = NormalizeLotsForSymbol(sym, lots);
      double targetTp = InpUseTP2AsMainTP && tp2 > 0 ? tp2 : tp1;
      double normSL   = stopLoss > 0 ? NormalizeDouble(stopLoss, digits) : 0.0;
      double normTP   = targetTp > 0 ? NormalizeDouble(targetTp, digits) : 0.0;
      double normEntry= entryPrice > 0 ? NormalizeDouble(entryPrice, digits) : 0.0;
      string comment  = "TRstudio_" + asset + "_" + orderId;

      if(orderType == "LIMIT" && normEntry > 0)
        {
         if(action == "BUY")
            executed = trade.BuyLimit(normLots, normEntry, sym, normSL, normTP, ORDER_TIME_GTC, 0, comment);
         else
            executed = trade.SellLimit(normLots, normEntry, sym, normSL, normTP, ORDER_TIME_GTC, 0, comment);
        }
      else
        {
         double ask = SymbolInfoDouble(sym, SYMBOL_ASK);
         double bid = SymbolInfoDouble(sym, SYMBOL_BID);
         if(action == "BUY")
            executed = trade.Buy(normLots, sym, ask, normSL, normTP, comment);
         else
            executed = trade.Sell(normLots, sym, bid, normSL, normTP, comment);
        }

      mt5Ticket = trade.ResultOrder();
     }

   uint retcode = trade.ResultRetcode();

   // Confirmar ejecución al servidor TRstudio
   string ackUrl = InpServerUrl + "/api/mt5/ea-ack";
   string ackBody = StringFormat(
      "{\"id\":\"%s\",\"executed\":%s,\"mt5Ticket\":\"%I64u\",\"retcode\":%u}",
      orderId,
      executed ? "true" : "false",
      mt5Ticket,
      retcode
   );

   char ackPost[];
   StringToCharArray(ackBody, ackPost, 0, StringLen(ackBody), CP_UTF8);
   char ackRes[];
   string ackHeaders = "Content-Type: application/json\r\n";
   WebRequest("POST", ackUrl, ackHeaders, 2000, ackPost, ackRes, resultHeaders);
   SyncAccountTelemetryWithWeb();
  }
//+------------------------------------------------------------------+
