/**
* xT (XMLHttpRequest) object
* xT.Lib object
* xT.Eval object
* part of SION
*
* @todo P�elo�it koment��e a chybov� hl�ky
*
* @author DiGi
**/


/**
* Zkratka na z�sk�v�n� elementu podle ID
*
**/
function $(id) {
	return document.getElementById(id); }


/**
* Hlavn� objekt
*
**/
var xT = {
	enabled : false,  // XMLHttpRequest je podporov�n prohl�e�em
	maxActive : 4,    // Maxim�ln� po�et soub�n�ch dotaz�
	timeout : 8,      // Timeout dotazu (sec)
	OnStartTransfers : function() {},       // Ud�lost volan� p�i za��tku p�enosu
	OnTransfersComplete : function() {},    // Ud�lost volan� p�i dokon�en� v�ech p�enos�
	OnError : function(msg) { alert(msg); }, // Obsluha chyb
	OnTimeout : function(url, data) { xT._error('Chyba : Timeout pri komunikaci'); }, // Ud�lost volan� p�i timeoutu dotazu
	version : '$Revision$',
	// @access private
	_active : 0,
	_jobs : [],


	/**
	* Hlavn� metoda p�id�vaj�c� �koly do fronty a spou�t�n� stahov�n�
	* 
	* @param {string} method Zp�sob odesl�n� po�adavku (POST, GET, ...)
	* @param {string} url Adresa
	* @param {Object} data
	* @param {event} OnCompleteEvent
	* @retun {boolean} Po�adavek byl �sp�n� p�id�n do fronty ke zpracov�n�
	**/
	request : function(method, url, data, OnCompleteEvent) { with(this) {
		if (enabled) {
			_jobs.push({
				method: method.toUpperCase(),
				url: url,
				data: data == undefined ? '' : data,
				OnComplete: OnCompleteEvent || evalResponse,
				xmlReq: null })
			_do_next()
		} else
			_error('XMLHttpRequest is missing.')
		return enabled
	}},


	/**
	* Z�sk�n� XMLHttpRequest objektu
	* 
	* @return {object} Z�skan� XMLHttpRequest nebo false
	**/
	getXmlReq : function() {
		if (window.XMLHttpRequest) 
			return new XMLHttpRequest()
		else 
			if (window.ActiveXObject) 
				try { return new ActiveXObject("Msxml2.XMLHTTP") } catch (e) {
				try { return new ActiveXObject("Microsoft.XMLHTTP") } catch(e) {} } 
		return false
	},


	/**
	* Konverze dat (object nebo array) na klic=hodnota&klic2=hodnota2... form�t. Pouze jedna �rove�.
	*
	* @param {Object} data Data k p�eveden�
	* @return {string} Zak�dovan� data
	**/
	dataToURI : function(data) {
		var out = []
		for (var key in data)
			out.push(key + '=' + encodeURIComponent(data[key]))
		return out.join('&')
	},


	/**
	* Obsluha JS k�du
	*
	* @param {Object} d P�vodn� odeslan� data
	* @param {Object} x Vr�cen� data (XML, JSON objekt, �ist� text)
	**/
	evalResponse : function (d,x) {
		return xT._evalJS(x);
	},

	
	/**
	* Bezpe�n� prov�d�n� JS k�du
	* 
	* @param {string} js JavaScript k�d k proveden�
	* @return Vr�cen� v�sledek z JS k�du
	**/
	_evalJS : function(js) {
		try { return eval(js) } catch(e) { xT._error(e, 'Error in requested JavaScript code') }
	},


	/**
	* Textov� zobrazen� stavu objektu
	*
	**/
	toString : function() { with(this) {
		return 'xT v' + version + ', ' + _active + ' active jobs, '  + _jobs.length + ' in queue'
	}},


	/**
	* Ud�lost volan� z XMLHttpRequest objektu, zpracov�n� informac� o pr�b�hu stahov�n�
	*
	**/
	_proceed : function(dataObj) {
		if (dataObj.xmlReq.readyState == 4) with(this) {
			_complete()
			var x = dataObj.xmlReq
			if (x && x.status < 400) {
				var data = x.getResponseHeader('Content-Type');
				if (data.match(/^\s*(text|application)\/(javascript|js$|js;|eval)(.*)?\s*$/i))
					_evalJS(x.responseText)
				else {
					if (data.match(/^.*\/xml.*$/i))
						data = x.responseXML
					else
						data = data.match(/^\s*(text|data|application)\/json(.*)?\s*$/i) ? _evalJS('(' + x.responseText + ')') : x.responseText;
					try { dataObj.OnComplete(dataObj.data, data) } catch(e) { _error(e, 'Error in OnComplete event') }
				}
			} else
				_error("Problem pri prenaseni dat:\nChyba " + x.status + ': ' + x.statusText)
		}
	},


	/**
	* Obsluha timeout ud�losti
	*
	**/
	_on_timeout : function(dataObj) { with(this) {
		if (dataObj && dataObj.xmlReq.readyState < 4) {
			dataObj.xmlReq.abort()
			_complete()
			try { OnTimeout(dataObj.url, dataObj.data) } catch(e) { _error(e, 'Error in OnTimeout event') }
		}
	}},


	/**
	* Spr�va p�enos� - za�ne nov� p�enos (i v�ce pokud jsou voln� sloty) a pos�l� upozorn�n�
	*
	**/
	_do_next : function() {
		if (this._active < this.maxActive && this._jobs.length > 0) {
			if (this._active == 0)
				try { this.OnStartTransfers() } catch(e) { xT_error(e, 'Error in OnStartTransfers event') }
			this._active++; this._start_transfer(); this._do_next()
		}
	},


	/**
	* Obsluha "dokon�en� p�enosu". Za��t dal�� p�enos nebo poslat upozorn�n� p�i dokon�en� v�ech
	* 
	**/
	_complete : function() { with(this) {
		_active--
		if (_jobs.length > 0)
			_do_next()
		else if (_active == 0)
			try { OnTransfersComplete() } catch(e) { _error(e, 'Error in OnTransfersComplete event') }
	}},


	/**
	* Za�ne prov�d�t jeden XMLHttp p�enos ze seznamu �kol�
	* 
	**/
	_start_transfer : function() {
		var c = this._jobs.shift(), x = c.xmlReq = this.getXmlReq()
		// P��prava p�ed�van�ch dat
		var d = c.data instanceof Object || c.data instanceof Array ? this.dataToURI(c.data) : c.data.indexOf && c.data.indexOf('=') > 0 ? c.data : 'data=' + c.data
		var u = c.method == 'GET' ? c.url + '?' + d : c.url
		// Obsluha ud�lost�
		x.onreadystatechange = function() { xT._proceed(c) }
		// Samotn� otev�en� dotazu, odesl�n� hlavi�ek
		var m = c.method.match(/(GET|POST)/), m = m ? m[0] : 'GET'
		try {
			x.open(m, u, true)
			x.setRequestHeader('Accept', 'text/html, application/json, text/xml, */*')
			if (m == 'POST') {
				x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
				x.setRequestHeader('Content-Length', d.length)
				// Odesl�n� POST obsahu
				x.send(d) }
			else
				x.send(null)
			// Timeout
			setTimeout(function() { xT._on_timeout(c) }, this.timeout * 1000)
		} catch (e) { xT._error(e, 'Nepodarilo se navazat spojeni k '+c.url); this._complete() }
		return true
	},


	/**
	* Metoda na vol�n� obsluhy chyb
	* 
	**/
	_error : function(exception, message) {
		var msg = message == undefined ? exception : message + ':\nChyba: ' + (exception.description || exception)
		try { this.OnError(msg) } catch(e) { alert('Error in OnError event') }
	}

} // xT

// detekce XML objektu
xT.enabled = xT.getXmlReq() !== false;

xT.Lib = {
	/**
	* Vr�t� seznam skute�n�ch potomk� podle jejich typu
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
	* Vr�t� prvn�ho nalezen�ho potomka podle typu
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

} // xT.Lib