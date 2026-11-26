// ../solar-almanac-card/node_modules/@lit/reactive-element/css-tag.js
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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, g = h.trustedTypes, _ = g ? g.emptyScript : "", ee = h.reactiveElementPolyfillSupport, v = (e, t) => e, y = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? _ : null;
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
}, b = (e, t) => !l(e, t), x = {
	attribute: !0,
	type: String,
	converter: y,
	reflect: !1,
	useDefault: !1,
	hasChanged: b
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var S = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = x) {
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
		return this.elementProperties.get(e) ?? x;
	}
	static _$Ei() {
		if (this.hasOwnProperty(v("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(v("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(v("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
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
			let i = (n.converter?.toAttribute === void 0 ? y : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? y : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? b)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
S.elementStyles = [], S.shadowRootOptions = { mode: "open" }, S[v("elementProperties")] = /* @__PURE__ */ new Map(), S[v("finalized")] = /* @__PURE__ */ new Map(), ee?.({ ReactiveElement: S }), (h.reactiveElementVersions ??= []).push("2.1.2");
// ../solar-almanac-card/node_modules/lit-html/lit-html.js
var C = globalThis, w = (e) => e, T = C.trustedTypes, E = T ? T.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, D = "$lit$", O = `lit$${Math.random().toFixed(9).slice(2)}$`, te = "?" + O, ne = `<${te}>`, k = document, A = () => k.createComment(""), j = (e) => e === null || typeof e != "object" && typeof e != "function", re = Array.isArray, ie = (e) => re(e) || typeof e?.[Symbol.iterator] == "function", ae = "[ 	\n\f\r]", M = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, oe = /-->/g, se = />/g, N = RegExp(`>|${ae}(?:([^\\s"'>=/]+)(${ae}*=${ae}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ce = /'/g, le = /"/g, ue = /^(?:script|style|textarea|title)$/i, de = (e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}), P = de(1), F = de(2), I = Symbol.for("lit-noChange"), L = Symbol.for("lit-nothing"), fe = /* @__PURE__ */ new WeakMap(), R = k.createTreeWalker(k, 129);
function pe(e, t) {
	if (!re(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return E === void 0 ? t : E.createHTML(t);
}
var me = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = M;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === M ? c[1] === "!--" ? o = oe : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = N) : (ue.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = N) : o = se : o === N ? c[0] === ">" ? (o = i ?? M, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? N : c[3] === "\"" ? le : ce) : o === le || o === ce ? o = N : o === oe || o === se ? o = M : (o = N, i = void 0);
		let d = o === N && e[t + 1].startsWith("/>") ? " " : "";
		a += o === M ? n + ne : l >= 0 ? (r.push(s), n.slice(0, l) + D + n.slice(l) + O + d) : n + O + (l === -2 ? t : d);
	}
	return [pe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, z = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = me(t, n);
		if (this.el = e.createElement(l, r), R.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = R.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(D)) {
					let t = u[o++], n = i.getAttribute(e).split(O), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? _e : r[1] === "?" ? ve : r[1] === "@" ? ye : V
					}), i.removeAttribute(e);
				} else e.startsWith(O) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ue.test(i.tagName)) {
					let e = i.textContent.split(O), t = e.length - 1;
					if (t > 0) {
						i.textContent = T ? T.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], A()), R.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], A());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === te) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(O, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += O.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = k.createElement("template");
		return n.innerHTML = e, n;
	}
};
function B(e, t, n = e, r) {
	if (t === I) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = j(t) ? void 0 : t._$litDirective$;
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? k).importNode(t, !0);
		R.currentNode = r;
		let i = R.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new ge(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new be(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = R.nextNode(), a++);
		}
		return R.currentNode = k, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, ge = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = L, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = B(this, e, t), j(e) ? e === L || e == null || e === "" ? (this._$AH !== L && this._$AR(), this._$AH = L) : e !== this._$AH && e !== I && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ie(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== L && j(this._$AH) ? this._$AA.nextSibling.data = e : this.T(k.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = z.createElement(pe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new he(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = fe.get(e.strings);
		return t === void 0 && fe.set(e.strings, t = new z(e)), t;
	}
	k(t) {
		re(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(A()), this.O(A()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = w(e).nextSibling;
			w(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, V = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = L, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = L;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = B(this, e, t, 0), a = !j(e) || e !== this._$AH && e !== I, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = B(this, r[n + o], t, o), s === I && (s = this._$AH[o]), a ||= !j(s) || s !== this._$AH[o], s === L ? e = L : e !== L && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === L ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, _e = class extends V {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === L ? void 0 : e;
	}
}, ve = class extends V {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== L);
	}
}, ye = class extends V {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = B(this, e, t, 0) ?? L) === I) return;
		let n = this._$AH, r = e === L && n !== L || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== L && (n === L || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, be = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		B(this, e);
	}
}, xe = C.litHtmlPolyfillSupport;
xe?.(z, ge), (C.litHtmlVersions ??= []).push("3.3.3");
var Se = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new ge(t.insertBefore(A(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ce = globalThis, H = class extends S {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Se(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return I;
	}
};
H._$litElement$ = !0, H.finalized = !0, Ce.litElementHydrateSupport?.({ LitElement: H });
var we = Ce.litElementPolyfillSupport;
we?.({ LitElement: H }), (Ce.litElementVersions ??= []).push("4.2.2");
// src/font.ts
var Te = "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";
function Ee() {
	if (document.getElementById("sac-font")) return;
	let e = document.createElement("style");
	e.id = "sac-font", e.textContent = `@font-face{font-family:'SAC Numerals';font-weight:700;font-display:swap;src:url(data:font/woff2;base64,${Te}) format('woff2')}`, document.head.appendChild(e);
}
// src/flows.ts
function De(e) {
	if (e.load !== void 0) return e.load;
	if (e.pv !== void 0 && e.battery !== void 0 && e.grid !== void 0) return Math.max(0, e.pv + e.battery + e.grid);
}
function Oe(e) {
	let t = Math.max(0, e.pv ?? 0), n = Math.max(0, De(e) ?? 0), r = Math.max(0, e.battery ?? 0), i = Math.max(0, -(e.battery ?? 0)), a = Math.max(0, e.grid ?? 0), o = Math.max(0, -(e.grid ?? 0)), s = Math.min(t, n), c = Math.min(r, n - s), l = Math.min(a, Math.max(0, n - s - c)), u = t - s, d = Math.min(u, i);
	return {
		solarHome: s,
		batteryHome: c,
		gridHome: l,
		solarBattery: d,
		solarGrid: Math.min(u - d, o),
		gridBattery: Math.min(Math.max(0, i - d), Math.max(0, a - l))
	};
}
var ke = "vi-VN";
function U(e, t = 1) {
	return e.toLocaleString(ke, {
		minimumFractionDigits: t,
		maximumFractionDigits: t
	});
}
function W(e) {
	let t = Math.abs(e);
	return t >= 1e3 ? `${U(t / 1e3, 2)}\u00a0kW` : `${Math.round(t)}\u00a0W`;
}
function G(e) {
	let t = Math.abs(e);
	return t < 1e3 ? {
		value: String(Math.round(t)),
		unit: "W"
	} : {
		value: U(t / 1e3, t >= 1e4 ? 1 : 2),
		unit: "kW"
	};
}
function Ae(e) {
	let t = 2.5 - Math.log10(Math.abs(e) + 1) * .5;
	return Math.max(.4, Math.min(2.5, t));
}
function je(e, t, n, r) {
	if (!(r < 50)) return t * Math.max(0, e - n) / 100 / (r / 1e3);
}
function Me(e, t, n) {
	if (!(n < 50 || e >= 100)) return t * (100 - e) / 100 / (n / 1e3);
}
function Ne(e) {
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
function Pe({ power: e, flows: t, threshold: n, gridOnline: r, runtime: i, fullIn: a }) {
	let o = De(e);
	if (o === void 0) return;
	let s = (e) => Math.round(e / Math.max(o, 1) * 100);
	if (r === !1) return {
		lead: "Đang mất lưới,",
		rest: i === void 0 ? `nhà đang dùng ${W(o)}.` : `pin còn chạy khoảng ${U(i)} giờ.`
	};
	if (t.solarGrid > n) return {
		lead: "Dư điện:",
		rest: `đang phát ${W(t.solarGrid)} lên lưới.`
	};
	if (t.solarBattery > n) {
		let t = a === void 0 ? "" : ` Đầy sau khoảng ${U(a)} giờ.`;
		return {
			lead: "Nắng dư,",
			rest: `đang sạc pin ${W(e.battery ?? 0)}.${t}`
		};
	}
	if (t.gridBattery > n) return {
		lead: "Lưới đang sạc pin",
		rest: `${W(t.gridBattery)}.`
	};
	let c = t.solarHome > n, l = t.batteryHome > n, u = t.gridHome > n;
	if (c && (l || u)) {
		let e = [l && `pin bù ${W(t.batteryHome)}`, u && `lưới bù ${W(t.gridHome)}`].filter(Boolean);
		return {
			lead: `Solar cấp ${s(t.solarHome)}% tải,`,
			rest: `${e.join(", ")}.`
		};
	}
	if (l && u) return {
		lead: `Pin đang gánh ${s(t.batteryHome)}% tải,`,
		rest: `lưới bù ${W(t.gridHome)}.`
	};
	let d = (e) => o - e <= n;
	return l ? { lead: d(t.batteryHome) ? "Pin đang gánh cả nhà." : `Pin đang gánh ${s(t.batteryHome)}% tải.` } : u ? { lead: d(t.gridHome) ? "Nhà đang dùng điện lưới." : `Lưới cấp ${s(t.gridHome)}% tải.` } : c ? { lead: d(t.solarHome) ? "Solar đủ cho cả nhà." : `Solar cấp ${s(t.solarHome)}% tải.` } : o > n ? void 0 : { lead: "Không có dòng công suất đáng kể." };
}
// src/history.ts
function K(e) {
	return new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
}
async function Fe(e, t, n) {
	if (!e.callWS) throw Error("hass.callWS không khả dụng");
	return (await e.callWS({
		type: "history/history_during_period",
		start_time: new Date(K(n)).toISOString(),
		end_time: n.toISOString(),
		entity_ids: [t],
		minimal_response: !0,
		no_attributes: !0
	}))[t] ?? [];
}
function Ie(e, t, n) {
	let r = K(t), i = Array(24).fill(0), a = Array(24).fill(0);
	for (let t of e) {
		let e = typeof t.s == "string" ? parseFloat(t.s) : NaN;
		if (Number.isNaN(e) || typeof t.lu != "number") continue;
		let o = /* @__PURE__ */ new Date(t.lu * 1e3);
		if (K(o) !== r) continue;
		let s = o.getHours();
		i[s] += e * n, a[s] += 1;
	}
	let o = /* @__PURE__ */ new Map(), s = 0;
	for (let e = 0; e <= t.getHours(); e++) a[e] && (s = i[e] / a[e]), o.set(e, s);
	return o;
}
var Le = [
	"detailedHourly",
	"detailedForecast",
	"watts"
];
function Re(e) {
	return Array.isArray(e) ? e.filter((e) => e && typeof e == "object").map((e) => [e.period_start ?? e.datetime ?? e.time, e.pv_estimate === void 0 ? Number(e.watts ?? e.power) : Number(e.pv_estimate) * 1e3]) : e && typeof e == "object" ? Object.entries(e).map(([e, t]) => [e, Number(t)]) : [];
}
function ze(e, t) {
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
	for (let [i, a] of Re(e)) {
		let e = new Date(i);
		if (Number.isNaN(e.getTime()) || Number.isNaN(a) || K(e) !== K(t)) continue;
		let o = e.getHours();
		n.set(o, (n.get(o) ?? 0) + a), r.set(o, (r.get(o) ?? 0) + 1);
	}
	return new Map([...n].map(([e, t]) => [e, t / r.get(e)]));
}
// src/theme.ts
var Be = o`
  :host {
    --sac-surface: #fffaf9;
    --sac-border: #e5d3d1;
    --sac-dim: #7d5a56;
    --sac-fg: #443331;
    --sac-solar: #ac7a00;
    --sac-battery: #009655;
    --sac-grid: #0085e3;
    --sac-band: #c4302b;
    --sac-alert: #c4302b;
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
    --sac-alert: #8f1f1b;
    --sac-on-band: #ffffff;
    color-scheme: dark;
  }
  /* band: neutral: băng đổi màu, cảnh báo vẫn đỏ nhờ --sac-alert. Chữ trắng trên băng đạt 6,3:1 và 7,9:1. */
  :host([data-band='neutral']) {
    --sac-band: #5b6068;
  }
  :host([data-mode='dark'][data-band='neutral']) {
    --sac-band: #4d5259;
  }
`;
// \0@oxc-project+runtime@0.156.0/helpers/esm/typeof.js
function q(e) {
	"@babel/helpers - typeof";
	return q = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, q(e);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/toPrimitive.js
function Ve(e, t) {
	if (q(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (q(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/toPropertyKey.js
function He(e) {
	var t = Ve(e, "string");
	return q(t) == "symbol" ? t : t + "";
}
// \0@oxc-project+runtime@0.156.0/helpers/esm/defineProperty.js
function J(e, t, n) {
	return (t = He(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
// src/solar-almanac-card.ts
var Ue = "solar-almanac-card", We = 3e5, Ge = 60, Ke = .8, Y = 18, qe = [6, 17], X = {
	wh: .001,
	mwh: 1e3
}, Je = [
	10,
	20,
	30
], Ye = [
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
], Z = {
	solar: F`<svg viewBox="0 0 32 32"><path d="M5 20 9 6h18l-4 14Z M7 13h18 M15 6l-4 14 M21 6l-4 14 M14 20v6 M10 26h8"></path></svg>`,
	grid: F`<svg viewBox="0 0 32 32"><path d="M16 3 9 29 M16 3l7 26 M6 9h20 M8 15h16 M7 9v2.5 M25 9v2.5 M10.6 23l8.6-8 M21.4 23l-8.6-8"></path></svg>`,
	home: F`<svg viewBox="0 0 32 32"><path d="M4 15 16 4l12 11 M7 12.5V28h18V12.5 M17.5 12.5 13 19.5h4.5L15 25"></path></svg>`,
	inverter: F`<svg viewBox="0 0 32 32"><rect x="5" y="3" width="22" height="26" rx="3"></rect><rect x="9.5" y="7" width="13" height="6" rx="1"></rect><path d="M9.5 21.5c2.2-3.6 4.3-3.6 6.5 0s4.3 3.6 6.5 0"></path></svg>`
};
function Xe(e, t) {
	let n = e.filter((t, n) => n === 0 || Math.hypot(t[0] - e[n - 1][0], t[1] - e[n - 1][1]) > .5);
	if (n.length < 2) return "";
	let r = (e) => e.toFixed(1), i = `M${r(n[0][0])} ${r(n[0][1])}`;
	for (let e = 1; e < n.length - 1; e++) {
		let [a, o, s] = [
			n[e - 1],
			n[e],
			n[e + 1]
		], c = Math.hypot(o[0] - a[0], o[1] - a[1]), l = Math.hypot(s[0] - o[0], s[1] - o[1]), u = Math.min(t, c / 2, l / 2), d = [o[0] - (o[0] - a[0]) / c * u, o[1] - (o[1] - a[1]) / c * u], f = [o[0] + (s[0] - o[0]) / l * u, o[1] + (s[1] - o[1]) / l * u];
		i += `L${r(d[0])} ${r(d[1])}Q${r(o[0])} ${r(o[1])} ${r(f[0])} ${r(f[1])}`;
	}
	let a = n[n.length - 1];
	return `${i}L${r(a[0])} ${r(a[1])}`;
}
function Q(e) {
	if (e) return typeof e == "string" ? { entity: e } : e;
}
var $ = class extends H {
	constructor(...e) {
		super(...e), J(this, "_animations", /* @__PURE__ */ new Map()), J(this, "_lastFetch", 0), J(this, "_resize", void 0);
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
		super.connectedCallback(), Ee(), this.requestUpdate();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		for (let e of this._animations.values()) e.cancel();
		this._animations.clear(), this._resize?.disconnect(), this._resize = void 0;
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
		return t === void 0 ? void 0 : t * (X[this._unit(e)] ?? 1);
	}
	_cellDelta() {
		let e = this._value("cell_delta");
		return e !== void 0 && this._unit("cell_delta") === "v" ? e * 1e3 : e;
	}
	_temperatureUnit() {
		return this._entity("inverter_temperature")?.st.attributes.unit_of_measurement || "°C";
	}
	_unread(e) {
		return Ye.some(({ key: t }) => this._config?.entities[t] && e[t] === void 0);
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
		let n = this._entity(e)?.st.attributes, r = (this._config?.forecast_attribute ? [this._config.forecast_attribute] : Le).find((e) => n?.[e] !== void 0);
		return ze(r ? n?.[r] : void 0, t);
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
		]].flatMap(([e, t, n, r]) => t === void 0 || n === void 0 || t <= n ? [] : [`${e} ${U(t, 0)} ${r}, vượt ngưỡng ${U(n, 0)} ${r}`]);
		return this._entity("fan_stall")?.st.state === "on" && e.push("Quạt tản nhiệt bị kẹt, cần kiểm tra"), e;
	}
	_hourCells(e) {
		let t = this._forecast("forecast_today", e), n = this._forecast("forecast_tomorrow", new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1)), r = Ne(t), i = n.size > 0 && (!r || e.getHours() >= r.end), a = i ? n : t, o = i ? Ne(n) : r, s = i ? void 0 : this._hourly, c = Math.max(0, ...a.values()), l = [...a].filter(([, e]) => e >= c * .02 && e > 0).map(([e]) => e);
		for (let [e, t] of s ?? []) t > 50 && l.push(e);
		let [u, d] = l.length ? [Math.min(...l), Math.max(...l)] : qe, f = [];
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
		let n = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(e), r = `${String(e.getDate()).padStart(2, "0")}/${String(e.getMonth() + 1).padStart(2, "0")}`, i = this._value("grid_voltage"), a = this._config?.layout === "inverter" && !!this._config.entities.grid, o = i !== void 0 && !a ? ` · ${Math.round(i)} V` : "", s = (e, t) => this._config?.entities.grid_voltage ? P`<button class=${t} @click=${() => this._moreInfo("grid_voltage")}>${e}</button>` : P`<span class=${t}>${e}</span>`;
		return P`
      <header class="band">
        <span class="date">${n.charAt(0).toUpperCase() + n.slice(1)} ${r}</span>
        ${this._config?.title ? P`<span class="title">${this._config.title}</span>` : L}
        ${t === !1 ? s("Mất lưới", "state down") : t || o ? s(`${t ? "Có lưới" : "Lưới"}${o}`, "state") : L}
      </header>
    `;
	}
	_renderLead(e, t, n) {
		let r = this._config?.entities, i = this._config?.threshold ?? 10, a = [];
		if (r?.pv) {
			let t = this._energy("pv_today"), n = this._energy("forecast_today"), r = e.pv === void 0 ? void 0 : G(e.pv), i = t === void 0 ? void 0 : n === void 0 ? `${U(t)} kWh` : `${U(t)} / ${U(n)} kWh`, o = t !== void 0 && n ? t / n * 100 : void 0;
			a.push(P`
        <div class="stat">
          <button class="main" @click=${() => this._moreInfo("pv")}>
            <span class="label"><i style="background:var(--sac-solar)"></i>Solar</span>
            ${this._figure(r)}
          </button>
          ${this._gauge(o, "var(--sac-solar)")} ${i ? P`<span class="sub">${i}</span>` : L}
        </div>
      `);
		}
		if (r?.battery) {
			let t = this._value("battery_soc"), n = e.battery, r = n !== void 0 && Math.abs(n) > i, o = t === void 0 ? n === void 0 ? void 0 : G(n) : {
				value: String(Math.round(t)),
				unit: "%"
			}, s = n === void 0 ? "—" : r ? `${n > 0 ? "xả" : "sạc"} ${W(n)}` : "đang nghỉ";
			a.push(P`
        <div class="stat">
          <button class="main" @click=${() => this._moreInfo(t === void 0 ? "battery" : "battery_soc")}>
            <span class="label"><i style="background:var(--sac-battery)"></i>Pin</span>
            ${this._figure(o)}
          </button>
          ${this._gauge(t, "var(--sac-battery)")}
          <button class="sub" @click=${() => this._moreInfo("battery")}>${s}</button>
        </div>
      `);
		}
		let { mix: o, origin: s } = this._homeMix(t, n), c = P`
      <span class="label">Nhà đang dùng</span>
      ${this._figure(t === void 0 ? void 0 : G(t))}
    `;
		return a.push(P`
      <div class="stat">
        ${r?.load ? P`<button class="main" @click=${() => this._moreInfo("load")}>${c}</button>` : P`<div class="main">${c}</div>`}
        ${o.length ? P`<span class="mix">${o.map((e) => P`<i style="flex:${e.w} 1 0;background:${e.color}"></i>`)}</span>` : P`<span class="gauge"></span>`}
        ${s ? P`<span class="sub">${s}</span>` : L}
      </div>
    `), P`<section class="lead" style="--cols:${a.length}">${a}</section>`;
	}
	_homeMix(e, t) {
		let n = this._config?.threshold ?? 10, r = t ? [
			{
				name: "Solar",
				w: t.solarHome,
				color: "var(--sac-solar)"
			},
			{
				name: "pin",
				w: t.batteryHome,
				color: "var(--sac-battery)"
			},
			{
				name: "lưới",
				w: t.gridHome,
				color: "var(--sac-grid)"
			}
		].filter((e) => e.w > 0) : [], i = t ? (e ?? 0) - r.reduce((e, t) => e + t.w, 0) : 0, a = [...r].sort((e, t) => t.w - e.w)[0], o = a && e && e > n && a.w >= i ? `${Math.round(a.w / e * 100)}% từ ${a.name}` : void 0;
		return {
			mix: i > n ? [...r, {
				name: "",
				w: i,
				color: "var(--sac-border)"
			}] : r,
			origin: o,
			top: a
		};
	}
	_mixBar(e) {
		return e.length ? P`<span class="mix">${e.map((e) => P`<i style="flex:${e.w} 1 0;background:${e.color}"></i>`)}</span>` : P`<span class="gauge"></span>`;
	}
	_renderFlow(e, t, n) {
		let r = this._config?.entities, i = this._config?.threshold ?? 10, a = this._config?.flow_max_power ?? 5e3, o = !!r?.pv, s = !!r?.grid, c = !!r?.battery, l = c && !s, u = c && s, d = (e, t, n, r, o, s) => {
			let c = t !== void 0 && Math.abs(t) > i, l = c ? 2 + 6 * Math.sqrt(Math.min(1, Math.abs(t) / a)) : 1;
			return P`
        <span class="wire ${r} ${c ? "on" : ""}" style="grid-area:${s};--wire:${l.toFixed(1)}px;--wire-color:${n}" aria-hidden="true">
          <i class="dots" data-key=${e} data-axis=${r} data-rate=${c ? 1 / Ae(t) : 0} data-reverse=${o ? "" : "1"}></i>
        </span>
      `;
		}, f = (e) => P`<i style="background:${e}"></i>`, { mix: p, origin: m, top: h } = this._homeMix(t, n), g = this._value("battery_soc"), _ = e.battery, ee = _ === void 0 ? "—" : _ !== void 0 && Math.abs(_) > i ? `${_ > 0 ? "xả" : "sạc"} ${W(_)}` : "đang nghỉ", v = this._energy("pv_today"), y = this._energy("forecast_today"), b = v === void 0 ? void 0 : y === void 0 ? `${U(v)} kWh` : `${U(v)} / ${U(y)} kWh`, x = e.grid, S = x !== void 0 && Math.abs(x) > i, C = this._energy("grid_import_today"), w = this._energy("grid_export_today"), T = [C === void 0 ? "" : `mua ${U(C)}`, w ? `phát ${U(w)}` : ""].filter(Boolean).join(" · "), E = P`
      <button class="main" @click=${() => this._moreInfo(g === void 0 ? "battery" : "battery_soc")}>
        <span class="label">${f("var(--sac-battery)")}Pin</span>
        ${this._figure(g === void 0 ? _ === void 0 ? void 0 : G(_) : {
			value: String(Math.round(g)),
			unit: "%"
		})}
      </button>
      ${this._gauge(g, "var(--sac-battery)")}
      <button class="sub" @click=${() => this._moreInfo("battery")}>${ee}</button>
    `, D = o ? this._config?.mppts ?? [] : [];
		return P`
      <section class="map" style="grid-template-areas:${[
			o ? "\"pv pv pv pv pv\"" : "",
			o ? "\". . ws . .\"" : "",
			`"${s ? "grid wg" : l ? "bat wb" : ". ."} hub wh home"`,
			u ? "\". . wb . .\"" : "",
			u ? "\"bat bat bat bat bat\"" : ""
		].filter(Boolean).join(" ")}">
        ${o ? P`
              <div class="axis" style="grid-area:pv">
                ${D.length ? this._renderMppts(D.slice(0, Math.ceil(D.length / 2)), 0, "left", d) : L}
                <div class="node">
                  <button class="main" @click=${() => this._moreInfo("pv")}>
                    <span class="label">${f("var(--sac-solar)")}Solar</span>
                    ${this._figure(e.pv === void 0 ? void 0 : G(e.pv))}
                  </button>
                  ${this._gauge(v !== void 0 && y ? v / y * 100 : void 0, "var(--sac-solar)")}
                  ${b ? P`<span class="sub">${b}</span>` : L}
                </div>
                ${D.length > 1 ? this._renderMppts(D.slice(Math.ceil(D.length / 2)), Math.ceil(D.length / 2), "right", d) : L}
              </div>
              ${d("pv", e.pv, "var(--sac-solar)", "v", !0, "ws")}
            ` : L}
        ${s ? P`
              <div class="node side" style="grid-area:grid">
                <button class="main" @click=${() => this._moreInfo("grid")}>
                  <span class="label">${f("var(--sac-grid)")}Lưới${S ? x > 0 ? " · mua" : " · phát" : ""}</span>
                  ${this._figure(x === void 0 ? void 0 : G(x))}
                </button>
                ${T ? P`<button class="sub" @click=${() => this._moreInfo("grid_import_today")}>${T} kWh</button>` : L}
              </div>
              ${d("grid", x, "var(--sac-grid)", "h", (x ?? 0) >= 0, "wg")}
            ` : L}
        ${c ? P`
              <div class=${l ? "node side" : "axis"} style="grid-area:bat">
                ${l ? E : P`<div class="node">${E}</div>`}
              </div>
              ${l ? d("battery", _, "var(--sac-battery)", "h", (_ ?? 0) >= 0, "wb") : d("battery", _, "var(--sac-battery)", "v", (_ ?? 0) < 0, "wb")}
            ` : L}
        <span class="hub" style="grid-area:hub" aria-hidden="true">
          ${F`<svg viewBox="0 0 24 24"><path d="M4 12c2.7-5.3 5.3-5.3 8 0s5.3 5.3 8 0"></path></svg>`}
        </span>
        ${d("home", t, h?.color ?? "var(--sac-fg)", "h", !0, "wh")}
        <div class="node side home" style="grid-area:home">
          ${r?.load ? P`<button class="main" @click=${() => this._moreInfo("load")}>
                <span class="label">Nhà đang dùng</span>${this._figure(t === void 0 ? void 0 : G(t))}
              </button>` : P`<div class="main"><span class="label">Nhà đang dùng</span>${this._figure(t === void 0 ? void 0 : G(t))}</div>`}
          ${this._mixBar(p)} ${m ? P`<span class="sub">${m}</span>` : L}
        </div>
      </section>
    `;
	}
	_link(e, t) {
		return this._config?.entities[e] ? P`<button class="lk" @click=${() => this._moreInfo(e)}>${t}</button>` : t;
	}
	_energyPair(e, t) {
		let n = this._energy(e), r = this._energy(t);
		if (n === void 0 && r === void 0) return;
		let i = (e) => e === void 0 ? "—" : U(e);
		return P`${this._link(e, i(n))} / ${this._link(t, `${i(r)} kWh`)}`;
	}
	_meterText() {
		if (!this._config?.entities.grid_meter_today) return;
		let e = this._energy("grid_meter_today");
		return e === void 0 ? "mất kết nối" : `${U(e)} kWh`;
	}
	_kv(e, t) {
		return t === void 0 ? L : P`<div class="kv"><span>${e}</span> <b>${t}</b></div>`;
	}
	_box(e, t, n, r) {
		let i = P`${r ? P`<span class="word">${r}</span>` : L}${e === void 0 ? L : P`<b class="num">${e}</b>`}`;
		return n && this._config?.entities[n] ? P`<button class="val" style="--c:${t}" @click=${() => this._moreInfo(n)}>${i}</button>` : P`<span class="val" style="--c:${t}">${i}</span>`;
	}
	_batteryNote(e, t) {
		if (e !== void 0) return {
			label: t ? "Pin còn" : "Nếu mất điện",
			value: `~${U(e)} giờ`
		};
	}
	_renderInverter(e, t, n, r, i, a) {
		let o = this._config?.entities, s = this._config?.threshold ?? 10, c = this._config?.flow_max_power ?? 5e3, l = !!o?.pv, u = !!o?.grid, d = !!o?.battery, f = l ? this._config?.mppts ?? [] : [], p = [], m = (e, t, n, r = !1) => p.push({
			id: e,
			w: t,
			color: n,
			reverse: r
		}), h = L;
		if (l) {
			let t = this._energy("pv_today"), n = this._energy("forecast_today"), r = this._energy("forecast_tomorrow"), i = t === void 0 ? void 0 : n === void 0 ? `${U(t)} kWh` : `${U(t)} / ${U(n)} kWh`;
			f.forEach((e, t) => {
				let n = this._read(e.power);
				m(`mppt${t}`, n.v === void 0 ? void 0 : n.v * (n.unit === "kw" ? 1e3 : 1), "var(--sac-solar)", (n.v ?? 0) < 0);
			}), m("pv", e.pv, "var(--sac-solar)", (e.pv ?? 0) < 0), h = P`
        <div class="part solar" style="grid-area:solar">
          <div class="head">
            <span class="icon" data-anchor=${f.length ? "pv-icon" : "pv"} style="color:var(--sac-solar)">${Z.solar}</span>
            <div class="text">
              <div class="headline">
                <span class="label">Solar</span>
                ${this._box(e.pv === void 0 ? "—" : W(e.pv), "var(--sac-solar)", "pv")}
              </div>
              ${i ? P`${this._gauge(t !== void 0 && n ? t / n * 100 : void 0, "var(--sac-solar)")}` : L}
              ${this._kv("Hôm nay", i ? this._link("pv_today", i) : void 0)}
              ${this._kv("Ngày mai", r === void 0 ? void 0 : this._link("forecast_tomorrow", `${Math.round(r)} kWh`))}
            </div>
          </div>
          ${f.length ? P`<div class="pvs" style="--n:${f.length}">
                ${f.map((e, t) => {
				let n = this._read(e.power), r = n.v === void 0 ? void 0 : n.v * (n.unit === "kw" ? 1e3 : 1), i = this._read(e.voltage).v, a = this._read(e.current).v, o = this._read(e.energy_today), s = o.v === void 0 ? void 0 : o.v * (X[o.unit] ?? 1), c = [i === void 0 ? "" : `${U(i, i >= 100 ? 0 : 1)} V`, a === void 0 ? "" : `${U(a, 1)} A`].filter(Boolean).join(" · ");
				return P`
                    <button class="pv" data-anchor="mppt${t}" @click=${() => this._openEntity(n.id)}>
                      <span class="label">${e.name ?? `PV${t + 1}`}</span>
                      <b class="num">${r === void 0 ? "—" : W(r)}</b>
                      ${c ? P`<span class="sub">${c}</span>` : L}
                      ${s === void 0 ? L : P`<span class="sub">${U(s)} kWh</span>`}
                    </button>
                  `;
			})}
              </div>` : L}
        </div>
      `;
		}
		let g = L;
		if (d) {
			let t = this._value("battery_soc"), n = e.battery, a = n !== void 0 && Math.abs(n) > s, o = this._batteryNote(r, i === !1 || !u), c = this._cellDelta(), l = t === void 0 ? 0 : Math.min(100, Math.max(0, t));
			m("bat", n, "var(--sac-battery)", (n ?? 0) < 0), g = P`
        <div class="part bat" style="grid-area:bat">
          <div class="text">
            <button class="main" @click=${() => this._moreInfo(t === void 0 ? "battery" : "battery_soc")}>
              <span class="label">Pin</span>
              ${t === void 0 ? L : P`<b class="num soc">${Math.round(t)}<small>%</small></b>`}
            </button>
            ${a && n !== void 0 ? this._box(W(n), "var(--sac-battery)", "battery", n > 0 ? "xả" : "sạc") : this._box(void 0, "var(--sac-battery)", "battery", n === void 0 ? "—" : "đang nghỉ")}
            ${this._kv("Sạc / xả hôm nay", this._energyPair("battery_charge_today", "battery_discharge_today"))}
            ${o ? this._kv(o.label, this._link("battery_soc", o.value)) : L}
            ${this._kv("Lệch cell", c === void 0 ? void 0 : this._link("cell_delta", `${U(c, 0)} mV`))}
          </div>
          <span class="icon battery" data-anchor="bat" aria-hidden="true">
            ${F`<svg viewBox="0 0 24 40">
              <rect class="body" x="3" y="5" width="18" height="33" rx="3"></rect>
              <rect class="cap" x="8" y="1.5" width="8" height="3.5" rx="1"></rect>
              <rect class="level" x="6" y=${35 - 27 * l / 100} width="12" height=${27 * l / 100} rx="1"></rect>
            </svg>`}
          </span>
        </div>
      `;
		}
		let _ = L;
		if (u) {
			let t = e.grid, n = t !== void 0 && Math.abs(t) > s, r = this._value("grid_voltage"), a = this._value("grid_frequency"), c = [r === void 0 ? void 0 : this._link("grid_voltage", `${Math.round(r)} V`), a === void 0 ? void 0 : this._link("grid_frequency", `${U(a)} Hz`)].filter((e) => e !== void 0), l = this._meterText();
			m("grid", t, "var(--sac-grid)", (t ?? 0) < 0), _ = P`
        <div class="part grid" style="grid-area:grid">
          <span class="icon" data-anchor="grid" style="color:${i === !1 ? "var(--sac-dim)" : "var(--sac-grid)"}">${Z.grid}</span>
          <div class="text">
            <span class="label">${i === !1 ? "Lưới · mất" : `Lưới${n ? t > 0 ? " · mua" : " · phát" : ""}`}</span>
            ${this._box(t === void 0 ? "—" : W(t), "var(--sac-grid)", "grid")}
            ${this._kv(o?.grid_meter_today ? "Biến tần mua / phát" : "Mua / phát hôm nay", this._energyPair("grid_import_today", "grid_export_today"))}
            ${this._kv(this._config?.grid_meter_label ?? "Công tơ tổng", l === void 0 ? void 0 : this._link("grid_meter_today", l))}
            ${c.length ? P`<div class="kv"><b>${c.map((e, t) => P`${t ? " · " : ""}${e}`)}</b></div>` : L}
          </div>
        </div>
      `;
		}
		let { mix: ee, origin: v, top: y } = this._homeMix(t, n), b = this._energy("load_today");
		m("home", t, y?.color ?? "var(--sac-fg)");
		let x = P`
      <div class="part home" style="grid-area:home">
        <span class="icon" data-anchor="home" style="color:var(--sac-fg)">${Z.home}</span>
        <div class="text">
          <span class="label">Nhà đang dùng</span>
          ${this._box(t === void 0 ? "—" : W(t), "var(--sac-fg)", o?.load ? "load" : void 0)}
          ${this._mixBar(ee)} ${v ? P`<span class="sub">${v}</span>` : L}
          ${this._kv("Tải hôm nay", b === void 0 ? void 0 : this._link("load_today", `${U(b)} kWh`))}
          ${this._kv("Tự cấp", a === void 0 ? void 0 : this._link("grid_import_today", `${a}%`))}
        </div>
      </div>
    `, S = this._value("inverter_temperature"), C = S !== void 0 && this._config?.inverter_temperature_warn !== void 0 && S > this._config.inverter_temperature_warn, w = P`
      <div class="part inv" style="grid-area:inv">
        <span class="icon" data-anchor="inv">${Z.inverter}</span>
        ${S === void 0 ? L : P`<button class="lk temp ${C ? "hot" : ""}" @click=${() => this._moreInfo("inverter_temperature")}>
              ${U(S, 0)} ${this._temperatureUnit()}
            </button>`}
      </div>
    `;
		return P`
      <section class="rig" style="grid-template-areas:${[l ? `"solar solar ${u ? "home" : "."}"` : u ? "\". . home\"" : "", `"${d ? "bat" : "."} inv ${u ? "grid" : "home"}"`].filter(Boolean).join(" ")}">
        ${F`<svg class="wires" aria-hidden="true">
          ${p.map(({ id: e, w: t, color: n, reverse: r }) => {
			let i = t !== void 0 && Math.abs(t) > s, a = `--c:${n};--w:${(i ? 2 + 4 * Math.sqrt(Math.min(1, Math.abs(t) / c)) : 1).toFixed(1)}px`;
			return F`
              <path class="track ${i ? "on" : ""}" data-wire=${e} style=${a}></path>
              <path
                class="flow solo ${i ? "" : "idle"}"
                pathLength="100"
                data-wire=${e}
                data-key=${`i-${e}`}
                data-rate=${i ? 1 / Ae(t) : 0}
                data-reverse=${r ? "1" : ""}
                style=${a}
              ></path>
            `;
		})}
        </svg>`}
        ${h} ${g} ${w} ${x} ${_}
      </section>
    `;
	}
	_layoutWires() {
		let e = this.renderRoot.querySelector(".rig");
		if (!e) return;
		let t = e.getBoundingClientRect(), n = (n) => {
			let r = e.querySelector(`[data-anchor="${n}"]`);
			if (!r) return;
			let i = r.getBoundingClientRect(), a = i.left - t.left, o = i.top - t.top;
			return {
				l: a,
				t: o,
				r: a + i.width,
				b: o + i.height,
				cx: a + i.width / 2,
				cy: o + i.height / 2,
				h: i.height
			};
		}, r = n("inv");
		if (!r) return;
		let i = (e, t, n = (e[0] + t[0]) / 2) => Math.abs(e[1] - t[1]) < 2 ? [[e[0], t[1]], t] : [
			e,
			[n, e[1]],
			[n, t[1]],
			t
		], a = /* @__PURE__ */ new Map(), o = [...e.querySelectorAll("[data-anchor^=\"mppt\"]")].map((e) => n(e.dataset.anchor)), s = n("pv"), c = e.querySelector(".part.solar");
		if (c && (o.length || s)) {
			let n = parseFloat(getComputedStyle(e).rowGap) || 0, i = c.getBoundingClientRect().bottom - t.top + n / 2;
			o.forEach((e, t) => a.set(`mppt${t}`, [
				[e.cx, e.b],
				[e.cx, i],
				[r.cx, i]
			])), a.set("pv", s ? [
				[s.cx, s.b],
				[s.cx, i],
				[r.cx, i],
				[r.cx, r.t]
			] : [[r.cx, i], [r.cx, r.t]]);
		}
		let l = n("bat");
		l && a.set("bat", i([l.r, l.cy], [r.l, r.cy]));
		let u = n("grid");
		u && a.set("grid", i([u.l, u.cy], [r.r, r.cy]));
		let d = n("home");
		if (d) {
			let e = u ? [r.r, r.t + r.h * .22] : [r.r, r.cy];
			a.set("home", i(e, [d.l, d.cy], u ? (r.r + d.l) / 2 : void 0));
		}
		e.querySelector(".wires")?.setAttribute("viewBox", `0 0 ${t.width} ${t.height}`);
		for (let t of e.querySelectorAll("path[data-wire]")) {
			let e = a.get(t.dataset.wire);
			t.setAttribute("d", e ? Xe(e, 6) : "");
		}
		this._syncFlows();
	}
	_read(e) {
		let t = Q(e), n = t && this.hass?.states[t.entity], r = parseFloat(n?.state ?? ""), i = String(n?.attributes.unit_of_measurement ?? "").toLowerCase();
		return {
			id: t?.entity,
			v: Number.isNaN(r) ? void 0 : t?.invert ? -r : r,
			unit: i
		};
	}
	_renderMppts(e, t, n, r) {
		return P`
      <div class="mppts ${n}">
        ${e.map((e, i) => {
			let a = t + i, o = this._read(e.power), s = o.v === void 0 ? void 0 : o.v * (o.unit === "kw" ? 1e3 : 1), c = this._read(e.voltage).v, l = this._read(e.current).v, u = this._read(e.energy_today), d = u.v === void 0 ? void 0 : u.v * (X[u.unit] ?? 1), f = [c === void 0 ? "" : `${U(c, c >= 100 ? 0 : 1)} V`, l === void 0 ? "" : `${U(l, 1)} A`].filter(Boolean).join(" · ");
			return P`
            <div class="mppt">
              <button class="box" @click=${() => this._openEntity(o.id)}>
                <span class="label">${e.name ?? `PV${a + 1}`}</span>
                <b class="num">${s === void 0 ? "—" : W(s)}</b>
                ${f ? P`<span class="sub">${f}</span>` : L}
                ${d === void 0 ? L : P`<span class="sub">${U(d)} kWh</span>`}
              </button>
              ${r(`mppt${a}`, s, "var(--sac-solar)", "h", n === "left", "auto")}
            </div>
          `;
		})}
      </div>
    `;
	}
	_figure(e) {
		return P`<b class="num">${e?.value ?? "—"}${e ? P`<small>${e.unit}</small>` : L}</b>`;
	}
	_gauge(e, t) {
		return P`<span class="gauge"><span style="width:${e === void 0 ? 0 : Math.min(100, Math.max(0, e))}%;background:${t}"></span></span>`;
	}
	_renderLinks(e) {
		let t = this._config?.entities, n = this._config?.threshold ?? 10, r = +!!t?.pv + +!!t?.battery + 1, i = (e) => (e + .5) / r * 300, a = i(r - 1), o = (e, t, n) => `M${e} ${n}C${e} ${t} ${e + 12} ${t} ${e + 24} ${t}L${a - 24} ${t}C${a - 12} ${t} ${a} ${t} ${a} 0`;
		return P`
      <div class="links">
        ${F`
          <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
            ${Ye.filter(({ key: e }) => t?.[e]).map(({ key: t, color: r }, a) => {
			let s = t === "grid" ? o(36, 16, 24) : o(i(a), t === "pv" ? 8 : 12, 0), c = e[t] ?? 0, l = Math.abs(c) > n;
			return F`
                <path class="track" d=${s}></path>
                <path
                  class="flow ${l ? "" : "idle"}"
                  d=${s}
                  stroke=${r}
                  data-key=${t}
                  data-rate=${l ? 1 / Ae(c) : 0}
                  data-reverse=${c < 0 ? "1" : ""}
                ></path>
              `;
		})}
          </svg>
        `}
      </div>
    `;
	}
	_renderReserve(e, t, n, r) {
		let i = this._config?.entities, a = this._config?.threshold ?? 10, o = this._energy("forecast_tomorrow"), s = n === !1 || !i?.grid, c = e.grid, l = c === void 0 || Math.abs(c) <= a ? "" : c > 0 ? " · mua" : " · phát", u = this._config?.layout === "inverter", d = [
			t !== void 0 && !(u && i?.battery) ? {
				label: s ? "Pin còn" : "Nếu mất điện",
				value: `~${U(t)}`,
				unit: "giờ",
				key: "battery_soc"
			} : void 0,
			r !== void 0 && !u ? {
				label: "Tự cấp",
				value: `${r}%`,
				key: "grid_import_today"
			} : void 0,
			o !== void 0 && !(u && i?.pv) ? {
				label: "Ngày mai",
				value: `${Math.round(o)}`,
				unit: "kWh",
				key: "forecast_tomorrow"
			} : void 0
		].filter((e) => e !== void 0), f = !!i?.grid && this._config?.layout !== "flow" && !u;
		return !d.length && !f ? L : P`
      <dl class="reserve">
        ${f ? P`<div>
              <dt><i style="background:var(--sac-grid)"></i>Lưới${l}</dt>
              <dd class="num"><button class="fact" @click=${() => this._moreInfo("grid")}>${c === void 0 ? "—" : W(c)}</button></dd>
            </div>` : L}
        ${d.map((e) => P`<div><dt>${e.label}</dt><dd class="num"><button class="fact" @click=${() => this._moreInfo(e.key)}>${e.value}${e.unit ? P` <small>${e.unit}</small>` : L}</button></dd></div>`)}
      </dl>
    `;
	}
	_renderHours(e) {
		let { cells: t, tomorrow: n, window: r } = this._hourCells(e), i = Math.max(1, ...t.map((e) => Math.max(e.forecast ?? 0, e.actual ?? 0))), a = t.some((e) => e.forecast !== void 0), o = t.some((e) => e.actual);
		if (!a && !o) return L;
		let s = a && o ? "Nền dự báo · Cột thực" : a ? "Nền: dự báo" : "Cột: thực tế", c = t.find((e) => e.hour === this._focusHour), l = c ? [
			`${c.hour}h`,
			c.forecast === void 0 ? "" : `Dự báo ${W(c.forecast)}`,
			c.actual === void 0 ? "" : `Thực ${W(c.actual)}`
		].filter(Boolean).join(" · ") : s, u = t.findIndex((e) => e.good), d = t.filter((e) => e.good).length;
		return P`
      <section class="hours" aria-label="Sản lượng theo giờ">
        <div class="hours-head">
          <span>${r ? `Giờ tốt dùng tải lớn${n ? " ngày mai" : ""}` : "Solar theo giờ"}</span>
          <b class=${c ? "" : "legend"}>${l}</b>
        </div>
        <div class="cells" style="--count:${t.length}">
          ${r && d ? P`<div class="window" style="grid-column:${u + 1} / span ${d}">${r.start}–${r.end}h</div>` : L}
          ${t.map((e) => {
			let t = (e.forecast ?? 0) / i, n = `${e.hour} giờ${e.good ? ", giờ tốt" : ""}${e.forecast === void 0 ? "" : `, dự báo ${W(e.forecast)}`}${e.actual === void 0 ? "" : `, thực ${W(e.actual)}`}`;
			return P`
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
                  ${e.actual ? P`<i style="height:${Math.round(e.actual / i * 100)}%"></i>` : L}
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
		let e = this._energy("load_today"), t = e === void 0 ? void 0 : `${U(e)} kWh`, n = this._value("savings_month"), r = this._cellDelta(), i = this._value("inverter_temperature"), a = this._value("grid_frequency"), o = this._meterText(), s = (e) => e === void 0 ? "—" : U(e), c = (e, t, n = "") => this._config?.entities[e] ? P`<button class="fact ${n}" @click=${() => this._moreInfo(e)}>${t}</button>` : t, l = (e, t) => {
			let n = this._energy(e), r = this._energy(t);
			return n === void 0 && r === void 0 ? void 0 : P`${c(e, s(n), "left")} / ${c(t, `${s(r)} kWh`, "right")}`;
		}, u = this._config?.layout === "inverter", d = this._config?.entities, f = [
			[this._config?.savings_label ?? "Tiết kiệm tháng", n === void 0 ? void 0 : c("savings_month", `${U(n, 0)} đ`)],
			[
				"Tải hôm nay",
				t === void 0 ? void 0 : c("load_today", t),
				!0
			],
			[
				"Mua / phát",
				l("grid_import_today", "grid_export_today"),
				!!d?.grid
			],
			[
				this._config?.grid_meter_label ?? "Công tơ tổng",
				o === void 0 ? void 0 : c("grid_meter_today", o),
				!!d?.grid
			],
			[
				"Sạc / xả hôm nay",
				l("battery_charge_today", "battery_discharge_today"),
				!!d?.battery
			],
			[this._config?.battery_period_label ?? "Sạc / xả tháng", l("battery_charge_period", "battery_discharge_period")],
			[
				"Lệch cell",
				r === void 0 ? void 0 : c("cell_delta", `${U(r, 0)} mV`),
				!!d?.battery
			],
			[
				"Nhiệt biến tần",
				i === void 0 ? void 0 : c("inverter_temperature", `${U(i, 0)} ${this._temperatureUnit()}`),
				!0
			],
			[
				"Tần số lưới",
				a === void 0 ? void 0 : c("grid_frequency", `${U(a)} Hz`),
				!!d?.grid
			]
		].filter((e) => e[1] !== void 0 && !(u && e[2]));
		return f.length ? P`<dl class="fine">${f.map(([e, t]) => P`<div><dt>${e}</dt><dd>${t}</dd></div>`)}</dl>` : L;
	}
	_renderFan() {
		let e = this._entity("fan"), t = this._entity("fan_auto"), { ids: n, rpm: r } = this._fanRpm();
		if (!e && !n.length) return L;
		let i = e?.st.state === "on" ? "Đang chạy" : "—";
		return P`
      <div class="control">
        <button class="about" @click=${() => this._openEntity(e?.cfg.entity ?? n[0])}>
          <span>Quạt tản nhiệt</span><b>${e?.st.state === "off" ? "Tắt" : r === void 0 ? i : `${U(r, 0)} vòng/phút`}</b>
        </button>
        ${t ? P`<button
              class="opt"
              aria-pressed=${t.st.state === "on" ? "true" : "false"}
              ?disabled=${t.st.state !== "on" && t.st.state !== "off"}
              @click=${() => this._perform(t.cfg.entity, { action: "toggle" })}
            >
              Tự động
            </button>` : L}
      </div>
    `;
	}
	_renderEod() {
		let e = this._entity("eod");
		if (!e) return L;
		let t = e.cfg.entity, n = this._config?.eod_levels ?? Je, r = this._value("eod"), i = (e) => this._perform(t, {
			action: "perform-action",
			perform_action: `${t.split(".")[0]}.set_value`,
			target: { entity_id: t },
			data: { value: e },
			confirmation: { text: `Đặt EOD lưới = ${e}%? Pin sẽ xả tới ${e}% mới lấy lưới.` }
		});
		return P`
      <div class="control">
        <button class="about" @click=${() => this._moreInfo("eod")}>
          <span>EOD lưới</span>${r === void 0 ? P`<b>—</b>` : n.includes(r) ? L : P`<b>${U(r, 0)}%</b>`}
        </button>
        <div class="opts" role="group" aria-label="Đặt EOD lưới">
          ${n.map((e) => P`<button
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
		return e === L && t === L ? L : P`<div class="controls">${e} ${t}</div>`;
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
		this.dataset.mode = t ? "dark" : "light", this.dataset.band = this._config?.band ?? "red", this.dataset.motion = this._motion();
	}
	render() {
		if (!this._config) return L;
		let e = this.now ?? /* @__PURE__ */ new Date(), t = this._config.threshold ?? 10, n = this._gridOnline(), r = {
			pv: this._power("pv"),
			battery: this._power("battery"),
			grid: this._power("grid") ?? (n === !1 && this._config.entities.grid ? 0 : void 0),
			load: this._power("load")
		}, i = this._unread(r), a = De(r), o = Oe(r), s = this._value("battery_soc"), c = this._config.battery_capacity, l = s !== void 0 && c && a !== void 0 ? je(s, c, this._config.battery_reserve ?? 0, a) : void 0, u = s !== void 0 && c ? Me(s, c, Math.max(0, -(r.battery ?? 0))) : void 0, d = this._energy("grid_import_today"), f = this._energy("load_today"), p = d !== void 0 && f ? Math.max(0, Math.round((1 - d / f) * 100)) : void 0, m = i ? void 0 : Pe({
			power: r,
			flows: o,
			threshold: t,
			gridOnline: n,
			runtime: l,
			fullIn: u
		});
		return P`
      <ha-card>
        <div class="page">
          ${this._renderBand(e, n)}
          ${this._alerts().map((e) => P`<p class="alert">${e}</p>`)}
          ${this._config.layout === "inverter" ? this._renderInverter(r, a, i ? void 0 : o, l, n, p) : this._config.layout === "flow" ? this._renderFlow(r, a, i ? void 0 : o) : P`${this._renderLead(r, a, i ? void 0 : o)} ${this._renderLinks(r)}`}
          ${this._renderReserve(r, l, n, p)}
          ${m ? P`<p class="say"><b>${m.lead}</b> ${m.rest ?? ""}</p>` : L}
          ${this._config.compact ? L : P`${this._renderHours(e)} ${this._renderFine()}`} ${this._renderControls()}
        </div>
      </ha-card>
    `;
	}
	updated(e) {
		this._watchRig(), this._layoutWires(), this._syncFlows(), (e.has("hass") || e.has("_config")) && this._maybeFetchHistory();
	}
	_watchRig() {
		let e = this.renderRoot.querySelector(".rig");
		if (e) {
			this._resize ??= new ResizeObserver(() => this._layoutWires());
			for (let t of [e, ...e.querySelectorAll(".part, [data-anchor]")]) this._resize.observe(t);
		}
	}
	_motion() {
		let e = this._config?.animation;
		return e === !0 || e === "on" ? "on" : e === !1 || e === "off" ? "off" : "auto";
	}
	_syncFlows() {
		let e = this._motion(), t = e === "off" || e === "auto" && matchMedia("(prefers-reduced-motion: reduce)").matches;
		for (let e of this.renderRoot.querySelectorAll(".flow, .dots")) {
			let n = e.classList.contains("dots"), r = e.classList.contains("solo"), i = `${n ? "w" : "f"}-${e.dataset.key}`, a = Number(e.dataset.rate), o = r && a > 0 ? e.getTotalLength() : 0, s = r && a > 0 ? 1 / Math.max(Ke, o / (Ge * a)) : a, c = this._animations.get(i);
			if (t || !e.animate) c?.cancel(), this._animations.delete(i);
			else {
				if (!c || c.effect.target !== e) {
					c?.cancel();
					let t = n ? e.dataset.axis === "v" ? [{ backgroundPosition: "50% 0px" }, { backgroundPosition: `50% ${Y}px` }] : [{ backgroundPosition: "0px 50%" }, { backgroundPosition: `${Y}px 50%` }] : [{ strokeDashoffset: 0 }, { strokeDashoffset: r ? -100 : -15 }];
					c = e.animate(t, {
						duration: 1e3,
						iterations: Infinity
					}), this._animations.set(i, c);
				}
				c.effect?.updateTiming({ direction: e.dataset.reverse ? "reverse" : "normal" }), s > 0 ? (c.updatePlaybackRate(s), c.playState !== "running" && c.play()) : c.pause();
			}
		}
	}
	async _maybeFetchHistory() {
		let e = Q(this._config?.entities.pv)?.entity;
		if (!e || !this.hass || this._config?.compact || Date.now() - this._lastFetch < We) return;
		this._lastFetch = Date.now();
		let t = this.now ?? /* @__PURE__ */ new Date();
		try {
			this._hourly = Ie(await Fe(this.hass, e, t), t, this._scale("pv"));
		} catch (e) {
			console.warn("solar-almanac-card: không đọc được lịch sử", e);
		}
	}
};
J($, "properties", {
	hass: { attribute: !1 },
	now: { attribute: !1 },
	_config: { state: !0 },
	_hourly: { state: !0 },
	_focusHour: { state: !0 }
}), J($, "styles", [Be, o`
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
        outline: max(2px, calc(var(--u) * 2)) solid var(--sac-fg);
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
        color: var(--sac-alert);
        font-weight: 700;
        border-radius: calc(var(--u) * 4);
        padding: 0 calc(var(--u) * 7);
      }
      .lead {
        display: grid;
        grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
        gap: calc(var(--u) * 12);
        padding: calc(var(--u) * 12) calc(var(--u) * 14) 0;
      }
      .stat {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .main {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .label,
      .reserve dt {
        font-size: max(12px, calc(var(--u) * 12));
        color: var(--sac-dim);
        white-space: nowrap;
      }
      .label i,
      .reserve dt i {
        display: inline-block;
        width: calc(var(--u) * 9);
        height: calc(var(--u) * 9);
        border-radius: calc(var(--u) * 2);
        margin-right: calc(var(--u) * 4);
      }
      .main .num {
        font-size: calc(var(--u) * 58);
        line-height: 1.08;
        letter-spacing: -0.02em;
        color: var(--sac-fg);
        white-space: nowrap;
      }
      .main small {
        margin-left: calc(var(--u) * 3);
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-size: calc(var(--u) * 14);
        font-weight: 500;
        letter-spacing: 0;
        color: var(--sac-dim);
      }
      .gauge,
      .mix {
        display: flex;
        height: calc(var(--u) * 5);
        margin-top: calc(var(--u) * 4);
      }
      .gauge {
        background: var(--sac-border);
        border-radius: calc(var(--u) * 2);
        overflow: hidden;
      }
      .gauge span {
        display: block;
        height: 100%;
      }
      .mix {
        gap: calc(var(--u) * 2);
      }
      .mix i {
        min-width: calc(var(--u) * 3);
        border-radius: calc(var(--u) * 2);
      }
      .sub {
        margin-top: calc(var(--u) * 4);
        font-size: max(12px, calc(var(--u) * 12.5));
        color: var(--sac-dim);
        white-space: nowrap;
      }
      .links {
        height: calc(var(--u) * 24);
        margin: calc(var(--u) * 5) calc(var(--u) * 14) calc(var(--u) * 2);
      }
      .links svg {
        display: block;
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
      /* ---- layout: flow ---- */
      .map {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(calc(var(--u) * 26), 0.8fr) auto minmax(calc(var(--u) * 26), 0.8fr) minmax(0, 1.15fr);
        align-items: center;
        padding: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 6);
      }
      .node {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-self: center;
        min-width: 0;
        text-align: center;
      }
      .node .main {
        align-items: center;
      }
      .node .gauge,
      .node .mix {
        align-self: stretch;
        min-width: calc(var(--u) * 92);
      }
      .node .main .num {
        font-size: calc(var(--u) * 32);
        line-height: 1;
      }
      .node.side .main .num {
        font-size: calc(var(--u) * 30);
      }
      .node.home .main .num {
        font-size: calc(var(--u) * 44);
      }
      .node .sub {
        margin-top: calc(var(--u) * 2);
      }
      .node.side {
        justify-self: stretch;
      }
      .node.side .gauge,
      .node.side .mix {
        min-width: 0;
      }
      /* Hàng Solar và hàng Pin: tỉ lệ hai bên = (1 + 0.8) và (0.8 + 1.15) của .map, để nút đứng thẳng trên/dưới ô biến tần. */
      .axis {
        display: grid;
        grid-template-columns: minmax(0, 1.8fr) auto minmax(0, 1.95fr);
        grid-template-areas: 'left mid right';
        align-items: center;
      }
      .axis > .node {
        grid-area: mid;
      }
      .mppts {
        display: flex;
        flex-direction: column;
        gap: calc(var(--u) * 6);
        min-width: 0;
      }
      .mppts.left {
        grid-area: left;
      }
      .mppts.right {
        grid-area: right;
      }
      .mppt {
        display: flex;
        align-items: stretch;
        min-width: 0;
      }
      .mppts.right .mppt {
        flex-direction: row-reverse;
      }
      .mppt .box {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 0 1 auto;
        box-sizing: border-box;
        min-width: 0;
        padding: calc(var(--u) * 5) calc(var(--u) * 8);
        border: 1px solid var(--sac-solar);
        border-radius: calc(var(--u) * 4);
        text-align: center;
      }
      .mppt .num {
        font-size: calc(var(--u) * 22);
        line-height: 1.05;
        white-space: nowrap;
      }
      .mppt .sub {
        margin-top: calc(var(--u) * 1);
        font-size: max(12px, calc(var(--u) * 12));
      }
      .mppt .wire.h {
        flex: 1 1 calc(var(--u) * 12);
        min-width: calc(var(--u) * 12);
        margin: 0 calc(var(--u) * 4);
      }
      .hub {
        display: grid;
        place-items: center;
        width: calc(var(--u) * 34);
        height: calc(var(--u) * 34);
        border: 1.5px solid var(--sac-dim);
        border-radius: calc(var(--u) * 4);
        color: var(--sac-dim);
      }
      .hub svg {
        width: 62%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
      }
      .wire {
        position: relative;
        display: block;
        align-self: stretch;
        justify-self: stretch;
      }
      .wire.v {
        min-height: calc(var(--u) * 22);
        margin: calc(var(--u) * 3) 0;
      }
      .wire.h {
        margin: 0 calc(var(--u) * 3);
      }
      .wire::before {
        content: '';
        position: absolute;
        background: var(--sac-border);
      }
      .wire.on::before {
        background: var(--wire-color);
        opacity: 0.45;
      }
      .wire.h::before {
        left: 0;
        right: 0;
        top: 50%;
        height: var(--wire);
        transform: translateY(-50%);
      }
      .wire.v::before {
        top: 0;
        bottom: 0;
        left: 50%;
        width: var(--wire);
        transform: translateX(-50%);
      }
      .dots {
        position: absolute;
        display: none;
        background-image: radial-gradient(circle closest-side, var(--wire-color) 85%, transparent 100%);
      }
      .wire.on .dots {
        display: block;
      }
      .wire.h .dots {
        left: 0;
        right: 0;
        top: 50%;
        height: calc(var(--wire) + 4px);
        transform: translateY(-50%);
        background-size: ${Y}px 100%;
        background-repeat: repeat-x;
      }
      .wire.v .dots {
        top: 0;
        bottom: 0;
        left: 50%;
        width: calc(var(--wire) + 4px);
        transform: translateX(-50%);
        background-size: 100% ${Y}px;
        background-repeat: repeat-y;
      }
      /* Giảm chuyển động (hoặc animation: off): bỏ chấm, dây đậm màu nguồn; animation: on thì vẫn chạy. */
      @media (prefers-reduced-motion: reduce) {
        :host(:not([data-motion='on'])) .dots {
          display: none !important;
        }
        :host(:not([data-motion='on'])) .wire.on::before {
          opacity: 1;
        }
      }
      :host([data-motion='off']) .dots {
        display: none !important;
      }
      :host([data-motion='off']) .wire.on::before {
        opacity: 1;
      }
      /* ---- layout: inverter (kiểu Sunsynk) ---- */
      .rig {
        /* Sơ đồ ba cột cần co thêm dưới mốc 0.92px của tờ giấy để vừa card điện thoại; chữ nhỏ có sàn 12px. */
        --u: clamp(0.78px, 0.2427cqi, 1.7px);
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        column-gap: calc(var(--u) * 10);
        row-gap: calc(var(--u) * 24);
        align-items: center;
        padding: calc(var(--u) * 12) calc(var(--u) * 14) calc(var(--u) * 10);
      }
      .rig .wires {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
      }
      .rig .track,
      .rig .flow {
        stroke: var(--c);
      }
      /* Dây nghỉ vẫn mang màu nguồn (nhạt) để nhìn ra nút nào nối với nút nào, như card Sunsynk. */
      .rig .track {
        stroke-width: 1.5px;
        opacity: 0.35;
      }
      .rig .track.on {
        stroke: var(--c);
        stroke-width: var(--w);
        opacity: 0.45;
      }
      /* Một hạt mỗi dây: nét đứt dài bằng cả dây (pathLength 100), đầu tròn thành hạt. */
      .rig .flow {
        stroke-width: calc(var(--w) + 4px);
        stroke-dasharray: 0.1 99.9;
      }
      @media (prefers-reduced-motion: reduce) {
        :host(:not([data-motion='on'])) .rig .flow {
          display: none;
        }
        :host(:not([data-motion='on'])) .rig .track.on {
          opacity: 1;
        }
      }
      :host([data-motion='off']) .rig .flow {
        display: none;
      }
      :host([data-motion='off']) .rig .track.on {
        opacity: 1;
      }
      .rig .part {
        position: relative;
        z-index: 1;
        min-width: 0;
      }
      .rig .part .text {
        display: flex;
        flex-direction: column;
        gap: calc(var(--u) * 3);
        min-width: 0;
      }
      .rig .icon {
        display: block;
        flex: none;
        width: calc(var(--u) * 32);
        height: calc(var(--u) * 32);
      }
      .rig .icon svg {
        display: block;
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .rig .val {
        display: inline-flex;
        align-self: flex-start;
        justify-content: center;
        min-width: calc(var(--u) * 64);
        padding: calc(var(--u) * 1) calc(var(--u) * 8);
        align-items: baseline;
        gap: calc(var(--u) * 4);
        border: 1.5px solid var(--c);
        border-radius: calc(var(--u) * 4);
        color: var(--sac-fg);
      }
      .rig .val .word {
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-size: max(12px, calc(var(--u) * 13));
        font-weight: 500;
        line-height: 1.15;
        white-space: nowrap;
      }
      .rig .val .num {
        font-size: calc(var(--u) * 22);
        line-height: 1.15;
        white-space: nowrap;
      }
      /* Nhãn và giá trị cùng một dòng chữ: nút số là liên kết nằm trong câu (WCAG 2.5.8, ngoại lệ inline). */
      .rig .kv {
        font-size: max(12px, calc(var(--u) * 12.5));
        line-height: 1.35;
        color: var(--sac-dim);
      }
      .rig .kv b {
        color: var(--sac-fg);
        font-weight: 500;
        white-space: nowrap;
      }
      .rig .lk {
        cursor: pointer;
      }
      .rig .gauge,
      .rig .mix {
        margin-top: 0;
      }
      .rig .sub {
        margin-top: 0;
        font-size: max(12px, calc(var(--u) * 12.5));
        white-space: normal;
      }
      /* Solar: đầu nút trên, các ô PV dưới, dây từ đáy từng ô chạy về biến tần. */
      .rig .solar {
        align-self: end;
      }
      .rig .solar .head {
        display: flex;
        gap: calc(var(--u) * 8);
        align-items: flex-start;
      }
      .rig .solar .head .text {
        flex: 1;
      }
      .rig .headline {
        display: flex;
        align-items: center;
        gap: calc(var(--u) * 8);
      }
      .rig .pvs {
        display: grid;
        grid-template-columns: repeat(var(--n), minmax(0, 1fr));
        gap: calc(var(--u) * 10);
        margin-top: calc(var(--u) * 10);
      }
      .rig .pv {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 0;
        padding: calc(var(--u) * 4) calc(var(--u) * 6);
        border: 1.5px solid var(--sac-solar);
        border-radius: calc(var(--u) * 4);
        text-align: center;
      }
      .rig .pv .num {
        font-size: calc(var(--u) * 20);
        line-height: 1.1;
        white-space: nowrap;
      }
      /* Nhiều MPPT thì ô hẹp: tên xuống dòng chứ không cắt. */
      .rig .pv .label {
        max-width: 100%;
        white-space: normal;
        text-wrap: balance;
      }
      .rig .pv .sub {
        font-size: max(12px, calc(var(--u) * 12));
        text-wrap: balance;
      }
      /* Pin: chữ căn phải, biểu tượng sát biến tần. */
      .rig .bat {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: calc(var(--u) * 8);
      }
      .rig .bat .text {
        align-items: flex-end;
        text-align: right;
      }
      .rig .bat .val {
        align-self: flex-end;
      }
      .rig .bat .main {
        align-items: flex-end;
      }
      .rig .main .soc {
        font-size: calc(var(--u) * 34);
        line-height: 1;
        color: var(--sac-fg);
      }
      .rig .soc small {
        margin-left: calc(var(--u) * 2);
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-size: max(12px, calc(var(--u) * 14));
        font-weight: 500;
        color: var(--sac-dim);
      }
      .rig .icon.battery {
        width: calc(var(--u) * 26);
        height: calc(var(--u) * 44);
        color: var(--sac-dim);
      }
      .rig .icon.battery .body {
        stroke-width: 1.8;
      }
      .rig .icon.battery .cap {
        fill: currentColor;
        stroke: none;
      }
      .rig .icon.battery .level {
        fill: var(--sac-battery);
        stroke: none;
      }
      /* Nhà, lưới: biểu tượng trái sát dây, chữ phải. */
      .rig .home,
      .rig .grid {
        display: flex;
        align-items: center;
        gap: calc(var(--u) * 8);
      }
      .rig .home .text,
      .rig .grid .text {
        flex: 1;
      }
      .rig .home .mix {
        align-self: stretch;
      }
      /* Biến tần: biểu tượng giữa ô, nhiệt độ treo dưới để dây ngang trúng tâm. */
      .rig .inv {
        display: grid;
        justify-items: center;
        margin: 0 calc(var(--u) * 6);
      }
      .rig .inv .icon {
        width: calc(var(--u) * 46);
        height: calc(var(--u) * 46);
        color: var(--sac-dim);
      }
      .rig .temp {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: calc(var(--u) * 3);
        font-size: max(12px, calc(var(--u) * 12.5));
        font-weight: 500;
        white-space: nowrap;
        color: var(--sac-fg);
      }
      .rig .temp.hot {
        padding: 0 calc(var(--u) * 5);
        border-radius: calc(var(--u) * 4);
        background: var(--sac-on-band);
        color: var(--sac-alert);
        font-weight: 700;
      }
      dl,
      dd {
        margin: 0;
      }
      .reserve {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
        gap: calc(var(--u) * 8);
        padding: calc(var(--u) * 2) calc(var(--u) * 14) calc(var(--u) * 2);
      }
      .reserve div {
        position: relative;
        min-width: 0;
      }
      .reserve dd {
        font-size: calc(var(--u) * 21);
        line-height: 1.1;
        white-space: nowrap;
      }
      .reserve small {
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-size: max(12px, calc(var(--u) * 12));
        font-weight: 500;
      }
      .alert {
        margin: 0;
        padding: calc(var(--u) * 5) calc(var(--u) * 14);
        background: var(--sac-on-band);
        color: var(--sac-alert);
        border-bottom: 1px solid var(--sac-alert);
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
        font-size: max(12px, calc(var(--u) * 12.5));
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
        font-size: max(12px, calc(var(--u) * 12));
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
        font-size: max(12px, calc(var(--u) * 11));
        color: var(--sac-dim);
      }
      .fine {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        /* Hàng cách nhau đủ để tâm hai nút số xếp chồng cách ≥ 24px (WCAG 2.5.8). */
        gap: max(8px, calc(var(--u) * 3)) calc(var(--u) * 16);
        margin: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 12);
        padding-top: calc(var(--u) * 9);
        border-top: 1px solid var(--sac-border);
        font-size: max(12px, calc(var(--u) * 12.5));
        color: var(--sac-dim);
      }
      .fine div {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        column-gap: calc(var(--u) * 8);
      }
      .fine dt {
        white-space: nowrap;
      }
      /* Cột hẹp không chứa nổi cả dòng thì giá trị xuống dòng, vẫn căn phải. */
      .fine dd {
        margin-left: auto;
        color: var(--sac-fg);
        font-weight: 500;
        white-space: nowrap;
      }
      /* Vùng bấm phủ cả dòng, nhãn cũng chạm được. */
      .fact::after {
        content: '';
        position: absolute;
        inset: 0;
      }
      /* Dòng có hai số: mỗi nửa dòng mở một entity. */
      .fact.left::after {
        right: 50%;
      }
      .fact.right::after {
        left: 50%;
      }
      .controls {
        display: grid;
        gap: calc(var(--u) * 4);
        margin: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 12);
        padding-top: calc(var(--u) * 9);
        border-top: 1px solid var(--sac-border);
        font-size: max(12px, calc(var(--u) * 12.5));
        color: var(--sac-dim);
      }
      .fine + .controls {
        margin-top: 0;
      }
      .control {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: calc(var(--u) * 4) calc(var(--u) * 8);
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
        flex-wrap: wrap;
        justify-content: flex-end;
        margin-left: auto;
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
        .rig .lk:hover {
          text-decoration: underline;
        }
        .rig .pv:hover .label,
        .main:hover .label,
        button.sub:hover,
        .about:hover span,
        .cell:hover .hour {
          color: var(--sac-fg);
        }
        .opt:not(:disabled):hover {
          border-color: var(--sac-fg);
        }
      }
      /* Card hẹp: bớt cỡ để cột ba số vẫn chứa đủ "2,40 kW". */
      @container (max-width: 400px) {
        .lead {
          gap: calc(var(--u) * 8);
        }
        .main .num {
          font-size: calc(var(--u) * 48);
        }
        .main small {
          margin-left: calc(var(--u) * 2);
          font-size: max(12px, calc(var(--u) * 12.5));
        }
      }
      @container (max-width: 400px) {
        .node .main .num {
          font-size: calc(var(--u) * 30);
        }
        .node.side .main .num {
          font-size: calc(var(--u) * 28);
        }
        .node.home .main .num {
          font-size: calc(var(--u) * 38);
        }
        .node .gauge,
        .node .mix {
          min-width: calc(var(--u) * 70);
        }
      }
      /* Sơ đồ inverter ở card hẹp: thu khoảng cách và biểu tượng trước, số nhỏ lại sau cùng; chữ không dưới 12px. */
      @container (max-width: 400px) {
        .rig {
          column-gap: calc(var(--u) * 6);
          padding-left: calc(var(--u) * 10);
          padding-right: calc(var(--u) * 10);
        }
        .rig .inv {
          margin: 0 calc(var(--u) * 2);
        }
        .rig .icon.battery {
          width: calc(var(--u) * 22);
          height: calc(var(--u) * 38);
        }
        .rig .val {
          padding: calc(var(--u) * 1) calc(var(--u) * 5);
        }
      }
      @container (max-width: 340px) {
        .rig .val .num {
          font-size: calc(var(--u) * 19);
        }
        .rig .main .soc {
          font-size: calc(var(--u) * 30);
        }
        .rig .icon {
          width: calc(var(--u) * 26);
          height: calc(var(--u) * 26);
        }
        .rig .inv .icon {
          width: calc(var(--u) * 38);
          height: calc(var(--u) * 38);
        }
      }
      @container (max-width: 367px) {
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
    `]), customElements.get(Ue) || (customElements.define(Ue, $), window.customCards = window.customCards || [], window.customCards.push({
	type: Ue,
	name: "Solar Almanac",
	description: "Luồng năng lượng và giờ tốt dùng tải lớn, trình bày như một tờ lịch",
	preview: !0
}), console.info("%c SOLAR-ALMANAC-CARD %c v0.3.0 ", "background:#c4302b;color:#fff", "background:#333;color:#fff"));
export { $ as SolarAlmanacCard };
