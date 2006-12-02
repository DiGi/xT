/**
* xT.Tree object
* part of SION
*
* @author DiGi
* @see xT
* $Id$
**/

xT.Tree = {
	method : 'POST', // POST, GET, p�i pou�it�m OnGetDataURL i EMPTY-GET
	expandElements : false,
	BeforeSendData : function (d) { return d }, // Ud�lost volan� p�ed za��tkem p�enosu. V n� je mo�n� do objektu doplnit dal�� parametry p�edan� volan� str�nce
	OnGetDataURL : null, // Funkce, volan� p�i z�sk�n� "dataURL" - pou��van� pro statick� GET str�nky. P��klad: xT.Tree.OnGetDataURL = function(id) { return 'treecache/' + id + '.html' }
	version : '$Revision$',

	/**
	* Init stromu, nastaven� ud�losti a vol�n� _prepareUL (nastaven� [+] [-] ikon)
	* @access public
	* @param string rootElement jm�no hlavn�ho <ul>
	* @param string url URL, kter� se m� ��kat o data
	* @param boolean autoExpandElements automaticky rozbalit v�echny napln�n� elementy
	**/
	init : function(rootElement, url, autoExpandElements) { with(this) {
		var t = typeof rootElement == 'string' ? $(rootElement) : rootElement
		if (t) {
			t.onclick = function(e) { xT.Tree._click(e, url) }
			_prepareUL(t, autoExpandElements ? autoExpandElements : true)
		}
	}},

	/**
	* Obsluha kliknut� stromu - rozbalen�, sbalen� nebo dota�en� elementu
	* @access protected
	**/
	_click : function(e, url) { with(this) {
		var ev = e || window.event, elm = ev.srcElement || ev.target, col = true
		if (elm.id && elm.id.match(/^show-(.*)/)) {
			var targ = $('tree-' + RegExp.$1)
			if (targ && targ.style) {
				if (!targ.prepared)
					_prepareUL(targ)
				col = targ.style.display == 'none'
				targ.style.display = col ? 'block' : 'none'
			} else {
				var u = OnGetDataURL ? OnGetDataURL(RegExp.$1) : url
				xT.request(method, u, BeforeSendData({ _id: RegExp.$1 }), xT.Tree._loaded)
			}
			elm.className = elm.className.replace(col ? 'plus' : 'minus', col ? 'minus' : 'plus')
		}
	}},

	/**
	* Ud�lost, obsluhuj�c� dokon�en� dota�en� dat (pokud ji� v dokumentu neexistuje polo�ka se stejn�m jm�nem
	* @access protected
	**/
	_loaded : function(d,x) {
		if (!$('tree-' + d._id)) {
			var elm = $('show-' + d._id)
			elm.className = elm.className.replace('plus', 'minus')
			elm.innerHTML += x.responseText
			var tree = xT.Lib.firstChildByTag(elm, 'UL')
			xT.Tree._prepareUL(tree, this.expandElements)
		}
	},

	/**
	* Metoda, nastavuj�c� korektn� [+] [-] zna�ky jednotliv�m <li> element�m
	* @access private
	**/
	_prepareUL : function(ul, prepareSub) {
		var nodes = xT.Lib.childsByTag(ul, 'LI')
		var lastnode = nodes.length - 1
		for (var i = 0; i <= lastnode; i++) {
			if (nodes[i].id.match(/^show-/)) {
				var prepareThisSub = prepareSub || nodes[i].className == 'minus'
				var last = i == lastnode ? '-last' : ''
				var ulSubNode = xT.Lib.firstChildByTag(nodes[i], 'UL')
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