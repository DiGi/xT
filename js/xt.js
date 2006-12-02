/**
* xT (XMLHttpRequest) object
* xT.Lib object
* xT.Eval object
* part of SION
*
* @author DiGi
* $Id$
**/


/**
* Zkratka na získávání elementu podle ID
*
**/
function $(id) {
	return document.getElementById(id) }


/**
* Hlavní objekt
*
**/
var xT = {
	enabled : false,  // XMLHttpRequest je podporován prohlížeèem
	maxActive : 4,    // Maximální poèet soubìžných dotazù
	timeout : 8,      // Timeout dotazu (sec)
	OnStartTransfers : function() {},       // Událost volaná pøi zaèátku pøenosu
	OnTransfersComplete : function() {},    // Událost volaná pøi dokonèení všech pøenosù
	OnError : function(msg) { alert(msg) },  // Obsluha chyb
	OnTimeout : function(url, data) { xT._error('Chyba : Timeout pri komunikaci') }, // Událost volaná pøi timeoutu dotazu
	version : '$Revision$',
	// @access private
	_active : 0,
	_jobs : [],


	/**
	* Hlavní metoda pøidávající úkoly do fronty a spouštìní stahování
	* @access public
	**/
	request : function(method, url, data, OnCompleteEvent) { with(this) {
		if (enabled) {
			_jobs.push({ method: method.toUpperCase(), url: url, data: data, OnComplete: OnCompleteEvent || evalResponse, xmlReq: null })
			_do_next()
		} else
			_error('XMLHttpRequest is missing.')
	}},


	/**
	* Získání XMLHttpRequest objektu
	* @access public
	**/
	getXmlReq : function() {
		if (window.XMLHttpRequest)
			try {
				return new XMLHttpRequest() }
			catch(e) {
				return false }
		else if (window.ActiveXObject)
			try {
				return new ActiveXObject("Msxml2.XMLHTTP") }
			catch(e) {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP") }
				catch(e) {
					return false} }
		else
			return false
	},


	/**
	* Konverze dat (object nebo array) na klic=hodnota&klic2=hodnota2... formát
	* @access public
	**/
	dataToURI : function(data) {
		var out = []
		for (var key in data)
			out.push(key + '=' + encodeURIComponent(data[key]))
		return out.join('&')
	},


	/**
	* Obsluha JS kódu
	* @access protected
	**/
	evalResponse : function (d,x) {
		try { eval(x.responseText) } catch(e) { this._error(e, 'Error in requested JavaScript code') }
	},


	/**
	* Textové zobrazení stavu objektu
	* @access public
	**/
	toString : function() { with(this) {
		return 'xT v' + version + ', ' + _active + ' active jobs, '  + _jobs.length + ' in queue'
	}},


	/**
	* Událost volaná z XMLHttpRequest objektu, zpracování informací o prùbìhu stahování
	* @access protected
	**/
	_proceed : function(dataObj) { with(this) {
		var x = dataObj.xmlReq
		if (x.readyState == 4) {
			_complete()
			if (x.status < 400)
				if (x.getResponseHeader('Content-Type').match(/^\s*(text|application)\/(javascript|js|eval)(.*)?\s*$/i))
					evalResponse(dataObj.data, x)
				else
					try { dataObj.OnComplete(dataObj.data, x) } catch(e) { _error(e, 'Error in OnComplete event') }
			else
				_error("Problem pri prenaseni dat:\nChyba "+x.status+': '+x.statusText)
		}
	}},


	/**
	* Obsluha timeout události
	* @access protected
	**/
	_on_timeout : function(dataObj) { with(this) {
		if (dataObj && dataObj.xmlReq.readyState < 4) {
			dataObj.xmlReq.abort()
			_complete()
			try { OnTimeout(dataObj.url, dataObj.data) } catch(e) { _error(e, 'Error in OnTimeout event') }
		}
	}},


	/**
	* Správa pøenosù - zaène nový pøenos (i více pokud jsou volné sloty) a posílá upozornìní
	* @access private
	**/
	_do_next : function() { with(this) {
		if (_active < maxActive && _jobs.length > 0) {
			if (_active == 0)
				try { OnStartTransfers() } catch(e) { _error(e, 'Error in OnStartTransfers event') }
			_active++; _start_transfer(); _do_next()
		}
	}},


	/**
	* Obsluha "dokonèení pøenosu". Zaèít další pøenos nebo poslat upozornìní pøi dokonèení všech
	* @access private
	**/
	_complete : function() { with(this) {
		_active--
		if (_jobs.length > 0)
			_do_next()
		else if (_active == 0)
			try { OnTransfersComplete() } catch(e) { _error(e, 'Error in OnTransfersComplete event') }
	}},


	/**
	* Zaène provádìt jeden XMLHttp pøenos ze seznamu úkolù
	* @access private
	**/
	_start_transfer : function() { with(this) {
		var c = _jobs.shift(), x = c.xmlReq = getXmlReq()
		// Pøíprava pøedávaných dat
		var d = c.data instanceof Object || c.data instanceof Array ? dataToURI(c.data) : 'data=' + c.data
		var u = c.method == 'GET' ? c.url + '?' + d : c.url
		try {
			// Obsluha událostí
			x.onreadystatechange = function() { xT._proceed(c) }
			// Samotné otevøení dotazu, odeslání hlavièek
			var m = c.method.match(/(GET|POST)/), m = m ? m[0] : 'GET'
			x.open(m, u, true)
			x.setRequestHeader('X-Requested-With','xT v' + version)
			x.setRequestHeader('Accept', 'text/html, application/xml, text/xml, */*')
			if (m == 'POST') {
				x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
				x.setRequestHeader('Content-Length', d.length)
				// Odeslání POST obsahu
				x.send(d) }
			else
				x.send(null)
			// Timeout
			setTimeout(function() { xT._on_timeout(c) }, timeout * 1000)
		} catch (e) {_error(e, 'Nepodarilo se navazat spojeni k '+c.url); _complete()}
		return true
	}},


	/**
	* Metoda na volání obsluhy chyb
	* @access private
	**/
	_error : function(exception, message) {
		var msg = message == undefined ? exception : message + ':\nChyba: ' + (exception.description || exception)
		try { this.OnError(msg) } catch(e) { alert('Error in OnError event') }
	}

} // xT

// detekce XML objektu
var test_xT = xT.getXmlReq()
if (test_xT) {
	xT.enabled = true
	delete(test_xT) }

xT.Lib = {
	/**
	* Vrátí seznam skuteèných potomkù podle jejich typu
	* @access public
	**/
	childsByTag : function(element, tagName) {
		var o = [], s = element.childNodes, tag = tagName.toUpperCase()
		if (s)
			for(var k = 0; k < s.length; k++)
				if (s[k].tagName && s[k].tagName == tag)
					o.push(s[k])
		return o
	},

	/**
	* Vrátí prvního nalezeného potomka podle typu
	* @access public
	**/
	firstChildByTag : function(element, tagName) {
		var s = element.childNodes, tag = tagName.toUpperCase()
		if (s)
			for(var k = 0; k < s.length; k++)
				if (s[k].tagName && s[k].tagName == tag )
					return s[k]
		return null
	}

} // xT.Lib