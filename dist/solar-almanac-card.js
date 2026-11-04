// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: ee, getPrototypeOf: p } = Object, m = globalThis, h = m.trustedTypes, te = h ? h.emptyScript : "", ne = m.reactiveElementPolyfillSupport, g = (e, t) => e, _ = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? te : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, v = (e, t) => !l(e, t), re = {
	attribute: !0,
	type: String,
	converter: _,
	reflect: !1,
	useDefault: !1,
	hasChanged: v
};
Symbol.metadata ??= Symbol("metadata"), m.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = re) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? re;
	}
	static _$Ei() {
		if (this.hasOwnProperty(g("elementProperties"))) return;
		let e = p(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(g("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(g("properties"))) {
			let e = this.properties, t = [...f(e), ...ee(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? _ : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? _ : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? v)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[g("elementProperties")] = /* @__PURE__ */ new Map(), y[g("finalized")] = /* @__PURE__ */ new Map(), ne?.({ ReactiveElement: y }), (m.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var b = globalThis, x = (e) => e, S = b.trustedTypes, ie = S ? S.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, C = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, T = "?" + w, ae = `<${T}>`, E = document, D = () => E.createComment(""), O = (e) => e === null || typeof e != "object" && typeof e != "function", k = Array.isArray, oe = (e) => k(e) || typeof e?.[Symbol.iterator] == "function", A = "[ 	\n\f\r]", j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, se = /-->/g, ce = />/g, M = RegExp(`>|${A}(?:([^\\s"'>=/]+)(${A}*=${A}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), le = /'/g, ue = /"/g, de = /^(?:script|style|textarea|title)$/i, fe = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), N = fe(1), pe = fe(2), P = Symbol.for("lit-noChange"), F = Symbol.for("lit-nothing"), I = /* @__PURE__ */ new WeakMap(), L = E.createTreeWalker(E, 129);
function R(e, t) {
	if (!k(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ie === void 0 ? t : ie.createHTML(t);
}
var me = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = j;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === j ? c[1] === "!--" ? o = se : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = M) : (de.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = M) : o = ce : o === M ? c[0] === ">" ? (o = i ?? j, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? M : c[3] === "\"" ? ue : le) : o === ue || o === le ? o = M : o === se || o === ce ? o = j : (o = M, i = void 0);
		let d = o === M && e[t + 1].startsWith("/>") ? " " : "";
		a += o === j ? n + ae : l >= 0 ? (r.push(s), n.slice(0, l) + C + n.slice(l) + w + d) : n + w + (l === -2 ? t : d);
	}
	return [R(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, z = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = me(t, n);
		if (this.el = e.createElement(l, r), L.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = L.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(C)) {
					let t = u[o++], n = i.getAttribute(e).split(w), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ge : r[1] === "?" ? _e : r[1] === "@" ? ve : H
					}), i.removeAttribute(e);
				} else e.startsWith(w) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (de.test(i.tagName)) {
					let e = i.textContent.split(w), t = e.length - 1;
					if (t > 0) {
						i.textContent = S ? S.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], D()), L.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], D());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === T) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(w, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += w.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = E.createElement("template");
		return n.innerHTML = e, n;
	}
};
function B(e, t, n = e, r) {
	if (t === P) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = O(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = B(e, i._$AS(e, t.values), i, r)), t;
}
var he = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? E).importNode(t, !0);
		L.currentNode = r;
		let i = L.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new V(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new ye(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = L.nextNode(), a++);
		}
		return L.currentNode = E, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, V = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = F, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = B(this, e, t), O(e) ? e === F || e == null || e === "" ? (this._$AH !== F && this._$AR(), this._$AH = F) : e !== this._$AH && e !== P && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? oe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== F && O(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = z.createElement(R(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new he(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = I.get(e.strings);
		return t === void 0 && I.set(e.strings, t = new z(e)), t;
	}
	k(t) {
		k(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(D()), this.O(D()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = x(e).nextSibling;
			x(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, H = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = F, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = F;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = B(this, e, t, 0), a = !O(e) || e !== this._$AH && e !== P, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = B(this, r[n + o], t, o), s === P && (s = this._$AH[o]), a ||= !O(s) || s !== this._$AH[o], s === F ? e = F : e !== F && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === F ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ge = class extends H {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === F ? void 0 : e;
	}
}, _e = class extends H {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== F);
	}
}, ve = class extends H {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = B(this, e, t, 0) ?? F) === P) return;
		let n = this._$AH, r = e === F && n !== F || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== F && (n === F || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, ye = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		B(this, e);
	}
}, be = b.litHtmlPolyfillSupport;
be?.(z, V), (b.litHtmlVersions ??= []).push("3.3.3");
var xe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new V(t.insertBefore(D(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, U = globalThis, W = class extends y {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = xe(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return P;
	}
};
W._$litElement$ = !0, W.finalized = !0, U.litElementHydrateSupport?.({ LitElement: W });
var Se = U.litElementPolyfillSupport;
Se?.({ LitElement: W }), (U.litElementVersions ??= []).push("4.2.2");
// src/font.ts
var Ce = "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";
function we() {
	if (document.getElementById("sac-font")) return;
	let e = document.createElement("style");
	e.id = "sac-font", e.textContent = `@font-face{font-family:'SAC Numerals';font-weight:700;font-display:swap;src:url(data:font/woff2;base64,${Ce}) format('woff2')}`, document.head.appendChild(e);
}
// src/flows.ts
function G(e) {
	if (e.load !== void 0) return e.load;
	if (e.pv !== void 0 && e.battery !== void 0 && e.grid !== void 0) return Math.max(0, e.pv + e.battery + e.grid);
}
function Te(e) {
	let t = Math.max(0, e.pv ?? 0), n = Math.max(0, G(e) ?? 0), r = Math.max(0, e.battery ?? 0), i = Math.max(0, -(e.battery ?? 0)), a = Math.max(0, e.grid ?? 0), o = Math.max(0, -(e.grid ?? 0)), s = Math.min(t, n), c = Math.min(r, n - s), l = Math.min(a, Math.max(0, n - s - c)), u = t - s, d = Math.min(u, i);
	return {
		solarHome: s,
		batteryHome: c,
		gridHome: l,
		solarBattery: d,
		solarGrid: Math.min(u - d, o),
		gridBattery: Math.min(Math.max(0, i - d), Math.max(0, a - l))
	};
}
var Ee = "vi-VN";
function K(e, t = 1) {
	return e.toLocaleString(Ee, {
		minimumFractionDigits: t,
		maximumFractionDigits: t
	});
}
function q(e) {
	let t = Math.abs(e);
	return t >= 1e3 ? `${K(t / 1e3, 2)}\u00a0kW` : `${Math.round(t)}\u00a0W`;
}
function De(e) {
	let t = Math.abs(e);
	return t < 1e3 ? {
		value: String(Math.round(t)),
		unit: "W"
	} : {
		value: K(t / 1e3, t >= 1e4 ? 1 : 2),
		unit: "kW"
	};
}
function Oe(e) {
	let t = 2.5 - Math.log10(Math.abs(e) + 1) * .5;
	return Math.max(.4, Math.min(2.5, t));
}
function ke(e, t, n, r) {
	if (!(r < 50)) return t * Math.max(0, e - n) / 100 / (r / 1e3);
}
function Ae(e, t, n) {
	if (!(n < 50 || e >= 100)) return t * (100 - e) / 100 / (n / 1e3);
}
function je(e) {
	let t = -1, n = 0;
	for (let [r, i] of e) i > n && (n = i, t = r);
	if (t < 0) return;
	let r = (t) => (e.get(t) ?? 0) >= n * .7, i = t, a = t;
	for (; r(i - 1);) i--;
	for (; r(a + 1);) a++;
	return {
		start: i,
		end: a + 1
	};
}
function Me({ power: e, flows: t, threshold: n, gridOnline: r, runtime: i, fullIn: a }) {
	let o = G(e);
	if (o === void 0) return;
	let s = (e) => Math.round(e / Math.max(o, 1) * 100);
	if (r === !1) return {
		lead: "Đang mất lưới,",
		rest: i === void 0 ? `nhà đang dùng ${q(o)}.` : `pin còn chạy khoảng ${K(i)} giờ.`
	};
	if (t.solarGrid > n) return {
		lead: "Dư điện:",
		rest: `đang phát ${q(t.solarGrid)} lên lưới.`
	};
	if (t.solarBattery > n) {
		let t = a === void 0 ? "" : ` Đầy sau khoảng ${K(a)} giờ.`;
		return {
			lead: "Nắng dư,",
			rest: `đang sạc pin ${q(e.battery ?? 0)}.${t}`
		};
	}
	if (t.gridBattery > n) return {
		lead: "Lưới đang sạc pin",
		rest: `${q(t.gridBattery)}.`
	};
	let c = t.solarHome > n, l = t.batteryHome > n, u = t.gridHome > n;
	if (c && (l || u)) {
		let e = [l && `pin bù ${q(t.batteryHome)}`, u && `lưới bù ${q(t.gridHome)}`].filter(Boolean);
		return {
			lead: `Solar cấp ${s(t.solarHome)}% tải,`,
			rest: `${e.join(", ")}.`
		};
	}
	if (l && u) return {
		lead: `Pin đang gánh ${s(t.batteryHome)}% tải,`,
		rest: `lưới bù ${q(t.gridHome)}.`
	};
	let d = (e) => o - e <= n;
	return l ? { lead: d(t.batteryHome) ? "Pin đang gánh cả nhà." : `Pin đang gánh ${s(t.batteryHome)}% tải.` } : u ? { lead: d(t.gridHome) ? "Nhà đang dùng điện lưới." : `Lưới cấp ${s(t.gridHome)}% tải.` } : c ? { lead: d(t.solarHome) ? "Solar đủ cho cả nhà." : `Solar cấp ${s(t.solarHome)}% tải.` } : o > n ? void 0 : { lead: "Không có dòng công suất đáng kể." };
}
// src/history.ts
function J(e) {
	return new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
}
async function Ne(e, t, n) {
	if (!e.callWS) throw Error("hass.callWS không khả dụng");
	return (await e.callWS({
		type: "history/history_during_period",
		start_time: new Date(J(n)).toISOString(),
		end_time: n.toISOString(),
		entity_ids: [t],
		minimal_response: !0,
		no_attributes: !0
	}))[t] ?? [];
}
function Pe(e, t, n) {
	let r = J(t), i = Array(24).fill(0), a = Array(24).fill(0);
	for (let t of e) {
		let e = typeof t.s == "string" ? parseFloat(t.s) : NaN;
		if (Number.isNaN(e) || typeof t.lu != "number") continue;
		let o = /* @__PURE__ */ new Date(t.lu * 1e3);
		if (J(o) !== r) continue;
		let s = o.getHours();
		i[s] += e * n, a[s] += 1;
	}
	let o = /* @__PURE__ */ new Map(), s = 0;
	for (let e = 0; e <= t.getHours(); e++) a[e] && (s = i[e] / a[e]), o.set(e, s);
	return o;
}
var Fe = [
	"detailedHourly",
	"detailedForecast",
	"watts"
];
function Ie(e) {
	return Array.isArray(e) ? e.filter((e) => e && typeof e == "object").map((e) => [e.period_start ?? e.datetime ?? e.time, e.pv_estimate === void 0 ? Number(e.watts ?? e.power) : Number(e.pv_estimate) * 1e3]) : e && typeof e == "object" ? Object.entries(e).map(([e, t]) => [e, Number(t)]) : [];
}
function Le(e, t) {
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
	for (let [i, a] of Ie(e)) {
		let e = new Date(i);
		if (Number.isNaN(e.getTime()) || Number.isNaN(a) || J(e) !== J(t)) continue;
		let o = e.getHours();
		n.set(o, (n.get(o) ?? 0) + a), r.set(o, (r.get(o) ?? 0) + 1);
	}
	return new Map([...n].map(([e, t]) => [e, t / r.get(e)]));
}
// src/theme.ts
var Re = o`
  :host {
    --sac-surface: #fffaf9;
    --sac-border: #e5d3d1;
    --sac-dim: #7d5a56;
    --sac-fg: #443331;
    --sac-solar: #ac7a00;
    --sac-battery: #009655;
    --sac-grid: #0085e3;
    --sac-band: #c4302b;
    --sac-on-band: #ffffff;
    color-scheme: light;
  }
  :host([data-mode='dark']) {
    --sac-surface: #2c1412;
    --sac-border: #4f2d2b;
    --sac-dim: #d6aca7;
    --sac-fg: #f2e5e3;
    --sac-solar: #e7a500;
    --sac-battery: #00ca75;
    --sac-grid: #6fb7ff;
    --sac-band: #8f1f1b;
    --sac-on-band: #ffffff;
    color-scheme: dark;
  }
`;
// \0@oxc-project+runtime@0.156.0/helpers/esm/typeof.js
function Y(e) {
	"@babel/helpers - typeof";
	return Y = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Y(e);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/toPrimitive.js
function ze(e, t) {
	if (Y(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Y(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/toPropertyKey.js
function Be(e) {
	var t = ze(e, "string");
	return Y(t) == "symbol" ? t : t + "";
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/defineProperty.js
function X(e, t, n) {
	return (t = Be(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
// src/solar-almanac-card.ts
var Z = "solar-almanac-card", Ve = 3e5, He = [6, 17], Ue = {
	wh: .001,
	mwh: 1e3
}, We = [
	10,
	20,
	30
], Ge = [
	{
		key: "pv",
		label: "Solar",
		color: "var(--sac-solar)"
	},
	{
		key: "battery",
		label: "Pin",
		color: "var(--sac-battery)"
	},
	{
		key: "grid",
		label: "Lưới",
		color: "var(--sac-grid)"
	}
];
function Q(e) {
	if (e) return typeof e == "string" ? { entity: e } : e;
}
var $ = class extends W {
	constructor(...e) {
		super(...e), X(this, "_animations", /* @__PURE__ */ new Map()), X(this, "_lastFetch", 0);
	}
	static getStubConfig() {
		return { entities: {
			pv: "sensor.pv_power",
			battery: "sensor.battery_power",
			battery_soc: "sensor.battery_soc",
			grid: "sensor.grid_power"
		} };
	}
	setConfig(e) {
		if (!e || !e.entities) throw Error("solar-almanac-card: cần khai báo \"entities\"");
		this._config = e, this._lastFetch = 0;
	}
	getCardSize() {
		let e = this._config?.entities;
		return (this._config?.compact ? 5 : 11) + (e?.fan || e?.fan_rpm ? 1 : 0) + +!!e?.eod;
	}
	getGridOptions() {
		return {
			columns: 12,
			min_columns: 9
		};
	}
	connectedCallback() {
		super.connectedCallback(), we(), this.requestUpdate();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		for (let e of this._animations.values()) e.cancel();
		this._animations.clear();
	}
	_entity(e) {
		let t = Q(this._config?.entities[e]), n = t && this.hass?.states[t.entity];
		return t && n ? {
			cfg: t,
			st: n
		} : void 0;
	}
	_value(e) {
		let t = parseFloat(this._entity(e)?.st.state ?? "");
		return Number.isNaN(t) ? void 0 : t;
	}
	_unit(e) {
		return String(this._entity(e)?.st.attributes.unit_of_measurement ?? "").toLowerCase();
	}
	_scale(e) {
		let t = this._unit(e) === "kw" ? 1e3 : 1;
		return this._entity(e)?.cfg.invert ? -t : t;
	}
	_power(e) {
		let t = this._value(e);
		return t === void 0 ? void 0 : t * this._scale(e);
	}
	_energy(e) {
		let t = this._value(e);
		return t === void 0 ? void 0 : t * (Ue[this._unit(e)] ?? 1);
	}
	_cellDelta() {
		let e = this._value("cell_delta");
		return e !== void 0 && this._unit("cell_delta") === "v" ? e * 1e3 : e;
	}
	_temperatureUnit() {
		return this._entity("inverter_temperature")?.st.attributes.unit_of_measurement || "°C";
	}
	_unread(e) {
		return Ge.some(({ key: t }) => this._config?.entities[t] && e[t] === void 0);
	}
	_openEntity(e) {
		e && this.dispatchEvent(new CustomEvent("hass-more-info", {
			bubbles: !0,
			composed: !0,
			detail: { entityId: e }
		}));
	}
	_moreInfo(e) {
		this._openEntity(e && Q(this._config?.entities[e])?.entity);
	}
	_perform(e, t) {
		this.dispatchEvent(new CustomEvent("hass-action", {
			bubbles: !0,
			composed: !0,
			detail: {
				config: {
					entity: e,
					tap_action: t
				},
				action: "tap"
			}
		}));
	}
	_fanRpm() {
		let e = [this._config?.entities.fan_rpm ?? []].flat().flatMap((e) => Q(e)?.entity ?? []).filter((e) => this.hass?.states[e]), t = e.map((e) => parseFloat(this.hass?.states[e].state ?? "")).filter((e) => !Number.isNaN(e));
		return {
			ids: e,
			rpm: t.length ? Math.max(...t) : void 0
		};
	}
	_gridOnline() {
		let e = this._entity("grid_connected")?.st.state;
		if (e === "on") return !0;
		if (e === "off") return !1;
	}
	_forecast(e, t) {
		let n = this._entity(e)?.st.attributes, r = (this._config?.forecast_attribute ? [this._config.forecast_attribute] : Fe).find((e) => n?.[e] !== void 0);
		return Le(r ? n?.[r] : void 0, t);
	}
	_alerts() {
		let e = [[
			"Lệch cell",
			this._cellDelta(),
			this._config?.cell_delta_warn,
			"mV"
		], [
			"Nhiệt biến tần",
			this._value("inverter_temperature"),
			this._config?.inverter_temperature_warn,
			this._temperatureUnit()
		]].flatMap(([e, t, n, r]) => t === void 0 || n === void 0 || t <= n ? [] : [`${e} ${K(t, 0)} ${r}, vượt ngưỡng ${K(n, 0)} ${r}`]);
		return this._entity("fan_stall")?.st.state === "on" && e.push("Quạt tản nhiệt bị kẹt, cần kiểm tra"), e;
	}
	_hourCells(e) {
		let t = this._forecast("forecast_today", e), n = this._forecast("forecast_tomorrow", new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1)), r = je(t), i = n.size > 0 && (!r || e.getHours() >= r.end), a = i ? n : t, o = i ? je(n) : r, s = i ? void 0 : this._hourly, c = Math.max(0, ...a.values()), l = [...a].filter(([, e]) => e >= c * .02 && e > 0).map(([e]) => e);
		for (let [e, t] of s ?? []) t > 50 && l.push(e);
		let [u, d] = l.length ? [Math.min(...l), Math.max(...l)] : He, f = [];
		for (let t = u; t <= d; t++) f.push({
			hour: t,
			forecast: a.get(t),
			actual: s?.get(t),
			now: !i && t === e.getHours(),
			good: !!o && t >= o.start && t < o.end
		});
		return {
			cells: f,
			tomorrow: i,
			window: o
		};
	}
	_renderBand(e, t) {
		let n = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(e), r = `${String(e.getDate()).padStart(2, "0")}/${String(e.getMonth() + 1).padStart(2, "0")}`, i = this._value("grid_voltage"), a = i === void 0 ? "" : ` · ${Math.round(i)} V`;
		return N`
      <header class="band">
        <span class="date">${n.charAt(0).toUpperCase() + n.slice(1)} ${r}</span>
        ${this._config?.title ? N`<span class="title">${this._config.title}</span>` : F}
        ${t === !1 ? N`<span class="state down">Mất lưới</span>` : t || i !== void 0 ? N`<span class="state">${t ? "Có lưới" : "Lưới"}${a}</span>` : F}
      </header>
    `;
	}
	_renderSources(e) {
		let t = Ge.filter(({ key: e }) => this._config?.entities[e]), n = this._value("battery_soc"), r = this._config?.threshold ?? 10;
		return N`
      <div class="sources">
        ${t.map(({ key: t, label: i, color: a }) => {
			let o = e[t], s = o === void 0 || Math.abs(o) <= r ? "" : t === "battery" ? o > 0 ? " · xả" : " · sạc" : "", c = t === "grid" && o !== void 0 && Math.abs(o) > r ? o > 0 ? " · mua" : " · phát" : "";
			return N`
            <button class="row" @click=${() => this._moreInfo(t)}>
              <span class="label"><i style="background:${a}"></i>${i}${t === "battery" && n !== void 0 ? ` ${Math.round(n)}%` : ""}${s}${c}</span>
              <b class="num">${o === void 0 ? "—" : q(o)}</b>
              ${t === "battery" && n !== void 0 ? N`<span class="soc"><span style="width:${Math.min(100, Math.max(0, n))}%"></span></span>` : F}
            </button>
          `;
		})}
      </div>
      <div class="links">
      ${pe`
        <svg viewBox="0 0 30 150" preserveAspectRatio="none" aria-hidden="true">
          ${t.map(({ key: n, color: i }, a) => {
			let o = (a + .5) / t.length * 150, s = `M0 ${o}C16 ${o} 14 75 30 75`, c = e[n] ?? 0, l = Math.abs(c) > r;
			return pe`
              <path class="track" d=${s}></path>
              <path
                class="flow ${l ? "" : "idle"}"
                d=${s}
                stroke=${i}
                data-key=${n}
                data-rate=${l ? 1 / Oe(c) : 0}
                data-reverse=${c < 0 ? "1" : ""}
              ></path>
            `;
		})}
        </svg>
      `}
      </div>
    `;
	}
	_renderHero(e, t) {
		let n = e === void 0 ? void 0 : De(e), r = t ? (e ?? 0) - t.solarHome - t.batteryHome - t.gridHome : 0, i = t ? [
			{
				w: t.solarHome,
				color: "var(--sac-solar)"
			},
			{
				w: t.batteryHome,
				color: "var(--sac-battery)"
			},
			{
				w: t.gridHome,
				color: "var(--sac-grid)"
			},
			{
				w: r > (this._config?.threshold ?? 10) ? r : 0,
				color: "var(--sac-border)"
			}
		].filter((e) => e.w > 0) : [], a = N`
      <b class="num">${n?.value ?? "—"}</b>
      <span>${n?.unit ?? "W"} nhà đang dùng</span>
      ${i.length ? N`<span class="mix">${i.map((e) => N`<i style="flex:${e.w} 1 0;background:${e.color}"></i>`)}</span>` : F}
    `;
		return this._config?.entities.load ? N`<button class="hero" @click=${() => this._moreInfo("load")}>${a}</button>` : N`<div class="hero">${a}</div>`;
	}
	_renderReserve(e, t, n) {
		let r = this._energy("forecast_tomorrow"), i = t === !1 || !this._config?.entities.grid, a = [
			e === void 0 ? void 0 : {
				label: i ? "Pin còn" : "Nếu mất điện",
				value: `~${K(e)}`,
				unit: "giờ"
			},
			n === void 0 ? void 0 : {
				label: "Tự cấp",
				value: `${n}%`
			},
			r === void 0 ? void 0 : {
				label: "Ngày mai",
				value: `${Math.round(r)}`,
				unit: "kWh"
			}
		].filter((e) => e !== void 0);
		return a.length ? N`
      <dl class="reserve">
        ${a.map((e) => N`<div><dt>${e.label}</dt><dd class="num">${e.value}${e.unit ? N` <small>${e.unit}</small>` : F}</dd></div>`)}
      </dl>
    ` : F;
	}
	_renderHours(e) {
		let { cells: t, tomorrow: n, window: r } = this._hourCells(e), i = Math.max(1, ...t.map((e) => Math.max(e.forecast ?? 0, e.actual ?? 0))), a = t.some((e) => e.forecast !== void 0), o = t.some((e) => e.actual);
		if (!a && !o) return F;
		let s = a && o ? "Nền dự báo · Cột thực" : a ? "Nền: dự báo" : "Cột: thực tế", c = t.find((e) => e.hour === this._focusHour), l = c ? [
			`${c.hour}h`,
			c.forecast === void 0 ? "" : `Dự báo ${q(c.forecast)}`,
			c.actual === void 0 ? "" : `Thực ${q(c.actual)}`
		].filter(Boolean).join(" · ") : s, u = t.findIndex((e) => e.good), d = t.filter((e) => e.good).length;
		return N`
      <section class="hours" aria-label="Sản lượng theo giờ">
        <div class="hours-head">
          <span>${r ? `Giờ tốt dùng tải lớn${n ? " ngày mai" : ""}` : "Solar theo giờ"}</span>
          <b class=${c ? "" : "legend"}>${l}</b>
        </div>
        <div class="cells" style="--count:${t.length}">
          ${r && d ? N`<div class="window" style="grid-column:${u + 1} / span ${d}">${r.start}–${r.end}h</div>` : F}
          ${t.map((e) => {
			let t = (e.forecast ?? 0) / i, n = `${e.hour} giờ${e.good ? ", giờ tốt" : ""}${e.forecast === void 0 ? "" : `, dự báo ${q(e.forecast)}`}${e.actual === void 0 ? "" : `, thực ${q(e.actual)}`}`;
			return N`
              <button
                class="cell ${e.now ? "now" : ""}"
                aria-label=${n}
                @click=${() => this._focusHour = e.hour}
                @pointerenter=${(t) => t.pointerType === "mouse" && (this._focusHour = e.hour)}
                @pointerleave=${(e) => e.pointerType === "mouse" && (this._focusHour = void 0)}
                @focus=${() => this._focusHour = e.hour}
                @blur=${() => this._focusHour = void 0}
              >
                <span class="tile" style="--level:${Math.round(t * 70 + 6)}%">
                  ${e.actual ? N`<i style="height:${Math.round(e.actual / i * 100)}%"></i>` : F}
                </span>
                <span class="hour">${e.hour}</span>
              </button>
            `;
		})}
        </div>
      </section>
    `;
	}
	_renderFine() {
		let e = (e) => e === void 0 ? void 0 : `${K(e)} kWh`, t = this._energy("pv_today"), n = this._energy("forecast_today"), r = this._energy("grid_import_today"), i = this._energy("grid_export_today"), a = this._value("savings_month"), o = this._cellDelta(), s = this._value("inverter_temperature"), c = this._value("grid_frequency"), l = (e) => e === void 0 ? "—" : K(e), u = [
			["Solar hôm nay", t === void 0 ? void 0 : n === void 0 ? e(t) : `${K(t)} / ${K(n)} kWh`],
			["Tiết kiệm tháng", a === void 0 ? void 0 : `${K(a, 0)} đ`],
			["Tải hôm nay", e(this._energy("load_today"))],
			["Mua / phát", r === void 0 && i === void 0 ? void 0 : `${l(r)} / ${l(i)} kWh`],
			["Lệch cell", o === void 0 ? void 0 : `${K(o, 0)} mV`],
			["Nhiệt biến tần", s === void 0 ? void 0 : `${K(s, 0)} ${this._temperatureUnit()}`],
			["Tần số lưới", c === void 0 ? void 0 : `${K(c)} Hz`]
		].filter((e) => e[1] !== void 0);
		return u.length ? N`<dl class="fine">${u.map(([e, t]) => N`<div><dt>${e}</dt><dd>${t}</dd></div>`)}</dl>` : F;
	}
	_renderFan() {
		let e = this._entity("fan"), t = this._entity("fan_auto"), { ids: n, rpm: r } = this._fanRpm();
		if (!e && !n.length) return F;
		let i = e?.st.state === "on" ? "Đang chạy" : "—";
		return N`
      <div class="control">
        <button class="about" @click=${() => this._openEntity(e?.cfg.entity ?? n[0])}>
          <span>Quạt tản nhiệt</span><b>${e?.st.state === "off" ? "Tắt" : r === void 0 ? i : `${K(r, 0)} vòng/phút`}</b>
        </button>
        ${t ? N`<button
              class="opt"
              aria-pressed=${t.st.state === "on" ? "true" : "false"}
              ?disabled=${t.st.state !== "on" && t.st.state !== "off"}
              @click=${() => this._perform(t.cfg.entity, { action: "toggle" })}
            >
              Tự động
            </button>` : F}
      </div>
    `;
	}
	_renderEod() {
		let e = this._entity("eod");
		if (!e) return F;
		let t = e.cfg.entity, n = this._config?.eod_levels ?? We, r = this._value("eod"), i = (e) => this._perform(t, {
			action: "perform-action",
			perform_action: `${t.split(".")[0]}.set_value`,
			target: { entity_id: t },
			data: { value: e },
			confirmation: { text: `Đặt EOD lưới = ${e}%? Pin sẽ xả tới ${e}% mới lấy lưới.` }
		});
		return N`
      <div class="control">
        <button class="about" @click=${() => this._moreInfo("eod")}>
          <span>EOD lưới</span>${r === void 0 ? N`<b>—</b>` : n.includes(r) ? F : N`<b>${K(r, 0)}%</b>`}
        </button>
        <div class="opts" role="group" aria-label="Đặt EOD lưới">
          ${n.map((e) => N`<button
              class="opt"
              aria-pressed=${e === r ? "true" : "false"}
              ?disabled=${r === void 0}
              @click=${() => e !== r && i(e)}
            >
              ${e}%
            </button>`)}
        </div>
      </div>
    `;
	}
	_renderControls() {
		let e = this._renderFan(), t = this._renderEod();
		return e === F && t === F ? F : N`<div class="controls">${e} ${t}</div>`;
	}
	shouldUpdate(e) {
		let t = e.get("hass");
		return e.size !== 1 || !t || !this._config || t.themes?.darkMode !== this.hass?.themes?.darkMode || Object.values(this._config.entities).flat().some((e) => {
			let n = Q(e)?.entity;
			return n !== void 0 && t.states[n] !== this.hass?.states[n];
		});
	}
	willUpdate() {
		let e = this._config?.theme ?? "auto", t = e === "auto" ? this.hass?.themes?.darkMode ?? matchMedia("(prefers-color-scheme: dark)").matches : e === "dark";
		this.dataset.mode = t ? "dark" : "light";
	}
	render() {
		if (!this._config) return F;
		let e = this.now ?? /* @__PURE__ */ new Date(), t = this._config.threshold ?? 10, n = this._gridOnline(), r = {
			pv: this._power("pv"),
			battery: this._power("battery"),
			grid: this._power("grid") ?? (n === !1 && this._config.entities.grid ? 0 : void 0),
			load: this._power("load")
		}, i = this._unread(r), a = G(r), o = Te(r), s = this._value("battery_soc"), c = this._config.battery_capacity, l = s !== void 0 && c && a !== void 0 ? ke(s, c, this._config.battery_reserve ?? 0, a) : void 0, u = s !== void 0 && c ? Ae(s, c, Math.max(0, -(r.battery ?? 0))) : void 0, d = this._energy("grid_import_today"), f = this._energy("load_today"), ee = d !== void 0 && f ? Math.max(0, Math.round((1 - d / f) * 100)) : void 0, p = i ? void 0 : Me({
			power: r,
			flows: o,
			threshold: t,
			gridOnline: n,
			runtime: l,
			fullIn: u
		});
		return N`
      <ha-card>
        <div class="page">
          ${this._renderBand(e, n)}
          ${this._alerts().map((e) => N`<p class="alert">${e}</p>`)}
          <section class="live">
            ${this._renderSources(r)} ${this._renderHero(a, i ? void 0 : o)} ${this._renderReserve(l, n, ee)}
          </section>
          ${p ? N`<p class="say"><b>${p.lead}</b> ${p.rest ?? ""}</p>` : F}
          ${this._config.compact ? F : N`${this._renderHours(e)} ${this._renderFine()}`} ${this._renderControls()}
        </div>
      </ha-card>
    `;
	}
	updated(e) {
		this._syncFlows(), (e.has("hass") || e.has("_config")) && this._maybeFetchHistory();
	}
	_syncFlows() {
		let e = matchMedia("(prefers-reduced-motion: reduce)").matches;
		for (let t of this.renderRoot.querySelectorAll(".flow")) {
			let n = t.dataset.key, r = Number(t.dataset.rate), i = this._animations.get(n);
			!e && t.animate && (i && i.effect.target === t || (i?.cancel(), i = t.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -15 }], {
				duration: 1e3,
				iterations: Infinity
			}), this._animations.set(n, i)), i.effect?.updateTiming({ direction: t.dataset.reverse ? "reverse" : "normal" }), r > 0 ? (i.updatePlaybackRate(r), i.playState !== "running" && i.play()) : i.pause());
		}
	}
	async _maybeFetchHistory() {
		let e = Q(this._config?.entities.pv)?.entity;
		if (!e || !this.hass || this._config?.compact || Date.now() - this._lastFetch < Ve) return;
		this._lastFetch = Date.now();
		let t = this.now ?? /* @__PURE__ */ new Date();
		try {
			this._hourly = Pe(await Ne(this.hass, e, t), t, this._scale("pv"));
		} catch (e) {
			console.warn("solar-almanac-card: không đọc được lịch sử", e);
		}
	}
};
X($, "properties", {
	hass: { attribute: !1 },
	now: { attribute: !1 },
	_config: { state: !0 },
	_hourly: { state: !0 },
	_focusHour: { state: !0 }
}), X($, "styles", [Re, o`
      :host {
        display: block;
      }
      ha-card {
        display: block;
        overflow: hidden;
        background: var(--sac-surface);
        color: var(--sac-fg);
        container-type: inline-size;
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-variant-numeric: tabular-nums;
      }
      /* Mọi kích thước tính theo --u: card rộng ra thì chữ lớn theo để đọc từ xa. */
      .page {
        --u: clamp(0.92px, 0.2427cqi, 1.7px);
        font-size: calc(var(--u) * 14);
        line-height: 1.4;
      }
      button {
        all: unset;
        box-sizing: border-box;
        cursor: pointer;
      }
      button:focus-visible {
        outline: calc(var(--u) * 2) solid var(--sac-fg);
        outline-offset: calc(var(--u) * 1);
      }
      .num {
        font-family: 'SAC Numerals', 'Arial Narrow', var(--ha-font-family-body, Roboto, sans-serif);
        font-weight: 700;
      }
      .band {
        display: flex;
        align-items: baseline;
        gap: calc(var(--u) * 10);
        padding: calc(var(--u) * 9) calc(var(--u) * 14);
        background: var(--sac-band);
        color: var(--sac-on-band);
        font-weight: 500;
      }
      .title {
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .state {
        margin-left: auto;
        white-space: nowrap;
      }
      .state.down {
        background: var(--sac-on-band);
        color: var(--sac-band);
        font-weight: 700;
        border-radius: calc(var(--u) * 4);
        padding: 0 calc(var(--u) * 7);
      }
      .live {
        display: grid;
        grid-template-columns: calc(var(--u) * 112) minmax(calc(var(--u) * 16), 1fr) calc(var(--u) * 158) auto;
        align-items: stretch;
        padding: calc(var(--u) * 12) calc(var(--u) * 14) calc(var(--u) * 4);
      }
      .sources {
        display: grid;
        grid-auto-rows: 1fr;
        min-width: 0;
      }
      .row {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 0;
        padding: calc(var(--u) * 3) 0;
      }
      .label,
      .reserve dt {
        font-size: max(11px, calc(var(--u) * 12));
        color: var(--sac-dim);
        white-space: nowrap;
      }
      .label i {
        display: inline-block;
        width: calc(var(--u) * 9);
        height: calc(var(--u) * 9);
        border-radius: calc(var(--u) * 2);
        margin-right: calc(var(--u) * 4);
      }
      .row .num,
      .reserve dd {
        font-size: calc(var(--u) * 23);
        line-height: 1.05;
        white-space: nowrap;
      }
      .soc {
        display: block;
        height: calc(var(--u) * 3);
        margin-top: calc(var(--u) * 3);
        width: 76%;
        background: var(--sac-border);
        border-radius: calc(var(--u) * 2);
        overflow: hidden;
      }
      .soc span {
        display: block;
        height: 100%;
        background: var(--sac-battery);
      }
      .links {
        position: relative;
      }
      .links svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .track,
      .flow {
        fill: none;
        vector-effect: non-scaling-stroke;
      }
      .track {
        stroke: var(--sac-border);
        stroke-width: 1px;
      }
      .flow {
        stroke-width: 3.5px;
        stroke-linecap: round;
        stroke-dasharray: 0.1 ${14.9};
      }
      .flow.idle {
        display: none;
      }
      .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 0;
        text-align: center;
        font-size: calc(var(--u) * 13);
        color: var(--sac-dim);
      }
      .hero .num {
        font-size: calc(var(--u) * 92);
        line-height: 1.08;
        letter-spacing: -0.02em;
        color: var(--sac-fg);
      }
      .mix {
        display: flex;
        gap: calc(var(--u) * 2);
        width: 84%;
        height: calc(var(--u) * 6);
        margin-top: calc(var(--u) * 5);
      }
      .mix i {
        min-width: calc(var(--u) * 3);
        border-radius: calc(var(--u) * 2);
      }
      dl,
      dd {
        margin: 0;
      }
      .reserve {
        display: grid;
        grid-auto-rows: 1fr;
        align-items: center;
        box-sizing: border-box;
        width: calc(var(--u) * 84);
        padding-left: calc(var(--u) * 4);
        min-width: 0;
      }
      .reserve small {
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-size: calc(var(--u) * 12);
        font-weight: 500;
      }
      .alert {
        margin: 0;
        padding: calc(var(--u) * 5) calc(var(--u) * 14);
        background: var(--sac-on-band);
        color: var(--sac-band);
        border-bottom: 1px solid var(--sac-band);
        font-size: calc(var(--u) * 13.5);
        font-weight: 600;
      }
      .say {
        margin: calc(var(--u) * 6) calc(var(--u) * 14) calc(var(--u) * 12);
        text-align: center;
        font-size: calc(var(--u) * 14.5);
        text-wrap: balance;
      }
      .say b {
        font-weight: 600;
      }
      .hours {
        padding: 0 calc(var(--u) * 14);
      }
      .hours:last-child {
        padding-bottom: calc(var(--u) * 14);
      }
      .hours-head {
        display: flex;
        justify-content: space-between;
        gap: calc(var(--u) * 10);
        margin-bottom: calc(var(--u) * 5);
        font-size: calc(var(--u) * 12.5);
        color: var(--sac-dim);
      }
      .hours-head b {
        color: var(--sac-fg);
        font-weight: 600;
        white-space: nowrap;
      }
      .hours-head b.legend {
        color: var(--sac-dim);
        font-weight: 400;
      }
      .cells {
        display: grid;
        grid-template-columns: repeat(var(--count), minmax(0, 1fr));
        gap: calc(var(--u) * 2);
        touch-action: pan-y;
      }
      .cell {
        display: block;
        grid-row: 2;
        text-align: center;
      }
      .tile {
        position: relative;
        display: block;
        height: calc(var(--u) * 40);
        border-radius: calc(var(--u) * 3);
        overflow: hidden;
        background: color-mix(in oklch, var(--sac-solar) var(--level), var(--sac-surface));
      }
      .tile i {
        position: absolute;
        inset: auto 0 0;
        background: var(--sac-solar);
      }
      .window {
        grid-row: 1;
        justify-self: center;
        box-sizing: border-box;
        width: max-content;
        min-width: 100%;
        padding: calc(var(--u) * 2) calc(var(--u) * 4);
        border-radius: calc(var(--u) * 3);
        background: var(--sac-fg);
        color: var(--sac-surface);
        font-size: max(11px, calc(var(--u) * 12));
        font-weight: 600;
        line-height: 1.25;
        text-align: center;
        white-space: nowrap;
      }
      .cell.now .tile {
        outline: calc(var(--u) * 2) solid var(--sac-fg);
        outline-offset: calc(var(--u) * 1);
      }
      .hour {
        display: block;
        margin-top: calc(var(--u) * 3);
        font-size: max(11px, calc(var(--u) * 11));
        color: var(--sac-dim);
      }
      .fine {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: calc(var(--u) * 3) calc(var(--u) * 16);
        margin: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 12);
        padding-top: calc(var(--u) * 9);
        border-top: 1px solid var(--sac-border);
        font-size: calc(var(--u) * 12.5);
        color: var(--sac-dim);
      }
      .fine div:first-child {
        grid-column: 1 / -1;
      }
      .fine div {
        display: flex;
        justify-content: space-between;
        gap: calc(var(--u) * 8);
      }
      .fine dt {
        white-space: nowrap;
      }
      .fine dd {
        color: var(--sac-fg);
        font-weight: 500;
        white-space: nowrap;
      }
      .controls {
        display: grid;
        gap: calc(var(--u) * 4);
        margin: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 12);
        padding-top: calc(var(--u) * 9);
        border-top: 1px solid var(--sac-border);
        font-size: calc(var(--u) * 12.5);
        color: var(--sac-dim);
      }
      .fine + .controls {
        margin-top: 0;
      }
      .control {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: calc(var(--u) * 8);
      }
      .about {
        display: flex;
        gap: calc(var(--u) * 8);
        min-width: 0;
        white-space: nowrap;
      }
      .about b {
        color: var(--sac-fg);
        font-weight: 500;
      }
      .opts {
        display: flex;
        gap: calc(var(--u) * 4);
      }
      .opt {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: calc(var(--u) * 46);
        /* Không thấp hơn 36px để bấm bằng ngón tay trên điện thoại. */
        height: max(36px, calc(var(--u) * 32));
        padding: 0 calc(var(--u) * 9);
        border: 1px solid var(--sac-border);
        border-radius: calc(var(--u) * 3);
        color: var(--sac-fg);
        font-weight: 500;
      }
      .opt[aria-pressed='true'] {
        background: var(--sac-fg);
        border-color: var(--sac-fg);
        color: var(--sac-surface);
        font-weight: 600;
      }
      .opt:disabled {
        cursor: default;
        color: var(--sac-dim);
      }
      @media (hover: hover) {
        .row:hover .label,
        button.hero:hover span:not(.mix),
        .about:hover span,
        .cell:hover .hour {
          color: var(--sac-fg);
        }
        .opt:not(:disabled):hover {
          border-color: var(--sac-fg);
        }
      }
      @container (max-width: 367px) {
        .live {
          grid-template-columns: calc(var(--u) * 112) minmax(calc(var(--u) * 6), 1fr) calc(var(--u) * 158);
        }
        .reserve {
          grid-column: 1 / -1;
          width: auto;
          grid-auto-flow: column;
          grid-auto-columns: minmax(0, 1fr);
          padding: calc(var(--u) * 8) 0 0;
        }
        .title {
          display: none;
        }
        .cell:nth-of-type(even) .hour {
          visibility: hidden;
        }
        .fine {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `]), customElements.get(Z) || (customElements.define(Z, $), window.customCards = window.customCards || [], window.customCards.push({
	type: Z,
	name: "Solar Almanac",
	description: "Luồng năng lượng và giờ tốt dùng tải lớn, trình bày như một tờ lịch",
	preview: !0
}), console.info("%c SOLAR-ALMANAC-CARD %c v0.2.0 ", "background:#c4302b;color:#fff", "background:#333;color:#fff"));
export { $ as SolarAlmanacCard };
