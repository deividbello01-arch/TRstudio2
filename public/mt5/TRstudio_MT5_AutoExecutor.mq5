//+------------------------------------------------------------------+
//|                                    TRstudio_MT5_AutoExecutor.mq5 |
//|                        TRstudio Institutional Quantitative Suite |
//|                                         http://localhost:3000    |
//+------------------------------------------------------------------+
#property copyright "TRstudio Institutional Quantitative Suite"
#property link      "http://localhost:3000"
#property version   "2.50"
#property description "Puente Oficial de Auto-Ejecución en 1 Clic entre TRstudio Web y MetaTrader 5 Desktop."
#property description "Recibe el Índice/Activo mapeado al broker, Lotaje Exacto, Entrada, Stop Loss y Take Profits."
#property description "IMPORTANTE: En MT5 ve a Herramientas -> Opciones -> Asesores Expertos -> Activa 'Permitir WebRequest' y añade: http://localhost:3000"

#include <Trade\Trade.mqh>

//--- Parámetros de Entrada del Expert Advisor
input string   InpServerUrl      = "http://localhost:3000"; // URL del Servidor Web TRstudio
input int      InpPollSeconds    = 1;                       // Intervalo de sincronización (segundos)
input ulong    InpMagicNumber    = 889900;                  // Magic Number institucional TRstudio
input ulong    InpSlippagePoints = 20;                      // Deslizamiento máximo permitido (puntos)
input bool     InpUseTP2AsMainTP = false;                   // false = Usar TP1 (1:1.8) | true = Usar TP2 (1:3.0)

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
   Print("=================================================================");
   Print("🚀 TRstudio_MT5_AutoExecutor INICIADO CORRECTAMENTE");
   Print("🔗 Conectado a cola de órdenes: ", InpServerUrl, "/api/mt5/ea-queue");
   Print("💡 Asegúrate de añadir ", InpServerUrl, " en Herramientas -> Opciones -> Asesores Expertos -> Permitir WebRequest");
   Print("=================================================================");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   Print("TRstudio_MT5_AutoExecutor finalizado.");
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
//| Timer function: Consulta la cola de órdenes de TRstudio          |
//+------------------------------------------------------------------+
void OnTimer()
  {
   string url = InpServerUrl + "/api/mt5/ea-queue";
   char   postData[];
   char   result[];
   string resultHeaders;

   ResetLastError();
   int res = WebRequest("GET", url, "", 2500, postData, result, resultHeaders);
   if(res != 200)
     {
      if(GetLastError() == 4014)
        {
         Print("⚠️ ERROR 4014: Habilita WebRequest hacia ", InpServerUrl, " en Herramientas -> Opciones -> Asesores Expertos");
        }
      return;
     }

   string payload = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
   if(StringFind(payload, "\"hasPending\":true") < 0)
      return;

   string orderId      = ExtractJsonString(payload, "id");
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

   // Seleccionar símbolo en MarketWatch del Broker
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

   bool executed = false;
   string comment = "TRstudio_" + asset + "_" + orderId;

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

   ulong mt5Ticket = trade.ResultOrder();
   uint  retcode   = trade.ResultRetcode();

   // Confirmar ejecución al servidor TRstudio
   string ackUrl = InpServerUrl + "/api/mt5/ea-ack";
   string ackBody = StringFormat(
      "{\"id\":\"%s\",\"executed\":%s,\"mt5Ticket\":\"%I64u\",\"retcode\":%u,\"symbol\":\"%s\",\"lots\":%.2f}",
      orderId,
      executed ? "true" : "false",
      mt5Ticket,
      retcode,
      sym,
      normLots
   );

   char ackPost[];
   StringToCharArray(ackBody, ackPost, 0, StringLen(ackBody), CP_UTF8);
   char ackRes[];
   string ackHeaders = "Content-Type: application/json\r\n";
   WebRequest("POST", ackUrl, ackHeaders, 2500, ackPost, ackRes, resultHeaders);

   if(executed)
      PrintFormat("✅ Orden TRstudio #%s ejecutada en MT5: %s %s %.2f Lotes (Ticket #%I64u)", orderId, action, sym, normLots, mt5Ticket);
   else
      PrintFormat("❌ Error al ejecutar orden #%s en MT5 (%s). Retcode=%u", orderId, sym, retcode);
  }
//+------------------------------------------------------------------+
