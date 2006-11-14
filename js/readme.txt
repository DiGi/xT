xT Readme
---------
$URL$
$Id$

xT (xt.js)
----------
Zapouzdøení XMLHttpRequest objektu


v0.95 ještì NENÍ FINÁLNÍ
------------------------

v0.95 (2006.11.06)
- pøejmenování metod - sjednocení velikostí písmen v názvech promìnnıch a metod

v0.93.1 (2006.10.26)
- drobná oprava - doplnìno return false - ve funkci getXmlReq (hlášeno jako varování ve strict módu)

v0.93 (2006.07.25)
- drobné opravy (var parametry) - hlášeno jako varování ve strict módech

v0.92 (2006.06.09)
! oprava v xT._start_transfer (odstranìno posílání headeru "Connection:Close". V pøípadì GET poadavku se pošle x.send(null) )

v0.91 (2006.06.09)
! oprava v xT._on_timeout (u abort doplnìné () )

v0.9 (2006.05.31)
- spojení jednotlivıch tøíd do základní tøídy xT
- xT.requesetEval pøesunuta do vlastní tøídy xT.Eval
! opravy v xT.Lib (chyba pøi nenalezení ádnıch potomkù)

v0.85 (2006.05.30)
- pøepracované hlášení chyb, xT._error podporuje i chybovı objekt
! Oprava chyby this._error v xT._evalJS

v0.82 (2006.05.??)
- drobné úpravy kódu, doplnìnı komentáø
- drobné zmìny v xTLib

v0.8 (2006.05.19)
- Novı objekt XTLib se spoleènımi funkcemi

v0.7 (2006.05.09)
- Nová metoda requestEval, vrácená data rovnou provádí jako JS kód

v0.6 (2006.05.06)
- Fronta dotazù
- POST/GET dotazy
- Libovolnı poèet soubìnì bìících dotazù (postupnì naèítanıch z fronty)
- Eventy pøi zaèátku pøenosu a dokonèení všech pøenosù
- Event pøi chybì (interní chyby, volání externích eventù (bezpeènostní optimalizace))
- Event pøi Timeoutu (délka timeoutu mìnitelná)
- Automatické enkódování pøedanıch dat (øetìzec, array nebo objekt) pro odeslání

TODO:
- Volitelné/mìnitelné Headery?

xT.Lib
Obsahuje spoleèné metody pouívané dalšími objekty (getChildNodes, getChildNode)

xT.Eval
Obsahuje jednoduchou obsluhu pro staení a provedení JavaScript kódu


xT.Tree (xttree.js)
-------------------
Aktivní zobrazení stromu s moností dynamického dotahování pomocí xT

v0.95 (2006.11.06)
- pouití funkce $

v0.93 (2006.07.25)
- drobné opravy (var parametry) - hlášeno jako varování ve strict módech

v0.9 (2006.05.31)
- spojení jednotlivıch tøíd do základní tøídy xT

v0.82 (2006.05.??)
- drobné úpravy kódu

v0.8 (2006.05.19)
- Pouití xTLib místo _getChildNodes

v0.7 (2006.05.09)
- Oprava zjištìní potomkù, getElementsByTagName nahrazeno vlastním _getChildNodes

v0.6 (2006.05.06)
- Struktura podle UL/LI
- pøi oznaèování dat ("generování stromu" mono urèit, jestli se mají procházet jen základní úrovnì nebo
  i vnoøené (pro základní strom a xT strukturu zvláš) (rychlostní optimalizace)
- LI se stylem "minus" jsou vdy kresleny rozbalené
- Data jsou dotahována pøes xT objekt
- Automatická detekce poslední poloky stromu
- Událost BeforeSendData pro volitelné doplnìní libovolnıch dat do xT dotazù


xT.Info (xtinfo.js)
-------------------
Infoblok s dotahováním pøes xT

v0.95 (2006.11.07)
- doplnìn druhı parametr v metodì init - obsahuje volitelná uivatelská data, která se pak pøedávají pøes xT
- pouití funkce $

v0.9 (2006.05.31)
- spojení jednotlivıch tøíd do základní tøídy xT

v0.12 (2006.05.??)
- sync na 0.?2

v0.1 (2006.05.19 - beta)

TODO:
- ošetøení timeoutù?


xT.Form (xtinfo.js)
-------------------
Obsluha Formù s moností odeslat data pøes xT

v0.95 (2006.11.06)
- nepojmenované elementy se neodesílají
- pouití funkce $

v0.9 (2006.05.31)
- spojení jednotlivıch tøíd do základní tøídy xT
- událost BeforeSendData

v0.12 (2006.05.??)
- init verze
