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
	enabled: false,  // XMLHttpRequest je podporov�n prohl�e�em
	maxActive: 4,    // Maxim�ln� po�et soub�n�ch dotaz�
	timeout: 8,      // Timeout dotazu (sec)
	OnStartTransfers: function() {},       // Ud�lost volan� p�i za��tku p�enosu
	OnTransfersComplete: function() {},    // Ud�lost volan� p�i dokon�en� v�ech p�enos�
	OnError: function(msg) { alert(msg) },  // Obsluha chyb
	OnTimeout: function(url, data) { xT._error('Chyba: Timeout pri komunikaci') },  // Ud�lost volan� p�i timeoutu dotazu
	version: '0.9',
	// @access private
	_active: 0,
	_jobs: [],


	/**
	* Hlavn� metoda p�id�vaj�c� �koly do fronty a spou�t�n� stahov�n�
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
	* Z�sk�n� XMLHttpRequest objektu
	* @access public
	**/
	getXmlReq: function() {
		if (window.XMLHttpRequest) { try { return new XMLHttpRequest() } catch(e) {return false}
		} else if (window.ActiveXObject) { try { return new ActiveXObject("Msxml2.XMLHTTP") } catch(e)
		{ try { return new ActiveXObject("Microsoft.XMLHTTP") } catch(e) {return false} } }
	},


	/**
	* Konverze dat (object nebo array) na klic=hodnota&klic2=hodnota2... form�t
	* @access public
	**/
	dataToURI: function(d) {
		var o = []
		for (var k in d)
			o.push(k + '=' + encodeURIComponent(d[k]))
		return o.join('&')
	},


	/**
	* Ud�lost volan� z XMLHttpRequest objektu, zpracov�n� informac� o pr�b�hu stahov�n�
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
	* Obsluha timeout ud�losti
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
	* Spr�va p�enos� - za�ne nov� p�enos (i v�ce pokud jsou voln� sloty) a pos�l� upozorn�n�
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
	* Obsluha "dokon�en� p�enosu". Za��t dal�� p�enos nebo poslat upozorn�n� p�i dokon�en� v�ech
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
	* Za�ne prov�d�t jeden XMLHttp p�enos ze seznamu �kol�
	* @access private
	**/
	_start_transfer: function() { with(this) {
		var c = _jobs.shift(), x = c.xmlReq = getXmlReq()
		// P��prava p�ed�van�ch dat
		var d = c.data instanceof Object || c.data instanceof Array ? dataToURI(c.data) : 'data=' + c.data
		var u = c.method == 'GET' ? c.url + '?' + d : c.url
		try {
			// Obsluha ud�lost�
			x.onreadystatechange = function() { xT._proceed(c) }
			// Samotn� otev�en� dotazu, odesl�n� hlavi�ek
			x.open(c.method, u, true)
			x.setRequestHeader('X-Requested-With','XMLHttpRequest');x.setRequestHeader('X-xT-Version',version)
			x.setRequestHeader('Accept', 'text/html, application/xml, text/xml, */*')
			if (c.method == 'POST') {
				x.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
				x.setRequestHeader('Content-Length',d.length);x.setRequestHeader('Connection','close')
				// Odesl�n� POST obsahu
				x.send(d)
			} else x.send('')
			// Timeout
			setTimeout(function() { xT._on_timeout(c) }, timeout * 1000)
		} catch (e) {_error(e, 'Nepodarilo se navazat spojeni k '+c.url); _complete()}
		return true
	}},


	/**
	* Metoda na vol�n� obsluhy chyb
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
	* Vr�t� seznam skute�n�ch potomk� podle jejich typu
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
	* Vr�t� prvn�ho nalezen�ho potomka podle typu
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
	* Vytvo�en� dotazu s n�sledn�m proveden�m sta�en�ch dat
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
	* Obsluha JS k�du
	* @access protected
	**/
	eval_loaded: function (d,x) {
		try { eval(x.responseText) } catch(e) {xT._error(e, 'Error in requested JavaScript code')}
	}

} // xT.Eval