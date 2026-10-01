import { Command as e, Plugin as t, Widget as n, addMenuToDropdown as r, createDropdown as i, toWidget as a } from "ckeditor5";
//#region theme/variables.svg
var o = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"none\"><path fill=\"#1EBC61\" d=\"M10.08 0c.327 0 .65.087.936.251l7.048 4.063c.58.335.936.954.936 1.623l-.013 8.127a1.864 1.864 0 0 1-.937 1.622l-7.034 4.063a1.88 1.88 0 0 1-1.872 0l-7.036-4.063a1.86 1.86 0 0 1-.936-1.623V5.938c0-.67.357-1.288.936-1.623L9.144.251c.284-.164.607-.25.935-.251m.03 4.063q-.261 0-.261.292v.78q-.835.072-1.453.378a2.33 2.33 0 0 0-.961.845q-.343.54-.343.956 0 .612.104.996.104.383.492.832.387.449 1.095.8.522.26 1.066.397v3.446a6 6 0 0 1-1.037-.156q-.498-.13-1.05-.54-.416-.31-.648-.038l-.298.35q-.194.229.208.547.492.39 1.283.605a6 6 0 0 0 1.542.208v.885q0 .292.26.292h.373q.261 0 .261-.293v-.897q1.088-.11 1.72-.572.635-.462.873-.944a2.4 2.4 0 0 0 .238-1.092q0-.456-.15-.884a2.1 2.1 0 0 0-.505-.787 3.4 3.4 0 0 0-.864-.618 7 7 0 0 0-1.312-.534V6.144q.18 0 .581.13.41.123.663.364.426.404.671.091l.32-.41q.165-.215-.178-.506-.314-.267-.947-.462-.626-.203-1.11-.203v-.793q0-.291-.26-.293zm.633 6.523q.18.052.567.247.35.183.573.533.231.345.231.78 0 .8-.402 1.145a2.07 2.07 0 0 1-.969.455zm-.894-1.56a5 5 0 0 1-.462-.203q-.515-.254-.716-.585-.194-.331-.193-.845 0-.625.447-.93t.924-.339z\"/></svg>", s = class extends t {
	init() {
		let e = this.editor;
		e.ui.componentFactory.add("ckeditorVariables", (t) => {
			let n = i(t);
			n.buttonView.set({
				label: "Variables",
				icon: o,
				tooltip: !0,
				withText: !0
			}), r(n, e.ui.view.body, c());
			let a = e.commands.get("ckeditorVariable");
			return a && n.bind("isEnabled").to(a), this.listenTo(n, "execute", (t) => {
				let n = t.path[2].id ?? t.path[1].id;
				if (!n) throw Error("dropdownView > execute: no variableType found for menu item");
				let r = {
					variableType: n,
					variable: t.source.id,
					label: t.source.label
				};
				if (n === "globals" && (r.globalSet = t.path[1].id), n === "entryFields") {
					let e = window.availableEntryFields.find((e) => e.handle === t.source.id);
					e ? (r.entrySlug = e.entrySlug, r.entrySection = e.entrySection) : window.ALYX_DEBUG_LOGGING && console.warn(`[ckeditorVariables/execute] Entry field with handle '${t.source.id}'wasn't found in window.availableEntryFields!`);
				}
				n === "entryTypes" && (r.entryTypeHandle = t.path[1].id.split("_")[1]), e.execute("ckeditorVariable", r), e.editing.view.focus();
			}), n;
		});
	}
};
function c() {
	let e = [], t = window.availableEntryFields ?? [];
	t.length && e.push({
		id: "entryFields",
		menu: "Huidige entry",
		children: t.map((e) => ({
			id: e.handle,
			label: e.name
		}))
	});
	let n = window.availableGlobalSets ?? [];
	n.length && e.push({
		id: "globals",
		menu: "Globals",
		children: n.map((e) => ({
			id: e.handle,
			menu: e.name,
			children: e.fields.map((e) => ({
				id: e.handle,
				label: e.name
			}))
		}))
	});
	let r = window.availableEntryTypeFields ?? [];
	return r.length && e.push({
		id: "entryTypes",
		menu: "Entry types",
		children: Object.entries(r).map(([e, t]) => ({
			id: `entryTypes_${e}`,
			menu: e,
			children: t.map((e) => ({
				id: e.handle,
				label: e.name
			}))
		}))
	}), e;
}
//#endregion
//#region src/command.ts
var l = class extends e {
	execute({ variableType: e, variable: t, label: n, globalSet: r, entrySection: i, entrySlug: a, entryTypeHandle: o }) {
		let s = this.editor, c = s.model.document.selection;
		s.model.change((l) => {
			let u = l.createElement("ckeditorVariable", {
				...Object.fromEntries(c.getAttributes()),
				"data-variabletype": e,
				"data-variable": t,
				"data-label": n,
				"data-globalset": r,
				"data-entrysection": i,
				"data-entryslug": a,
				"data-entrytypehandle": o
			});
			s.model.insertObject(u);
		});
	}
	refresh() {
		let e = this.editor.model, t = e.document.selection.focus;
		t && (this.isEnabled = e.schema.checkChild(t.parent, "ckeditorVariable"));
	}
}, u = class extends t {
	static get requires() {
		return [n];
	}
	init() {
		this._defineSchema(), this._defineConverters(), this.editor.commands.add("ckeditorVariable", new l(this.editor));
	}
	_defineSchema() {
		this.editor.model.schema.register("ckeditorVariable", {
			inheritAllFrom: "$inlineObject",
			allowAttributes: [
				"data-variabletype",
				"data-variable",
				"data-label",
				"data-globalset",
				"data-entrysection",
				"data-entryslug",
				"data-entrytypehandle"
			]
		});
	}
	_defineConverters() {
		let e = this.editor.conversion;
		e.for("upcast").elementToElement({
			view: {
				name: "span",
				classes: ["ckeditor-variable"]
			},
			model: (e, { writer: t }) => {
				let n = e.getAttribute("data-variabletype"), r = e.getAttribute("data-variable"), i = e.getAttribute("data-label"), a = e.getAttribute("data-globalset"), o = e.getAttribute("data-entrysection"), s = e.getAttribute("data-entryslug"), c = e.getAttribute("data-entrytypehandle");
				return t.createElement("ckeditorVariable", {
					"data-variabletype": n,
					"data-variable": r,
					"data-label": i,
					"data-globalset": a,
					"data-entrysection": o,
					"data-entryslug": s,
					"data-entrytypehandle": c
				});
			}
		}), e.for("editingDowncast").elementToElement({
			model: "ckeditorVariable",
			view: (e, { writer: n }) => {
				let r = t(e, n);
				return a(r, n);
			}
		}), e.for("dataDowncast").elementToElement({
			model: "ckeditorVariable",
			view: (e, { writer: n }) => t(e, n, !0)
		});
		function t(e, t, n = !1) {
			let r = e.getAttribute("data-variabletype"), i = e.getAttribute("data-variable"), a = e.getAttribute("data-label"), o = e.getAttribute("data-globalset"), s = e.getAttribute("data-entrysection"), c = e.getAttribute("data-entryslug"), l = e.getAttribute("data-entrytypehandle"), u = t.createContainerElement(n ? "span" : "code", {
				class: "ckeditor-variable",
				"data-variabletype": r,
				"data-variable": i,
				"data-label": a,
				"data-globalset": o,
				"data-entrysection": s,
				"data-entryslug": c,
				"data-entrytypehandle": l
			}), d = n ? r === "globals" ? `{globalset:${o}:${i}}` : r === "entryFields" ? `{entry:${s}/${c}:${i}}` : r === "entryTypes" ? `[[${l} ^_^ ${i}]]` : `UNK_${r}{${i},${a},${s},${c},${l}}` : `{${a}}`, f = t.createText(d);
			return t.insert(t.createPositionAt(u, 0), f), u;
		}
	}
}, d = class extends t {
	static get pluginName() {
		return "Variables";
	}
	static get requires() {
		return [s, u];
	}
};
//#endregion
export { d as Variables };
