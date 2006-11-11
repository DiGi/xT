/**
* xT.Form object
* part of SION
*
* @author DiGi
* @see xT
* $Id: xtform.js 143 2006-05-31 21:12:58Z DiGi $
**/

xT.Form = {
	Method : 'POST',
	BeforeSendData: function (d) { return d },
	OnTransferComplete : function (d,x) { alert('Data byla odeslana') },
	version: '0.9',

	/**
	* Ode�le p�es xT data na zadanou adresu
	* @access public
	**/
	Send : function(url, formName, OnComplete) { with(this) {
		xT.request(Method, url, BeforeSendData(FormToObject(formName)), OnComplete || OnTransferComplete)
	}},


	/**
	* Ode�le p�es xT data na zadanou adresu, vr�cen� data provede
	* @access public
	**/
	SendAndEval : function(url, formName) { with(this) {
		xT.request(Method, url, BeforeSendData(FormToObject(formName)), xT.Eval.eval_loaded)
	}},

	
	/**
	* Vr�t� obsah formul��e jako datov� objekt
	* @access public
	**/
	FormToObject : function (formName) { with(this) {
		var o = {}, elems = GetFormElements(formName)
		for (var i in elems) {
			var v = xT.Form.Items[elems[i].tagName.toLowerCase()](elems[i])
			if (v)
				o[v[0]] = v[1]
		}
		return o
	}},

	/**
	* Vr�t� seznam pou�iteln�ch Element� ve formu
	* @access public
	**/
	GetFormElements : function(formName) {
		var o = [], f = document.getElementById(formName)
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
	* Zak�e Elementy na formul��i, voliteln� s CallBack funkc�
	* @aceess public
	**/
	Disable : function(formName, CheckElem) { with (this){
		var elems = GetFormElements(formName)
		for (var i in elems) {
			var e = elems[i]
			if (!CheckElem || CheckElem(e)) {
				e.blur()
				e.disabled = 'true'
			}
		}
	}},

	/**
	* Povol� Elementy na formul��i, voliteln� s CallBack funkc�
	* @aceess public
	**/
	Enable : function(formName, CheckElem) { with (this){
		var elems = GetFormElements(formName)
		for (var i in elems) {
			var e = elems[i]
			if (!CheckElem || CheckElem(e))
				e.disabled = ''
		}
	}}

} // xT.Form


/**
* Pomocn� objekt - obsahuje seznam pou�it�ch element� a zp�sob,
* jak z nich na��st data
**/
xT.Form.Items = {

	input : function(e) {
		switch (e.type.toLowerCase()) {
			case 'text':
			case 'submit':
			case 'hidden':
			case 'password':
				return xT.Form.Items.textarea(e);
			case 'radio':
			case 'checkbox':
				if (e.checked)
					return [e.name, e.value];
		}
		return false
	},

	textarea : function(e) {
		return [e.name, e.value]
	},

	select : function(e) {
		var o = []
		for (var i = 0; i < e.length; i++) {
			var opt = e.options[i];
			if (opt.selected)
				o.push(opt.value || opt.text)
		}
		return [e.name, o.join(',')]
	}

} // xT.Form.Items