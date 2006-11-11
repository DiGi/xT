/**
* xT (XMLHttpRequest) object
* xT.Lib object
* xT.Eval object
* part of SION
*
* @author DiGi
* $Id: xt.js 143 2006-05-31 21:12:58Z DiGi $
**/

var xT = {
	enabled: false,  // XMLHttpRequest je podporován prohlížeèem
	maxActive: 4,    // Maximální poèet soubìžných dotazù
	timeout: 8,      // Timeout dotazu (sec)
	OnStartTransfers: function() {},       // Událost volaná pøi zaèátku pøenosu
	OnTransfersComplete: function() {},    // Událost volaná pøi dokonèení všech pøenosù
	OnError: function(msg) { alert(msg) },  // Obsluha chyb
	OnTimeout: function(url, data) { xT._error('Chyba: Timeout pri komunikaci') },  // Událost volaná pøi timeoutu dotazu
	version: '0.9',
	// @access private
	_active: 0,
	_jobs: [],


	/**
	* Hlavní metoda pøidávající úkoly do fronty a spouštìní stahování
	* @access public
	**/
	request: function(method, url, data, onCompleteEvent) { with(this) {
		if (enabled) {
			_jobs.push({ method: method, url: url, data: data, onComplete: onCompleteEvent, xmlReq: null })
			_do_next()
		} else
			_error('XMLHttpRequest is missing.')
	}},


	/**
	* Získání XMLHttpRequest objektu
	* @access public
	**/
	getXmlReq: function() {
		if (window.XMLHttpRequest) { try { return new XMLHttpRequest() } catch(e) {return false}
		} else if (window.ActiveXObject) { try { return new ActiveXObject("Msxml2.XMLHTTP") } catch(e)
		{ try { return new ActiveXObject("Microsoft.XMLHTTP") } catch(e) {return false} } }
	},


	/**
	* Konverze dat (object nebo array) na klic=hodnota&klic2=hodnota2... formát
	* @access public
	**/
	dataToURI: function(d) {
		var o = []
		for (var k in d)
			o.push(k + '=' + encodeURIComponent(d[k]))
		return o.join('&')
	},


	/**
	* Událost volaná z XMLHttpRequest objektu, zpracování informací o prùbìhu stahování
	* @access protected
	**/
	_proceed: function(c) { with(this) {
		var x = c.xmlReq
		if (x.readyState == 4) {
			_complete()
			if (x.status < 400)
				try { c.onComplete(c.data, x) } catch(e) {_error(e, 'Error in OnComplete event')}
			else
				_error("Problem pri prenaseni dat:\nChyba "+x.status+': '+x.statusText)
		}
	}},


	/**
	* Obsluha timeout události
	* @access protected
	**/
	_on_timeout: function(c) { with(this) {
		if (c && c.xmlReq.readyState < 4) {
			c.xmlReq.abort
			_complete()
			try { OnTimeout(c.url, c.data) } catch(e) {_error(e, 'Error in OnTimeout event')}
		}
	}},


	/**
	* Správa pøenosù - zaène nový pøenos (i více pokud jsou volné sloty) a posílá upozornìní
	* @access private
	**/
	_do_next: function() { with(this) {
		if (_active < maxActive && _jobs.length > 0) {
			if (_active == 0)
				try {OnStartTransfers()} catch(e) {_error(e, 'Error in OnStartTransfers event')}
			_active++; _start_transfer(); _do_next()
		}
	}},


	/**
	* Obsluha "dokonèení pøenosu". Zaèít další pøenos nebo poslat upozornìní pøi dokonèení všech
	* @access private
	**/
	_complete: function() { with(this) {
		_active--
		if (_jobs.length > 0)
			_do_next()
		else if (_active == 0)
			try {OnTransfersComplete()} catch(e) {_error(e, 'Error in OnTransfersComplete event')}
	}},


	/**
	* Zaène provádìt jeden XMLHttp pøenos ze seznamu úkolù
	* @access private
	**/
	_start_transfer: function() { with(this) {
		var c = _jobs.shift(), x = c.xmlReq = getXmlReq()
		// Pøíprava pøedávaných dat
		var d = c.data instanceof Object || c.data instanceof Array ? dataToURI(c.data) : 'data=' + c.data
		var u = c.method == 'GET' ? c.url + '?' + d : c.url
		try {
			// Obsluha událostí
			x.onreadystatechange = function() { xT._proceed(c) }
			// Samotné otevøení dotazu, odeslání hlavièek
			x.open(c.method, u, true)
			x.setRequestHeader('X-Requested-With','XMLHttpRequest');x.setRequestHeader('X-xT-Version',version)
			x.setRequestHeader('Accept', 'text/html, application/xml, text/xml, */*')
			if (c.method == 'POST') {
				x.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
				x.setRequestHeader('Content-Length',d.length);x.setRequestHeader('Connection','close')
				// Odeslání POST obsahu
				x.send(d)
			} else x.send('')
			// Timeout
			setTimeout(function() { xT._on_timeout(c) }, timeout * 1000)
		} catch (e) {_error(e, 'Nepodarilo se navazat spojeni k '+c.url); _complete()}
		return true
	}},


	/**
	* Metoda na volání obsluhy chyb
	* @access private
	**/
	_error: function(e, m) {
		if (m == undefined)
			var msg = e
		else
			var emsg = e.description ? e.description : e, msg = m + ':\nChyba: ' + emsg
		try { this.OnError(msg) } catch(e) {alert('Error in OnError event')}
	}

} // xT

var test_xT = xT.getXmlReq()
if (test_xT) { xT.enabled = true; delete(test_xT) }


/**
* xT.Lib object
* part of SION
*
* @author DiGi
**/
xT.Lib = {

	/**
	* Vrátí seznam skuteèných potomkù podle jejich typu
	* @access public
	**/
	getChildNodes: function(elem, subTagName) {
		var o = [], s = elem.childNodes
		if (s)
			for(var k = 0; k < s.length; k++)
				if (s[k].tagName == subTagName)
					o.push(s[k])
		return o
	},

	/**
	* Vrátí prvního nalezeného potomka podle typu
	* @access public
	**/
	getFirstNode: function(elem, subTagName) {
		var s = elem.childNodes
		if (s)
			for(var k = 0; k < s.length; k++)
				if (s[k].tagName == subTagName)
					return s[k]
		return 0
	}

} // xT.Lib


xT.Eval = {
	Method : 'POST',
	sourceURL : 'job.php',
	BeforeSendData : function (d) { return d },

	/**
	* Vytvoøení dotazu s následným provedením stažených dat
	* @access public
	**/
	request: function(url, data) { with(xT.Eval) {
		if (data == undefined)
			var u = sourceURL, d = url
		else
			var u = url, d = data
		xT.request(Method, u, BeforeSendData(d), xT.Eval.eval_loaded)
	}},

	/**
	* Obsluha JS kódu
	* @access protected
	**/
	eval_loaded: function (d,x) {
		try { eval(x.responseText) } catch(e) {xT._error(e, 'Error in requested JavaScript code')}
	}

} // xT.Eval