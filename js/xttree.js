/**
* xT.Tree object
* part of SION
*
* @author DiGi
* @see xT
* $Id$
**/

xT.Tree = {
	method : 'POST',
	xTAutoInitRootSubItems : true,
	xTAutoInitxTSubItems : false,
	// Událost volaná pøed zaèátkem pøenosu. V ní je možné do objektu doplnit další parametry pøedané volané stránce
	BeforeSendData : function (d) { return d },
	version : '0.95',

	/**
	* Init stromu, nastavení události a volání _prepareUL (nastavení [+] [-] ikon)
	* @access public
	**/
	init : function(rootElement, url) { with(this) {
		var t = typeof rootElement == 'string' ? $(rootElement) : rootElement
		if (t) {
			t.onclick = function(e) { xT.Tree._click(e, url) }
			_prepareUL(t, xTAutoInitRootSubItems)
		}
	}},

	/**
	* Obsluha kliknutí stromu - rozbalení, sbalení nebo dotažení elementu
	* @access protected
	**/
	_click : function(e, url) { with(this) {
		var ev = e || window.event, elm = ev.srcElement || ev.target
		if (elm.id && elm.id.match(/^show-(.*)/)) {
			var targ = $('tree-' + RegExp.$1)
			if (targ && targ.style) {
				if (!targ.prepared)
					_prepareUL(targ)
				var col = targ.style.display == 'none'
				targ.style.display = col ? 'block' : 'none'
			} else {
				var col = true
				xT.request(method, url, BeforeSendData({ _id: RegExp.$1 }), xT.Tree._loaded)
			}
			elm.className = elm.className.replace(col ? 'plus' : 'minus', col ? 'minus' : 'plus')
		}
	}},

	/**
	* Událost, obsluhující dokonèení dotažení dat (pokud již v dokumentu neexistuje položka se stejným jménem
	* @access protected
	**/
	_loaded : function(d,x) {
		if (!$('tree-' + d._id)) {
			var elm = $('show-' + d._id)
			elm.className = elm.className.replace('plus', 'minus')
			elm.innerHTML += x.responseText
			var tree = elm.firstChildByTag('UL')
			xT.Tree._prepareUL(tree, this.xTAutoInitxTSubItems)
		}
	},

	/**
	* Metoda, nastavující korektní [+] [-] znaèky jednotlivým <li> elementùm
	* @access private
	**/
	_prepareUL : function(ul, prepareSub) {
		var nodes = ul.childsByTag('LI')
		var lastnode = nodes.length - 1
		for (var i = 0; i <= lastnode; i++) {
			if (nodes[i].id.match(/^show-/)) {
				var prepareThisSub = prepareSub || nodes[i].className == 'minus'
				var last = i == lastnode ? '-last' : ''
				var ulSubNode = nodes[i].firstChildByTag('UL')
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