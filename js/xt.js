/**
* xT (XMLHttpRequest) object
* xT.Lib object
* xT.Eval object
* part of SION
*
* @todo Přeložit komentáře a chybové hlášky
*
* @author DiGi
**/


/**
* Zkratka na získávání elementu podle ID
*
**/
function $(id) {
	return document.getElementById(id); }


/**
* Hlavní objekt
*
**/
var xT = {
	enabled : false,  // XMLHttpRequest je podporován prohlížečem
	maxActive : 4,    // Maximální počet souběžných dotazů
	timeout : 8,      // Timeout dotazu (sec)
	OnStartTransfers : function() {},       // Událost volaná při začátku přenosu
	OnTransfersComplete : function() {},    // Událost volaná při dokončení všech přenosů
	OnError : function(msg) { alert(msg); }, // Obsluha chyb
	OnTimeout : function(url, data) { xT._error('Chyba : Timeout pri komunikaci'); }, // Událost volaná při timeoutu dotazu
	version : '$Revision$',
	// @access private
	_active : 0,
	_jobs : [],


	/**
	* Hlavní metoda přidávající úkoly do fronty a spouštění stahování
	* 
	* @param {string} method Způsob odeslání požadavku (POST, GET, ...)
	* @param {string} url Adresa
	* @param {Object} data
	* @param {event} OnCompleteEvent
	* @retun {boolean} Požadavek byl úspěšně přidán do fronty ke zpracování
	**/
	request : function(method, url, data, OnCompleteEvent) {
		if (this.enabled) {
			this._jobs.push({
				method: method.toUpperCase(),
				url: url,
				data: data === undefined ? '' : data,
				OnComplete: OnCompleteEvent || this.evalResponse,
				xmlReq: null });
			this._do_next();
		} else
			this._error('XMLHttpRequest is missing.');
		return this.enabled;
	},


	/**
	* Získání XMLHttpRequest objektu
	* 
	* @return {object} Získaný XMLHttpRequest nebo false
	**/
	getXmlReq : function() {
		if (window.XMLHttpRequest) 
			return new XMLHttpRequest();
		else 
			if (window.ActiveXObject) 
				try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {
				try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {} } 
		return false;
	},


	/**
	* Konverze dat (object nebo array) na klic=hodnota&klic2=hodnota2... formát. Pouze jedna úroveň.
	*
	* @param {Object} data Data k převedení
	* @return {string} Zakódované data
	**/
	dataToURI : function(data) {
		var out = [];
		for (var key in data)
			out.push(key + '=' + encodeURIComponent(data[key]));
		return out.join('&');
	},


	/**
	* Obsluha JS kódu
	*
	* @param {Object} d Původní odeslaná data
	* @param {Object} x Vrácená data (XML, JSON objekt, čistý text)
	**/
	evalResponse : function (d,x) {
		return xT._evalJS(x);
	},

	
	/**
	* Bezpečné provádění JS kódu
	* 
	* @param {string} js JavaScript kód k provedení
	* @return Vrácený výsledek z JS kódu
	**/
	_evalJS : function(js) {
		try { return eval(js); } catch(e) { xT._error(e, 'Error in requested JavaScript code'); }
	},


	/**
	* Textové zobrazení stavu objektu
	*
	**/
	toString : function() {
		return 'xT v' + this.version + ', ' + this._active + ' active jobs, '  + this._jobs.length + ' in queue';
	},


	/**
	* Událost volaná z XMLHttpRequest objektu, zpracování informací o průběhu stahování
	*
	**/
	_proceed : function(dataObj) {
		if (dataObj.xmlReq.readyState == 4)
        {
			this._complete();
			var x = dataObj.xmlReq;
			if (x && x.status < 400) {
				var data = x.getResponseHeader('Content-Type');
				if (data.match(/^\s*(text|application)\/(javascript|js$|js;|eval)(.*)?\s*$/i))
					this._evalJS(x.responseText);
				else {
					if (data.match(/^.*\/xml.*$/i))
						data = x.responseXML;
					else
						data = data.match(/^\s*(text|data|application)\/json(.*)?\s*$/i) ? this._evalJS('(' + x.responseText + ')') : x.responseText;
					try { dataObj.OnComplete(dataObj.data, data); } catch(e) { this._error(e, 'Error in OnComplete event'); }
				}
			} else
				this._error("Problem pri prenaseni dat:\nChyba " + x.status + ': ' + x.statusText);
		}
	},


	/**
	* Obsluha timeout události
	*
	**/
	_on_timeout : function(dataObj) {
		if (dataObj && dataObj.xmlReq.readyState < 4) {
			dataObj.xmlReq.abort();
			this._complete();
			try { this.OnTimeout(dataObj.url, dataObj.data); } catch(e) { this._error(e, 'Error in OnTimeout event'); }
		}
	},


	/**
	* Správa přenosů - začne nový přenos (i více pokud jsou volné sloty) a posílá upozornění
	*
	**/
	_do_next : function() {
		if (this._active < this.maxActive && this._jobs.length > 0) {
			if (this._active === 0)
				try { this.OnStartTransfers(); } catch(e) { this._error(e, 'Error in OnStartTransfers event'); }
			this._active++;
            this._start_transfer();
            this._do_next();
		}
	},


	/**
	* Obsluha "dokončení přenosu". Začít další přenos nebo poslat upozornění při dokončení všech
	* 
	**/
	_complete : function() {
		this._active--;
		if (this._jobs.length > 0)
			this._do_next();
		else if (this._active === 0)
			try { this.OnTransfersComplete(); } catch(e) { this._error(e, 'Error in OnTransfersComplete event'); }
	},


	/**
	* Začne provádět jeden XMLHttp přenos ze seznamu úkolů
	* 
	**/
	_start_transfer : function() {
		var c = this._jobs.shift(), x = c.xmlReq = this.getXmlReq();
		// Příprava předávaných dat
		var d = c.data instanceof Object || c.data instanceof Array ? this.dataToURI(c.data) : c.data.indexOf && c.data.indexOf('=') > 0 ? c.data : 'data=' + c.data;
		var u = c.method == 'GET' ? c.url + '?' + d : c.url;
		// Obsluha událostí
		x.onreadystatechange = function() { xT._proceed(c); };
		// Samotné otevření dotazu, odeslání hlaviček
		var m = c.method.match(/(GET|POST)/); m = m ? m[0] : 'GET';
		try {
			x.open(m, u, true);
			x.setRequestHeader('Accept', 'text/html, application/json, text/xml, */*');
			if (m == 'POST') {
				x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				x.setRequestHeader('Content-Length', d.length);
				// Odeslání POST obsahu
				x.send(d); }
			else
				x.send(null);
			// Timeout
			setTimeout(function() { xT._on_timeout(c); }, this.timeout * 1000);
		} catch (e) { xT._error(e, 'Nepodarilo se navazat spojeni k '+c.url); this._complete(); }
		return true;
	},


	/**
	* Metoda na volání obsluhy chyb
	* 
	**/
	_error : function(exception, message) {
		var msg = message === undefined ? exception : message + ':\nChyba: ' + (exception.description || exception);
		try { this.OnError(msg); } catch(e) { alert('Error in OnError event'); }
	}

}; // xT

// detekce XML objektu
xT.enabled = xT.getXmlReq() !== false;

xT.Lib = {
	/**
	* Vrátí seznam skutečných potomků podle jejich typu
	* @access public
	**/
	childsByTag : function(element, tagName) {
		var o = [], s = element.childNodes, tag = tagName.toUpperCase();
		if (s)
			for(var k = 0; k < s.length; k++)
				if (s[k].tagName && s[k].tagName == tag)
					o.push(s[k]);
		return o;
	},

	/**
	* Vrátí prvního nalezeného potomka podle typu
	* @access public
	**/
	firstChildByTag : function(element, tagName) {
		var s = element.childNodes, tag = tagName.toUpperCase();
		if (s)
			for(var k = 0; k < s.length; k++)
				if (s[k].tagName && s[k].tagName == tag )
					return s[k];
		return null;
	}

}; // xT.Lib