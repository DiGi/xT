/**
* xT.Tree object
* part of SION
*
* @author DiGi
* @see xT, xT.Lib
* $Id: xttree.js 143 2006-05-31 21:12:58Z DiGi $
**/

xT.Tree = {
	Method : 'POST',
	xTAutoInitRootSubItems : true,
	xTAutoInitxTSubItems : false,
	// Ud�lost volan� p�ed za��tkem p�enosu. V n� je mo�n� do objektu doplnit dal�� parametry p�edan� volan� str�nce
	BeforeSendData : function (d) { return d },
	version : '0.9',

	/**
	* Init stromu, nastaven� ud�losti a vol�n� _prepareUL (nastaven� [+] [-] ikon)
	* @access public
	**/
	init: function(root_name, url) { with(this) {
		var t = document.getElementById(root_name)
		if (t) {
			t.onclick = function(e) { xT.Tree._click(e, url) }
			_prepareUL(t, xTAutoInitRootSubItems)
		}
	}},

	/**
	* Obsluha kliknut� stromu - rozbalen�, sbalen� nebo dota�en� elementu
	* @access protected
	**/
	_click: function(e, url) { with(this) {
		var e = e || window.event, elm = e.srcElement || e.target
		if (elm.id && elm.id.match(/^show-(.*)/)) {
			var targ = document.getElementById('tree-' + RegExp.$1)
			if (targ && targ.style) {
				if (!targ.prepared)
					_prepareUL(targ)
				col = targ.style.display == 'none'
				targ.style.display = col ? 'block' : 'none'
			} else {
				col = true
				xT.request(Method, url, BeforeSendData({ _id : RegExp.$1 }), xT.Tree._loaded)
			}
			elm.className = elm.className.replace(col?'plus':'minus', col?'minus':'plus')
		}
	}},

	/**
	* Ud�lost, obsluhuj�c� dokon�en� dota�en� dat (pokud ji� v dokumentu neexistuje polo�ka se stejn�m jm�nem
	* @access protected
	**/
	_loaded: function(d,x) {
		if (!document.getElementById('tree-' + d._id)) {
			var elm = document.getElementById('show-' + d._id)
			elm.className = elm.className.replace('plus', 'minus')
			elm.innerHTML += x.responseText
			var tree = xT.Lib.getFirstNode(elm, 'UL')
			xT.Tree._prepareUL(tree, this.xTAutoInitxTSubItems)
		}
	},

	/**
	* Metoda, nastavuj�c� korektn� [+] [-] zna�ky jednotliv�m <li> element�m
	* @access private
	**/
	_prepareUL: function(ul, prepareSub) {
		var nodes = xT.Lib.getChildNodes(ul, 'LI')
		var lastnode = nodes.length - 1
		for (var i = 0; i <= lastnode; i++) {
			if (nodes[i].id.match(/^show-/)) {
				var prepareThisSub = prepareSub || nodes[i].className == 'minus'
				var last = i == lastnode ? '-last' : ''
				var ulSubNode = xT.Lib.getFirstNode(nodes[i], 'UL')
				var state = prepareThisSub && ulSubNode ? 'minus' : 'plus'
				nodes[i].className = state + last
				if (ulSubNode) {
				if (prepareThisSub)
					this._prepareUL(ulSubNode, prepareSub)
				else
					ulSubNode.style.display = 'none'
				}
			}
			else if (i == lastnode)
				nodes[i].className = 'last'
		}
		ul.prepared = 1
	}

} // xT.Tree