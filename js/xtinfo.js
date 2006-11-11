/**
* xT.Info object
* part of SION
*
* @author DiGi
* @see xT, xT.Lib
* $Id$
**/

xT.Info = {
	Method : 'POST',
	sourceURL : 'innerdata.php',
	cssPlus : 'p',
	cssMinus : 'm',
	cssLoading : 'load',
	cssLoaded : '',
	loadingMsg : 'Nahrávám...',
	BeforeSendData : function (d) { return d },
	ProceedData : function(r, d, dv, x) { dv.innerHTML = x.responseText; return true },
	version: '0.9',

	init : function(en) { with(this) {
		var r = document.getElementById(en)
		if (r) {
			var l = xT.Lib.getFirstNode(r,'LEGEND')
			var d = xT.Lib.getFirstNode(r,'DIV')
			l.onclick = function(e) { xT.Info._click(l, d, sourceURL); return false }
			d.loaded = d.innerHTML.length > 0 ? 2 : 0
			_change_state(d.loaded, l, d)
		}
	}},

	_change_state : function(s, l, d) { with(this) {
			l.className = s ? cssMinus : cssPlus
			d.style.display = s ? 'block' : 'none'
	}},

	_click : function(l, d, u) { with(this) {
		var s = l.className == cssPlus
		if (s && d.loaded < 1) {
			d.loaded = 1
			d.innerHTML = loadingMsg
			d.className = cssLoading
			xT.request(Method, u, BeforeSendData({ _id : l.parentNode.id }), xT.Info._loaded)
		}
		_change_state(s, l, d)
	}},

	_loaded : function(d,x) {
		var r = document.getElementById(d._id)
		if (r) {
			var dv = xT.Lib.getFirstNode(r,'DIV')
			if (xT.Info.ProceedData(r, d, dv, x)) {
				dv.loaded = 2
				dv.className = xT.Info.cssLoaded
			}
		}
	}

} // xT.Info