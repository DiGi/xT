/**
* xT.Tree object
* part of SION
*
* @author DiGi
* @see xT
* $Id$
**/

xT.Tree = {
	method : 'POST', // POST, GET, pøi použitém OnGetDataURL i EMPTY-GET
	expandElements : false,
	BeforeSendData : function (d) { return d }, // Událost volaná pøed zaèátkem pøenosu. V ní je možné do objektu doplnit další parametry pøedané volané stránce
	OnGetDataURL : null, // Funkce, volaná pøi získání "dataURL" - používané pro statické GET stránky. Pøíklad: xT.Tree.OnGetDataURL = function(id) { return 'treecache/' + id + '.html' }
	version : '$Revision$',

	/**
	* Init stromu, nastavení události a volání _prepareUL (nastavení [+] [-] ikon)
	* @access public
	* @param string rootElement jméno hlavního <ul>
	* @param string url URL, které se má øíkat o data
	* @param boolean autoExpandElements automaticky rozbalit všechny naplnìné elementy
	**/
	init : function(rootElement, url, autoExpandElements) { with(this) {
		var t = typeof rootElement == 'string' ? $(rootElement) : rootElement
		if (t) {
			t.onclick = function(e) { xT.Tree._click(e, url) }
			_prepareUL(t, autoExpandElements ? autoExpandElements : true)
		}
	}},

	/**
	* Obsluha kliknutí stromu - rozbalení, sbalení nebo dotažení elementu
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
	* Událost, obsluhující dokonèení dotažení dat (pokud již v dokumentu neexistuje položka se stejným jménem
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
	* Metoda, nastavující korektní [+] [-] znaèky jednotlivým <li> elementùm
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