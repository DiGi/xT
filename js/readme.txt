xT Readme
---------
$URL$
$Id$

xT (xt.js)
----------
Zapouzd�en� XMLHttpRequest objektu


v0.95 je�t� NEN� FIN�LN�
------------------------

v0.95 (2006.11.06)
- p�ejmenov�n� metod - sjednocen� velikost� p�smen v n�zvech prom�nn�ch a metod

v0.93.1 (2006.10.26)
- drobn� oprava - dopln�no return false - ve funkci getXmlReq (hl�eno jako varov�n� ve strict m�du)

v0.93 (2006.07.25)
- drobn� opravy (var parametry) - hl�eno jako varov�n� ve strict m�dech

v0.92 (2006.06.09)
! oprava v xT._start_transfer (odstran�no pos�l�n� headeru "Connection:Close". V p��pad� GET po�adavku se po�le x.send(null) )

v0.91 (2006.06.09)
! oprava v xT._on_timeout (u abort dopln�n� () )

v0.9 (2006.05.31)
- spojen� jednotliv�ch t��d do z�kladn� t��dy xT
- xT.requesetEval p�esunuta do vlastn� t��dy xT.Eval
! opravy v xT.Lib (chyba p�i nenalezen� ��dn�ch potomk�)

v0.85 (2006.05.30)
- p�epracovan� hl�en� chyb, xT._error podporuje i chybov� objekt
! Oprava chyby this._error v xT._evalJS

v0.82 (2006.05.??)
- drobn� �pravy k�du, dopln�n� koment��
- drobn� zm�ny v xTLib

v0.8 (2006.05.19)
- Nov� objekt XTLib se spole�n�mi funkcemi

v0.7 (2006.05.09)
- Nov� metoda requestEval, vr�cen� data rovnou prov�d� jako JS k�d

v0.6 (2006.05.06)
- Fronta dotaz�
- POST/GET dotazy
- Libovoln� po�et soub�n� b��c�ch dotaz� (postupn� na��tan�ch z fronty)
- Eventy p�i za��tku p�enosu a dokon�en� v�ech p�enos�
- Event p�i chyb� (intern� chyby, vol�n� extern�ch event� (bezpe�nostn� optimalizace))
- Event p�i Timeoutu (d�lka timeoutu m�niteln�)
- Automatick� enk�dov�n� p�edan�ch dat (�et�zec, array nebo objekt) pro odesl�n�

TODO:
- Voliteln�/m�niteln� Headery?

xT.Lib
Obsahuje spole�n� metody pou��van� dal��mi objekty (getChildNodes, getChildNode)

xT.Eval
Obsahuje jednoduchou obsluhu pro sta�en� a proveden� JavaScript k�du


xT.Tree (xttree.js)
-------------------
Aktivn� zobrazen� stromu s mo�nost� dynamick�ho dotahov�n� pomoc� xT

v0.95 (2006.11.06)
- pou�it� funkce $

v0.93 (2006.07.25)
- drobn� opravy (var parametry) - hl�eno jako varov�n� ve strict m�dech

v0.9 (2006.05.31)
- spojen� jednotliv�ch t��d do z�kladn� t��dy xT

v0.82 (2006.05.??)
- drobn� �pravy k�du

v0.8 (2006.05.19)
- Pou�it� xTLib m�sto _getChildNodes

v0.7 (2006.05.09)
- Oprava zji�t�n� potomk�, getElementsByTagName nahrazeno vlastn�m _getChildNodes

v0.6 (2006.05.06)
- Struktura podle UL/LI
- p�i ozna�ov�n� dat ("generov�n� stromu" mo�no ur�it, jestli se maj� proch�zet jen z�kladn� �rovn� nebo
  i vno�en� (pro z�kladn� strom a xT strukturu zvl᚝) (rychlostn� optimalizace)
- LI se stylem "minus" jsou v�dy kresleny rozbalen�
- Data jsou dotahov�na p�es xT objekt
- Automatick� detekce posledn� polo�ky stromu
- Ud�lost BeforeSendData pro voliteln� dopln�n� libovoln�ch dat do xT dotaz�


xT.Info (xtinfo.js)
-------------------
Infoblok s dotahov�n�m p�es xT

v0.95 (2006.11.07)
- dopln�n druh� parametr v metod� init - obsahuje voliteln� u�ivatelsk� data, kter� se pak p�ed�vaj� p�es xT
- pou�it� funkce $

v0.9 (2006.05.31)
- spojen� jednotliv�ch t��d do z�kladn� t��dy xT

v0.12 (2006.05.??)
- sync na 0.?2

v0.1 (2006.05.19 - beta)

TODO:
- o�et�en� timeout�?


xT.Form (xtinfo.js)
-------------------
Obsluha Form� s mo�nost� odeslat data p�es xT

v0.95 (2006.11.06)
- nepojmenovan� elementy se neodes�laj�
- pou�it� funkce $

v0.9 (2006.05.31)
- spojen� jednotliv�ch t��d do z�kladn� t��dy xT
- ud�lost BeforeSendData

v0.12 (2006.05.??)
- init verze
