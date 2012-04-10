/**
* xT.Form object
* part of SION
*
* @author DiGi
* @see xT
**/

xT.Form = {
	method : 'POST',
	BeforeSendData : function (d) { return d },
	OnTransferComplete : function (d,x) { alert('Data byla odeslana') },
	version : '$Revision$',

	/**
	* Odešle přes xT data na zadanou adresu
	* @access public
	**/
	send : function(url, formName, OnComplete) { with(this) {
		var out = [], elems = getFormElements(formName)
		for (var i in elems) {
			var v = xT.Form.Items[elems[i].tagName.toLowerCase()](elems[i])
			if (v && v[0])
				out.push(v[0] + '=' + encodeURIComponent(v[1]))
		}		
		xT.request(method, url, BeforeSendData(out).join('&'), OnComplete || OnTransferComplete)
	}},


	/**
	* Odešle přes xT data na zadanou adresu, vrácená data provede
	* @access public
	**/
	sendAndEval : function(url, formName) { with(this) {
		xT.request(method, url, BeforeSendData(formToObject(formName)))
	}},


	/**
	* Vrátí obsah formuláře jako datový objekt
	* @access public
	**/
	formToObject : function (formName) { with(this) {
		var o = {}
		var elems = getFormElements(formName)
		for (var i in elems) {
			var v = xT.Form.Items[elems[i].tagName.toLowerCase()](elems[i])
			if (v && v[0])
				o[v[0]] = v[1]
		}
		return o
	}},


	/**
	* Vrátí seznam použitelných Elementů ve formu
	* @access public
	**/
	getFormElements : function(formName) {
		var o = [], f = typeof formName == 'string' ? $(formName) : formName
		if (f) {
			for (var tag in xT.Form.Items) {
				var elemList = f.getElementsByTagName(tag);
				for (var i = 0; i < elemList.length; i++)
					o.push(elemList[i]);
			}
		}
		return o
	},


	/**
	* Zakáže Elementy na formuláři, volitelně s CallBack funkcí
	* @aceess public
	**/
	disable : function(formName, CheckElem) { with (this){
		var elems = getFormElements(formName)
		for (var i in elems) {
			var e = elems[i]
			if (!CheckElem || CheckElem(e)) {
				if (e.blur) e.blur()
				e.disabled = 'true'
			}
		}
	}},


	/**
	* Povolí Elementy na formuláři, volitelně s CallBack funkcí
	* @aceess public
	**/
	enable : function(formName, CheckElem) { with (this){
		var elems = getFormElements(formName)
		for (var i in elems) {
			var e = elems[i]
			if (!CheckElem || CheckElem(e))
				e.disabled = '' }
	}},


	/**
	* Pomocný objekt - obsahuje seznam použitých elementů a způsob,
	* jak z nich načíst data
	**/
	Items : {
		// <input type="..."
		input : function(e) {
			switch (e.type.toLowerCase()) {
				case 'text':
				case 'submit':
				case 'hidden':
				case 'password':
					return [e.name, e.value];
				case 'radio':
				case 'checkbox':
					if (e.checked)
						return [e.name, e.value]; }
			return false },

		// <textarea ...
		textarea : function(e) {
			return [e.name, e.value] },

		// <select ...
		select : function(e) {
			var o = []
			for (var i = 0; i < e.length; i++) {
				var opt = e.options[i];
				if (opt.selected)
					o.push(opt.value || opt.text) }
			return [e.name, o.join(',')] }

	} // xT.Form.Items

} // xT.Form