var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const exports = {};
const module = { exports };
!function(e, r) {
  if ("object" == typeof exports && "object" == typeof module) module.exports = r();
  else if ("function" == typeof define && define.amd) define([], r);
  else {
    var t = r();
    for (var n in t) ("object" == typeof exports ? exports : e)[n] = t[n];
  }
}("undefined" != typeof self ? self : void 0, function() {
  return function(e) {
    var r = {};
    function t(n) {
      if (r[n]) return r[n].exports;
      var o = r[n] = { i: n, l: false, exports: {} };
      return e[n].call(o.exports, o, o.exports, t), o.l = true, o.exports;
    }
    __name(t, "t");
    return t.m = e, t.c = r, t.d = function(e2, r2, n) {
      t.o(e2, r2) || Object.defineProperty(e2, r2, { enumerable: true, get: n });
    }, t.r = function(e2) {
      "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e2, "__esModule", { value: true });
    }, t.t = function(e2, r2) {
      if (1 & r2 && (e2 = t(e2)), 8 & r2) return e2;
      if (4 & r2 && "object" == typeof e2 && e2 && e2.__esModule) return e2;
      var n = /* @__PURE__ */ Object.create(null);
      if (t.r(n), Object.defineProperty(n, "default", { enumerable: true, value: e2 }), 2 & r2 && "string" != typeof e2) for (var o in e2) t.d(n, o, function(r3) {
        return e2[r3];
      }.bind(null, o));
      return n;
    }, t.n = function(e2) {
      var r2 = e2 && e2.__esModule ? function() {
        return e2.default;
      } : function() {
        return e2;
      };
      return t.d(r2, "a", r2), r2;
    }, t.o = function(e2, r2) {
      return Object.prototype.hasOwnProperty.call(e2, r2);
    }, t.p = "", t(t.s = 0);
  }([function(e, r, t) {
    (function(t2) {
      var n;
      r = e.exports = H, n = "object" == typeof t2 && t2.env && t2.env.NODE_DEBUG && /\bsemver\b/i.test(t2.env.NODE_DEBUG) ? function() {
        var e2 = Array.prototype.slice.call(arguments, 0);
        e2.unshift("SEMVER"), console.log.apply(console, e2);
      } : function() {
      }, r.SEMVER_SPEC_VERSION = "2.0.0";
      var o = 256, i = Number.MAX_SAFE_INTEGER || 9007199254740991, s = r.re = [], a = r.src = [], u = 0, c = u++;
      a[c] = "0|[1-9]\\d*";
      var p = u++;
      a[p] = "[0-9]+";
      var f = u++;
      a[f] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
      var l = u++;
      a[l] = "(" + a[c] + ")\\.(" + a[c] + ")\\.(" + a[c] + ")";
      var h = u++;
      a[h] = "(" + a[p] + ")\\.(" + a[p] + ")\\.(" + a[p] + ")";
      var v = u++;
      a[v] = "(?:" + a[c] + "|" + a[f] + ")";
      var m = u++;
      a[m] = "(?:" + a[p] + "|" + a[f] + ")";
      var w = u++;
      a[w] = "(?:-(" + a[v] + "(?:\\." + a[v] + ")*))";
      var g = u++;
      a[g] = "(?:-?(" + a[m] + "(?:\\." + a[m] + ")*))";
      var y = u++;
      a[y] = "[0-9A-Za-z-]+";
      var d = u++;
      a[d] = "(?:\\+(" + a[y] + "(?:\\." + a[y] + ")*))";
      var b = u++, j = "v?" + a[l] + a[w] + "?" + a[d] + "?";
      a[b] = "^" + j + "$";
      var E = "[v=\\s]*" + a[h] + a[g] + "?" + a[d] + "?", T = u++;
      a[T] = "^" + E + "$";
      var x = u++;
      a[x] = "((?:<|>)?=?)";
      var $ = u++;
      a[$] = a[p] + "|x|X|\\*";
      var k = u++;
      a[k] = a[c] + "|x|X|\\*";
      var S = u++;
      a[S] = "[v=\\s]*(" + a[k] + ")(?:\\.(" + a[k] + ")(?:\\.(" + a[k] + ")(?:" + a[w] + ")?" + a[d] + "?)?)?";
      var R = u++;
      a[R] = "[v=\\s]*(" + a[$] + ")(?:\\.(" + a[$] + ")(?:\\.(" + a[$] + ")(?:" + a[g] + ")?" + a[d] + "?)?)?";
      var I = u++;
      a[I] = "^" + a[x] + "\\s*" + a[S] + "$";
      var _ = u++;
      a[_] = "^" + a[x] + "\\s*" + a[R] + "$";
      var O = u++;
      a[O] = "(?:^|[^\\d])(\\d{1,16})(?:\\.(\\d{1,16}))?(?:\\.(\\d{1,16}))?(?:$|[^\\d])";
      var A = u++;
      a[A] = "(?:~>?)";
      var M = u++;
      a[M] = "(\\s*)" + a[A] + "\\s+", s[M] = new RegExp(a[M], "g");
      var V = u++;
      a[V] = "^" + a[A] + a[S] + "$";
      var P = u++;
      a[P] = "^" + a[A] + a[R] + "$";
      var C = u++;
      a[C] = "(?:\\^)";
      var L = u++;
      a[L] = "(\\s*)" + a[C] + "\\s+", s[L] = new RegExp(a[L], "g");
      var N = u++;
      a[N] = "^" + a[C] + a[S] + "$";
      var q = u++;
      a[q] = "^" + a[C] + a[R] + "$";
      var D = u++;
      a[D] = "^" + a[x] + "\\s*(" + E + ")$|^$";
      var X = u++;
      a[X] = "^" + a[x] + "\\s*(" + j + ")$|^$";
      var z = u++;
      a[z] = "(\\s*)" + a[x] + "\\s*(" + E + "|" + a[S] + ")", s[z] = new RegExp(a[z], "g");
      var G = u++;
      a[G] = "^\\s*(" + a[S] + ")\\s+-\\s+(" + a[S] + ")\\s*$";
      var Z = u++;
      a[Z] = "^\\s*(" + a[R] + ")\\s+-\\s+(" + a[R] + ")\\s*$";
      var B = u++;
      a[B] = "(<|>)?=?\\s*\\*";
      for (var U = 0; U < 35; U++) n(U, a[U]), s[U] || (s[U] = new RegExp(a[U]));
      function F(e2, r2) {
        if (e2 instanceof H) return e2;
        if ("string" != typeof e2) return null;
        if (e2.length > o) return null;
        if (!(r2 ? s[T] : s[b]).test(e2)) return null;
        try {
          return new H(e2, r2);
        } catch (e3) {
          return null;
        }
      }
      __name(F, "F");
      function H(e2, r2) {
        if (e2 instanceof H) {
          if (e2.loose === r2) return e2;
          e2 = e2.version;
        } else if ("string" != typeof e2) throw new TypeError("Invalid Version: " + e2);
        if (e2.length > o) throw new TypeError("version is longer than " + o + " characters");
        if (!(this instanceof H)) return new H(e2, r2);
        n("SemVer", e2, r2), this.loose = r2;
        var t3 = e2.trim().match(r2 ? s[T] : s[b]);
        if (!t3) throw new TypeError("Invalid Version: " + e2);
        if (this.raw = e2, this.major = +t3[1], this.minor = +t3[2], this.patch = +t3[3], this.major > i || this.major < 0) throw new TypeError("Invalid major version");
        if (this.minor > i || this.minor < 0) throw new TypeError("Invalid minor version");
        if (this.patch > i || this.patch < 0) throw new TypeError("Invalid patch version");
        t3[4] ? this.prerelease = t3[4].split(".").map(function(e3) {
          if (/^[0-9]+$/.test(e3)) {
            var r3 = +e3;
            if (r3 >= 0 && r3 < i) return r3;
          }
          return e3;
        }) : this.prerelease = [], this.build = t3[5] ? t3[5].split(".") : [], this.format();
      }
      __name(H, "H");
      r.parse = F, r.valid = function(e2, r2) {
        var t3 = F(e2, r2);
        return t3 ? t3.version : null;
      }, r.clean = function(e2, r2) {
        var t3 = F(e2.trim().replace(/^[=v]+/, ""), r2);
        return t3 ? t3.version : null;
      }, r.SemVer = H, H.prototype.format = function() {
        return this.version = this.major + "." + this.minor + "." + this.patch, this.prerelease.length && (this.version += "-" + this.prerelease.join(".")), this.version;
      }, H.prototype.toString = function() {
        return this.version;
      }, H.prototype.compare = function(e2) {
        return n("SemVer.compare", this.version, this.loose, e2), e2 instanceof H || (e2 = new H(e2, this.loose)), this.compareMain(e2) || this.comparePre(e2);
      }, H.prototype.compareMain = function(e2) {
        return e2 instanceof H || (e2 = new H(e2, this.loose)), K(this.major, e2.major) || K(this.minor, e2.minor) || K(this.patch, e2.patch);
      }, H.prototype.comparePre = function(e2) {
        if (e2 instanceof H || (e2 = new H(e2, this.loose)), this.prerelease.length && !e2.prerelease.length) return -1;
        if (!this.prerelease.length && e2.prerelease.length) return 1;
        if (!this.prerelease.length && !e2.prerelease.length) return 0;
        var r2 = 0;
        do {
          var t3 = this.prerelease[r2], o2 = e2.prerelease[r2];
          if (n("prerelease compare", r2, t3, o2), void 0 === t3 && void 0 === o2) return 0;
          if (void 0 === o2) return 1;
          if (void 0 === t3) return -1;
          if (t3 !== o2) return K(t3, o2);
        } while (++r2);
      }, H.prototype.inc = function(e2, r2) {
        switch (e2) {
          case "premajor":
            this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r2);
            break;
          case "preminor":
            this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r2);
            break;
          case "prepatch":
            this.prerelease.length = 0, this.inc("patch", r2), this.inc("pre", r2);
            break;
          case "prerelease":
            0 === this.prerelease.length && this.inc("patch", r2), this.inc("pre", r2);
            break;
          case "major":
            0 === this.minor && 0 === this.patch && 0 !== this.prerelease.length || this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
            break;
          case "minor":
            0 === this.patch && 0 !== this.prerelease.length || this.minor++, this.patch = 0, this.prerelease = [];
            break;
          case "patch":
            0 === this.prerelease.length && this.patch++, this.prerelease = [];
            break;
          case "pre":
            if (0 === this.prerelease.length) this.prerelease = [0];
            else {
              for (var t3 = this.prerelease.length; --t3 >= 0; ) "number" == typeof this.prerelease[t3] && (this.prerelease[t3]++, t3 = -2);
              -1 === t3 && this.prerelease.push(0);
            }
            r2 && (this.prerelease[0] === r2 ? isNaN(this.prerelease[1]) && (this.prerelease = [r2, 0]) : this.prerelease = [r2, 0]);
            break;
          default:
            throw new Error("invalid increment argument: " + e2);
        }
        return this.format(), this.raw = this.version, this;
      }, r.inc = function(e2, r2, t3, n2) {
        "string" == typeof t3 && (n2 = t3, t3 = void 0);
        try {
          return new H(e2, t3).inc(r2, n2).version;
        } catch (e3) {
          return null;
        }
      }, r.diff = function(e2, r2) {
        if (ee(e2, r2)) return null;
        var t3 = F(e2), n2 = F(r2);
        if (t3.prerelease.length || n2.prerelease.length) {
          for (var o2 in t3) if (("major" === o2 || "minor" === o2 || "patch" === o2) && t3[o2] !== n2[o2]) return "pre" + o2;
          return "prerelease";
        }
        for (var o2 in t3) if (("major" === o2 || "minor" === o2 || "patch" === o2) && t3[o2] !== n2[o2]) return o2;
      }, r.compareIdentifiers = K;
      var J = /^[0-9]+$/;
      function K(e2, r2) {
        var t3 = J.test(e2), n2 = J.test(r2);
        return t3 && n2 && (e2 = +e2, r2 = +r2), t3 && !n2 ? -1 : n2 && !t3 ? 1 : e2 < r2 ? -1 : e2 > r2 ? 1 : 0;
      }
      __name(K, "K");
      function Q(e2, r2, t3) {
        return new H(e2, t3).compare(new H(r2, t3));
      }
      __name(Q, "Q");
      function W(e2, r2, t3) {
        return Q(e2, r2, t3) > 0;
      }
      __name(W, "W");
      function Y(e2, r2, t3) {
        return Q(e2, r2, t3) < 0;
      }
      __name(Y, "Y");
      function ee(e2, r2, t3) {
        return 0 === Q(e2, r2, t3);
      }
      __name(ee, "ee");
      function re(e2, r2, t3) {
        return 0 !== Q(e2, r2, t3);
      }
      __name(re, "re");
      function te(e2, r2, t3) {
        return Q(e2, r2, t3) >= 0;
      }
      __name(te, "te");
      function ne(e2, r2, t3) {
        return Q(e2, r2, t3) <= 0;
      }
      __name(ne, "ne");
      function oe(e2, r2, t3, n2) {
        var o2;
        switch (r2) {
          case "===":
            "object" == typeof e2 && (e2 = e2.version), "object" == typeof t3 && (t3 = t3.version), o2 = e2 === t3;
            break;
          case "!==":
            "object" == typeof e2 && (e2 = e2.version), "object" == typeof t3 && (t3 = t3.version), o2 = e2 !== t3;
            break;
          case "":
          case "=":
          case "==":
            o2 = ee(e2, t3, n2);
            break;
          case "!=":
            o2 = re(e2, t3, n2);
            break;
          case ">":
            o2 = W(e2, t3, n2);
            break;
          case ">=":
            o2 = te(e2, t3, n2);
            break;
          case "<":
            o2 = Y(e2, t3, n2);
            break;
          case "<=":
            o2 = ne(e2, t3, n2);
            break;
          default:
            throw new TypeError("Invalid operator: " + r2);
        }
        return o2;
      }
      __name(oe, "oe");
      function ie(e2, r2) {
        if (e2 instanceof ie) {
          if (e2.loose === r2) return e2;
          e2 = e2.value;
        }
        if (!(this instanceof ie)) return new ie(e2, r2);
        n("comparator", e2, r2), this.loose = r2, this.parse(e2), this.semver === se ? this.value = "" : this.value = this.operator + this.semver.version, n("comp", this);
      }
      __name(ie, "ie");
      r.rcompareIdentifiers = function(e2, r2) {
        return K(r2, e2);
      }, r.major = function(e2, r2) {
        return new H(e2, r2).major;
      }, r.minor = function(e2, r2) {
        return new H(e2, r2).minor;
      }, r.patch = function(e2, r2) {
        return new H(e2, r2).patch;
      }, r.compare = Q, r.compareLoose = function(e2, r2) {
        return Q(e2, r2, true);
      }, r.rcompare = function(e2, r2, t3) {
        return Q(r2, e2, t3);
      }, r.sort = function(e2, t3) {
        return e2.sort(function(e3, n2) {
          return r.compare(e3, n2, t3);
        });
      }, r.rsort = function(e2, t3) {
        return e2.sort(function(e3, n2) {
          return r.rcompare(e3, n2, t3);
        });
      }, r.gt = W, r.lt = Y, r.eq = ee, r.neq = re, r.gte = te, r.lte = ne, r.cmp = oe, r.Comparator = ie;
      var se = {};
      function ae(e2, r2) {
        if (e2 instanceof ae) return e2.loose === r2 ? e2 : new ae(e2.raw, r2);
        if (e2 instanceof ie) return new ae(e2.value, r2);
        if (!(this instanceof ae)) return new ae(e2, r2);
        if (this.loose = r2, this.raw = e2, this.set = e2.split(/\s*\|\|\s*/).map(function(e3) {
          return this.parseRange(e3.trim());
        }, this).filter(function(e3) {
          return e3.length;
        }), !this.set.length) throw new TypeError("Invalid SemVer Range: " + e2);
        this.format();
      }
      __name(ae, "ae");
      function ue(e2) {
        return !e2 || "x" === e2.toLowerCase() || "*" === e2;
      }
      __name(ue, "ue");
      function ce(e2, r2, t3, n2, o2, i2, s2, a2, u2, c2, p2, f2, l2) {
        return ((r2 = ue(t3) ? "" : ue(n2) ? ">=" + t3 + ".0.0" : ue(o2) ? ">=" + t3 + "." + n2 + ".0" : ">=" + r2) + " " + (a2 = ue(u2) ? "" : ue(c2) ? "<" + (+u2 + 1) + ".0.0" : ue(p2) ? "<" + u2 + "." + (+c2 + 1) + ".0" : f2 ? "<=" + u2 + "." + c2 + "." + p2 + "-" + f2 : "<=" + a2)).trim();
      }
      __name(ce, "ce");
      function pe(e2, r2) {
        for (var t3 = 0; t3 < e2.length; t3++) if (!e2[t3].test(r2)) return false;
        if (r2.prerelease.length) {
          for (t3 = 0; t3 < e2.length; t3++) if (n(e2[t3].semver), e2[t3].semver !== se && e2[t3].semver.prerelease.length > 0) {
            var o2 = e2[t3].semver;
            if (o2.major === r2.major && o2.minor === r2.minor && o2.patch === r2.patch) return true;
          }
          return false;
        }
        return true;
      }
      __name(pe, "pe");
      function fe(e2, r2, t3) {
        try {
          r2 = new ae(r2, t3);
        } catch (e3) {
          return false;
        }
        return r2.test(e2);
      }
      __name(fe, "fe");
      function le(e2, r2, t3, n2) {
        var o2, i2, s2, a2, u2;
        switch (e2 = new H(e2, n2), r2 = new ae(r2, n2), t3) {
          case ">":
            o2 = W, i2 = ne, s2 = Y, a2 = ">", u2 = ">=";
            break;
          case "<":
            o2 = Y, i2 = te, s2 = W, a2 = "<", u2 = "<=";
            break;
          default:
            throw new TypeError('Must provide a hilo val of "<" or ">"');
        }
        if (fe(e2, r2, n2)) return false;
        for (var c2 = 0; c2 < r2.set.length; ++c2) {
          var p2 = r2.set[c2], f2 = null, l2 = null;
          if (p2.forEach(function(e3) {
            e3.semver === se && (e3 = new ie(">=0.0.0")), f2 = f2 || e3, l2 = l2 || e3, o2(e3.semver, f2.semver, n2) ? f2 = e3 : s2(e3.semver, l2.semver, n2) && (l2 = e3);
          }), f2.operator === a2 || f2.operator === u2) return false;
          if ((!l2.operator || l2.operator === a2) && i2(e2, l2.semver)) return false;
          if (l2.operator === u2 && s2(e2, l2.semver)) return false;
        }
        return true;
      }
      __name(le, "le");
      ie.prototype.parse = function(e2) {
        var r2 = this.loose ? s[D] : s[X], t3 = e2.match(r2);
        if (!t3) throw new TypeError("Invalid comparator: " + e2);
        this.operator = t3[1], "=" === this.operator && (this.operator = ""), t3[2] ? this.semver = new H(t3[2], this.loose) : this.semver = se;
      }, ie.prototype.toString = function() {
        return this.value;
      }, ie.prototype.test = function(e2) {
        return n("Comparator.test", e2, this.loose), this.semver === se || ("string" == typeof e2 && (e2 = new H(e2, this.loose)), oe(e2, this.operator, this.semver, this.loose));
      }, ie.prototype.intersects = function(e2, r2) {
        if (!(e2 instanceof ie)) throw new TypeError("a Comparator is required");
        var t3;
        if ("" === this.operator) return t3 = new ae(e2.value, r2), fe(this.value, t3, r2);
        if ("" === e2.operator) return t3 = new ae(this.value, r2), fe(e2.semver, t3, r2);
        var n2 = !(">=" !== this.operator && ">" !== this.operator || ">=" !== e2.operator && ">" !== e2.operator), o2 = !("<=" !== this.operator && "<" !== this.operator || "<=" !== e2.operator && "<" !== e2.operator), i2 = this.semver.version === e2.semver.version, s2 = !(">=" !== this.operator && "<=" !== this.operator || ">=" !== e2.operator && "<=" !== e2.operator), a2 = oe(this.semver, "<", e2.semver, r2) && (">=" === this.operator || ">" === this.operator) && ("<=" === e2.operator || "<" === e2.operator), u2 = oe(this.semver, ">", e2.semver, r2) && ("<=" === this.operator || "<" === this.operator) && (">=" === e2.operator || ">" === e2.operator);
        return n2 || o2 || i2 && s2 || a2 || u2;
      }, r.Range = ae, ae.prototype.format = function() {
        return this.range = this.set.map(function(e2) {
          return e2.join(" ").trim();
        }).join("||").trim(), this.range;
      }, ae.prototype.toString = function() {
        return this.range;
      }, ae.prototype.parseRange = function(e2) {
        var r2 = this.loose;
        e2 = e2.trim(), n("range", e2, r2);
        var t3 = r2 ? s[Z] : s[G];
        e2 = e2.replace(t3, ce), n("hyphen replace", e2), e2 = e2.replace(s[z], "$1$2$3"), n("comparator trim", e2, s[z]), e2 = (e2 = (e2 = e2.replace(s[M], "$1~")).replace(s[L], "$1^")).split(/\s+/).join(" ");
        var o2 = r2 ? s[D] : s[X], i2 = e2.split(" ").map(function(e3) {
          return function(e4, r3) {
            return n("comp", e4), e4 = function(e5, r4) {
              return e5.trim().split(/\s+/).map(function(e6) {
                return function(e7, r5) {
                  n("caret", e7, r5);
                  var t4 = r5 ? s[q] : s[N];
                  return e7.replace(t4, function(r6, t5, o3, i3, s2) {
                    var a2;
                    return n("caret", e7, r6, t5, o3, i3, s2), ue(t5) ? a2 = "" : ue(o3) ? a2 = ">=" + t5 + ".0.0 <" + (+t5 + 1) + ".0.0" : ue(i3) ? a2 = "0" === t5 ? ">=" + t5 + "." + o3 + ".0 <" + t5 + "." + (+o3 + 1) + ".0" : ">=" + t5 + "." + o3 + ".0 <" + (+t5 + 1) + ".0.0" : s2 ? (n("replaceCaret pr", s2), "-" !== s2.charAt(0) && (s2 = "-" + s2), a2 = "0" === t5 ? "0" === o3 ? ">=" + t5 + "." + o3 + "." + i3 + s2 + " <" + t5 + "." + o3 + "." + (+i3 + 1) : ">=" + t5 + "." + o3 + "." + i3 + s2 + " <" + t5 + "." + (+o3 + 1) + ".0" : ">=" + t5 + "." + o3 + "." + i3 + s2 + " <" + (+t5 + 1) + ".0.0") : (n("no pr"), a2 = "0" === t5 ? "0" === o3 ? ">=" + t5 + "." + o3 + "." + i3 + " <" + t5 + "." + o3 + "." + (+i3 + 1) : ">=" + t5 + "." + o3 + "." + i3 + " <" + t5 + "." + (+o3 + 1) + ".0" : ">=" + t5 + "." + o3 + "." + i3 + " <" + (+t5 + 1) + ".0.0"), n("caret return", a2), a2;
                  });
                }(e6, r4);
              }).join(" ");
            }(e4, r3), n("caret", e4), e4 = function(e5, r4) {
              return e5.trim().split(/\s+/).map(function(e6) {
                return function(e7, r5) {
                  var t4 = r5 ? s[P] : s[V];
                  return e7.replace(t4, function(r6, t5, o3, i3, s2) {
                    var a2;
                    return n("tilde", e7, r6, t5, o3, i3, s2), ue(t5) ? a2 = "" : ue(o3) ? a2 = ">=" + t5 + ".0.0 <" + (+t5 + 1) + ".0.0" : ue(i3) ? a2 = ">=" + t5 + "." + o3 + ".0 <" + t5 + "." + (+o3 + 1) + ".0" : s2 ? (n("replaceTilde pr", s2), "-" !== s2.charAt(0) && (s2 = "-" + s2), a2 = ">=" + t5 + "." + o3 + "." + i3 + s2 + " <" + t5 + "." + (+o3 + 1) + ".0") : a2 = ">=" + t5 + "." + o3 + "." + i3 + " <" + t5 + "." + (+o3 + 1) + ".0", n("tilde return", a2), a2;
                  });
                }(e6, r4);
              }).join(" ");
            }(e4, r3), n("tildes", e4), e4 = function(e5, r4) {
              return n("replaceXRanges", e5, r4), e5.split(/\s+/).map(function(e6) {
                return function(e7, r5) {
                  e7 = e7.trim();
                  var t4 = r5 ? s[_] : s[I];
                  return e7.replace(t4, function(r6, t5, o3, i3, s2, a2) {
                    n("xRange", e7, r6, t5, o3, i3, s2, a2);
                    var u2 = ue(o3), c2 = u2 || ue(i3), p2 = c2 || ue(s2);
                    return "=" === t5 && p2 && (t5 = ""), u2 ? r6 = ">" === t5 || "<" === t5 ? "<0.0.0" : "*" : t5 && p2 ? (c2 && (i3 = 0), p2 && (s2 = 0), ">" === t5 ? (t5 = ">=", c2 ? (o3 = +o3 + 1, i3 = 0, s2 = 0) : p2 && (i3 = +i3 + 1, s2 = 0)) : "<=" === t5 && (t5 = "<", c2 ? o3 = +o3 + 1 : i3 = +i3 + 1), r6 = t5 + o3 + "." + i3 + "." + s2) : c2 ? r6 = ">=" + o3 + ".0.0 <" + (+o3 + 1) + ".0.0" : p2 && (r6 = ">=" + o3 + "." + i3 + ".0 <" + o3 + "." + (+i3 + 1) + ".0"), n("xRange return", r6), r6;
                  });
                }(e6, r4);
              }).join(" ");
            }(e4, r3), n("xrange", e4), e4 = function(e5, r4) {
              return n("replaceStars", e5, r4), e5.trim().replace(s[B], "");
            }(e4, r3), n("stars", e4), e4;
          }(e3, r2);
        }).join(" ").split(/\s+/);
        return this.loose && (i2 = i2.filter(function(e3) {
          return !!e3.match(o2);
        })), i2 = i2.map(function(e3) {
          return new ie(e3, r2);
        });
      }, ae.prototype.intersects = function(e2, r2) {
        if (!(e2 instanceof ae)) throw new TypeError("a Range is required");
        return this.set.some(function(t3) {
          return t3.every(function(t4) {
            return e2.set.some(function(e3) {
              return e3.every(function(e4) {
                return t4.intersects(e4, r2);
              });
            });
          });
        });
      }, r.toComparators = function(e2, r2) {
        return new ae(e2, r2).set.map(function(e3) {
          return e3.map(function(e4) {
            return e4.value;
          }).join(" ").trim().split(" ");
        });
      }, ae.prototype.test = function(e2) {
        if (!e2) return false;
        "string" == typeof e2 && (e2 = new H(e2, this.loose));
        for (var r2 = 0; r2 < this.set.length; r2++) if (pe(this.set[r2], e2)) return true;
        return false;
      }, r.satisfies = fe, r.maxSatisfying = function(e2, r2, t3) {
        var n2 = null, o2 = null;
        try {
          var i2 = new ae(r2, t3);
        } catch (e3) {
          return null;
        }
        return e2.forEach(function(e3) {
          i2.test(e3) && (n2 && -1 !== o2.compare(e3) || (o2 = new H(n2 = e3, t3)));
        }), n2;
      }, r.minSatisfying = function(e2, r2, t3) {
        var n2 = null, o2 = null;
        try {
          var i2 = new ae(r2, t3);
        } catch (e3) {
          return null;
        }
        return e2.forEach(function(e3) {
          i2.test(e3) && (n2 && 1 !== o2.compare(e3) || (o2 = new H(n2 = e3, t3)));
        }), n2;
      }, r.validRange = function(e2, r2) {
        try {
          return new ae(e2, r2).range || "*";
        } catch (e3) {
          return null;
        }
      }, r.ltr = function(e2, r2, t3) {
        return le(e2, r2, "<", t3);
      }, r.gtr = function(e2, r2, t3) {
        return le(e2, r2, ">", t3);
      }, r.outside = le, r.prerelease = function(e2, r2) {
        var t3 = F(e2, r2);
        return t3 && t3.prerelease.length ? t3.prerelease : null;
      }, r.intersects = function(e2, r2, t3) {
        return e2 = new ae(e2, t3), r2 = new ae(r2, t3), e2.intersects(r2);
      }, r.coerce = function(e2) {
        if (e2 instanceof H) return e2;
        if ("string" != typeof e2) return null;
        var r2 = e2.match(s[O]);
        return null == r2 ? null : F((r2[1] || "0") + "." + (r2[2] || "0") + "." + (r2[3] || "0"));
      };
    }).call(this, t(1));
  }, function(e, r) {
    var t, n, o = e.exports = {};
    function i() {
      throw new Error("setTimeout has not been defined");
    }
    __name(i, "i");
    function s() {
      throw new Error("clearTimeout has not been defined");
    }
    __name(s, "s");
    function a(e2) {
      if (t === setTimeout) return setTimeout(e2, 0);
      if ((t === i || !t) && setTimeout) return t = setTimeout, setTimeout(e2, 0);
      try {
        return t(e2, 0);
      } catch (r2) {
        try {
          return t.call(null, e2, 0);
        } catch (r3) {
          return t.call(this, e2, 0);
        }
      }
    }
    __name(a, "a");
    !function() {
      try {
        t = "function" == typeof setTimeout ? setTimeout : i;
      } catch (e2) {
        t = i;
      }
      try {
        n = "function" == typeof clearTimeout ? clearTimeout : s;
      } catch (e2) {
        n = s;
      }
    }();
    var u, c = [], p = false, f = -1;
    function l() {
      p && u && (p = false, u.length ? c = u.concat(c) : f = -1, c.length && h());
    }
    __name(l, "l");
    function h() {
      if (!p) {
        var e2 = a(l);
        p = true;
        for (var r2 = c.length; r2; ) {
          for (u = c, c = []; ++f < r2; ) u && u[f].run();
          f = -1, r2 = c.length;
        }
        u = null, p = false, function(e3) {
          if (n === clearTimeout) return clearTimeout(e3);
          if ((n === s || !n) && clearTimeout) return n = clearTimeout, clearTimeout(e3);
          try {
            n(e3);
          } catch (r3) {
            try {
              return n.call(null, e3);
            } catch (r4) {
              return n.call(this, e3);
            }
          }
        }(e2);
      }
    }
    __name(h, "h");
    function v(e2, r2) {
      this.fun = e2, this.array = r2;
    }
    __name(v, "v");
    function m() {
    }
    __name(m, "m");
    o.nextTick = function(e2) {
      var r2 = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var t2 = 1; t2 < arguments.length; t2++) r2[t2 - 1] = arguments[t2];
      c.push(new v(e2, r2)), 1 !== c.length || p || a(h);
    }, v.prototype.run = function() {
      this.fun.apply(null, this.array);
    }, o.title = "browser", o.browser = true, o.env = {}, o.argv = [], o.version = "", o.versions = {}, o.on = m, o.addListener = m, o.once = m, o.off = m, o.removeListener = m, o.removeAllListeners = m, o.emit = m, o.prependListener = m, o.prependOnceListener = m, o.listeners = function(e2) {
      return [];
    }, o.binding = function(e2) {
      throw new Error("process.binding is not supported");
    }, o.cwd = function() {
      return "/";
    }, o.chdir = function(e2) {
      throw new Error("process.chdir is not supported");
    }, o.umask = function() {
      return 0;
    };
  }]);
});
const SEMVER_SPEC_VERSION = module.exports.SEMVER_SPEC_VERSION;
const parse = module.exports.parse;
const valid = module.exports.valid;
const coerce = module.exports.coerce;
const clean = module.exports.clean;
const inc = module.exports.inc;
const major = module.exports.major;
const minor = module.exports.minor;
const patch = module.exports.patch;
const prerelease = module.exports.prerelease;
const gt = module.exports.gt;
const gte = module.exports.gte;
const lt = module.exports.lt;
const lte = module.exports.lte;
const eq = module.exports.eq;
const neq = module.exports.neq;
const cmp = module.exports.cmp;
const compare = module.exports.compare;
const rcompare = module.exports.rcompare;
const compareIdentifiers = module.exports.compareIdentifiers;
const rcompareIdentifiers = module.exports.rcompareIdentifiers;
const compareBuild = module.exports.compareBuild;
const sort = module.exports.sort;
const rsort = module.exports.rsort;
const diff = module.exports.diff;
const validRange = module.exports.validRange;
const satisfies = module.exports.satisfies;
const maxSatisfying = module.exports.maxSatisfying;
const minSatisfying = module.exports.minSatisfying;
const minVersion = module.exports.minVersion;
const gtr = module.exports.gtr;
const ltr = module.exports.ltr;
const outside = module.exports.outside;
const intersects = module.exports.intersects;
const SemVer = module.exports.SemVer;
const Comparator = module.exports.Comparator;
const Range = module.exports.Range;
export {
  Comparator,
  Range,
  SEMVER_SPEC_VERSION,
  SemVer,
  clean,
  cmp,
  coerce,
  compare,
  compareBuild,
  compareIdentifiers,
  diff,
  eq,
  gt,
  gte,
  gtr,
  inc,
  intersects,
  lt,
  lte,
  ltr,
  major,
  maxSatisfying,
  minSatisfying,
  minVersion,
  minor,
  neq,
  outside,
  parse,
  patch,
  prerelease,
  rcompare,
  rcompareIdentifiers,
  rsort,
  satisfies,
  sort,
  valid,
  validRange
};
//# sourceMappingURL=semver.js.map
