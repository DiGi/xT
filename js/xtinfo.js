/**
* xT.Info object
* part of SION
*
* @author DiGi
* @see xT
* $Id$
**/

xT.Info = {
	method : 'POST',
	sourceURL : 'innerdata.php',
	cssPlus : 'p',
	cssMinus : 'm',
	cssLoading : 'load',
	cssLoaded : '',
	loadingMsg : 'Nahrávám...',
	BeforeSendData : function (d) { return d },
	ProceedData : function(r, d, dv, x) { dv.innerHTML = x; return true },
	version : '$Revision$',

	init : function(elementName, customData) { with(this) {
		var r = typeof elementName == 'string' ? $(elementName) : elementName
		if (r) {
			var l = xT.Lib.firstChildByTag(r, 'LEGEND'), d = xT.Lib.firstChildByTag(r, 'DIV')
			var data = customData == undefined ? {} : customData
			data['_id'] = r.id
			l.onclick = function(e) { xT.Info._click(l, d, sourceURL, data); return false }
			d.loaded = d.innerHTML.length > 0 ? 2 : 0
			_change_state(d.loaded, l, d)
		}
	}},

	_change_state : function(s, l, d) { with(this) {
			l.className = s ? cssMinus : cssPlus
			d.style.display = s ? 'block' : 'none'
	}},

	_click : function(l, d, u, data) { with(this) {
		var s = l.className == cssPlus
		if (s && d.loaded < 1) {
			d.loaded = 1
			d.innerHTML = loadingMsg
			d.className = cssLoading
			xT.request(method, u, BeforeSendData(data), xT.Info._loaded)
		}
		_change_state(s, l, d)
	}},

	_loaded : function(d,x) {
		var r = $(d._id)
		if (r) {
			var dv = xT.Lib.firstChildByTag(r, 'DIV')
			if (xT.Info.ProceedData(r, d, dv, x)) {
				dv.loaded = 2
				dv.className = xT.Info.cssLoaded
			}
		}
	}

} // xT.Info