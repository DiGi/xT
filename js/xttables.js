xT.Tables = {
	method : 'POST',
	postURL : 'postdata.php',
	BeforeSendData : function (d) { return d; },
	OnTransferComplete : function (d,x) { },
	version : '$Revision: 20 $',
	_editor : null,
	_locked : false,
	_editing : false,

	click : function(dd, e) {
		var ev = e || window.event, elm = ev.srcElement || ev.target;
		this._startEdit(dd, elm);
	}, // edit

	mouseOver : function (dd, event) {
		if (xT.Tables._editing || xT.Tables._locked)
			{ return false; }
		xT.Tables.click(dd, event);
		return true;
	},

	_save : function(tableName, rowId, colName, colValue) { with (this) {
		xT.request(method, postURL, BeforeSendData({
			t : tableName,
			r : rowId,
			c : colName,
			v : colValue
		}), OnTransferComplete)
	}},

	_startEdit : function (dd, elm) {
		if (elm && elm.nodeType && elm.nodeType == 1 && elm.tagName == 'TD' && dd[elm.cellIndex]) {
			if (this._editor) {
				if (this._editor.editor == elm || this._editor.elm == elm)
					return false;
				this._endEdit();
			}
			var def = dd[elm.cellIndex], ed = {
				elm : elm,
				dataDef : dd,
				rowDef : def,
				oldValue : elm.innerHTML,
				editor : this.Editors[def.type.toLowerCase()].getEditor(elm, def),
				getValue : this.Editors[def.type.toLowerCase()].getValue
			};
			this._editor = ed;
			ed.editor.onkeyup = function(e) { var ev = e || window.event; return ev.keyCode != 9; };
			ed.editor.onkeydown = function(e) { return xT.Tables._handleKeyDown(e); };
			ed.editor.onblur = function(e) { if (!xT.Tables._locked) xT.Tables._endEdit(); };
			// setTimeout('if (xT.Tables._editor) xT.Tables._editor.editor.onblur = function(e) { if (!xT.Tables._locked) xT.Tables._endEdit(); };', 2)
			return true;
		}
		return false;
	},

	_endEdit : function(editor) {
		if (this._locked)
			return false;
		var e = editor || this._editor
		if (e) {
			if (editor == undefined)
				this._editor = null
			with (e) {
				editor.onblur = editor.onkeydown = null
				var newValue = getValue(editor)
				elm.innerHTML = newValue[1]
				if (newValue[1] != oldValue)
					this._save(elm.offsetParent.id, dataDef.getRowId ? dataDef.getRowId(elm) : elm.parentNode.id, rowDef.name || elm.cellIndex, newValue[0])
				editor = dataDef = rowDef = oldValue = editor = null
			}}
		e = null;
		if (!editor)
			this._editing = false;
		return true;
	},


	_handleKeyDown : function(event) {
		this._locked = true;
		var ev = event || window.event, elm = ev.srcElement || ev.target
		if (ev.keyCode == 27) {
			this._editor.elm.innerHTML = this._editor.oldValue;
			this._editor = null;
			xT.Tables._editing = false;
			this._locked = false;
			return false;
		}
		if (ev.keyCode == 9) {
			this._editor.editor.onblur = null
			this._editor.editor.onkeydown = null
			var smer = ev.shiftKey ? -1 : 1, std = this._editor.elm, newRowIndex = std.parentNode.rowIndex, dataDef = this._editor.dataDef
			var n = smer == 1 ? std.nextSibling : std.previousSibling, oldEd = this._editor;
			this._editor = null;
			while (true) {
				if (n) {
					if (n.nodeType && n.nodeType == 1 && n.tagName == 'TD' && dataDef[n.cellIndex]) {
						xT.Tables._editing = true;
						this._startEdit(dataDef, n);
						this._locked = false;
						this._endEdit(oldEd);
						return false;
					}
					n = smer == 1 ? n.nextSibling : n.previousSibling;
				} else {
					newRowIndex = newRowIndex + smer
					if (newRowIndex < 0)
						newRowIndex = std.offsetParent.rows.length - 1;
					if (newRowIndex == std.offsetParent.rows.length)
						newRowIndex = 0;
					n = smer == 1 ? std.offsetParent.rows[newRowIndex].firstChild : std.offsetParent.rows[newRowIndex].lastChild;
				}
			}
		}
		if (ev.keyCode == 13  && elm && elm.tagName != 'TEXTAREA') {
			this._locked = false;
			this._endEdit();
			return false;
		}
		this._locked = false;
		return true;
	},


	Editors : {
		input : {
			className: 'xTTables teInput',
			getEditor : function(elm, def) {
				elm.innerHTML = '<input class="'+this.className+'" value="' + elm.innerHTML.replace(/"/g, '&quot;') + '" />'
				elm.firstChild.select()
				return elm.firstChild
			},
			getValue : function(edit) { return [edit.value, edit.value] }
		},
		textarea : {
			className: 'xTTables teTextarea',
			getEditor : function(elm, def) {
				elm.innerHTML = '<textarea class="'+this.className+'">' + elm.innerHTML.replace(/<br ?\/?>/gi, "\n") + '</textarea>'
				elm.firstChild.select()
				return elm.firstChild
			},
			getValue : function(edit) { var v = edit.value.replace(/\n/g, "<br>"); return [v, v] }
		},
		select :  {
			className: 'xTTables teSelect',
			getEditor : function(elm, def) {
				var s = '<select class="'+this.className+'">', sel = ''
				for (var key in def.values)
				{
					sel = elm.innerHTML == def.values[key] ? ' SELECTED="1">' : '>';
					s = s + '<option value="' + key + '"' + sel + def.values[key] + '</option>'
				}
				elm.innerHTML = s + '</select>';
				// el = elm.firstChild.focus();
				return elm.firstChild
			},
			getValue : function(elm, def) {
				var opt = elm.options[elm.selectedIndex]
				return [opt.value, opt.text]
			}
		}
	} // xT.Tables.Editors

} // xT.Tables