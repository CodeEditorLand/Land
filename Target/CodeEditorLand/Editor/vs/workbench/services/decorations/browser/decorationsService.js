/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Emitter, DebounceEmitter } from '../../../../base/common/event.js';
import { IDecorationsService } from '../common/decorations.js';
import { TernarySearchTree } from '../../../../base/common/ternarySearchTree.js';
import { toDisposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { isThenable } from '../../../../base/common/async.js';
import { LinkedList } from '../../../../base/common/linkedList.js';
import { createStyleSheet, createCSSRule, removeCSSRulesContainingSelector } from '../../../../base/browser/dom.js';
import { asCSSPropertyValue } from '../../../../base/browser/cssValue.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { isFalsyOrWhitespace } from '../../../../base/common/strings.js';
import { localize } from '../../../../nls.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { hash } from '../../../../base/common/hash.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { asArray, distinct } from '../../../../base/common/arrays.js';
import { asCssVariable } from '../../../../platform/theme/common/colorRegistry.js';
import { getIconRegistry } from '../../../../platform/theme/common/iconRegistry.js';
class DecorationRule {
    static keyOf(data) {
        if (Array.isArray(data)) {
            return data.map(DecorationRule.keyOf).join(',');
        }
        else {
            const { color, letter } = data;
            if (ThemeIcon.isThemeIcon(letter)) {
                return `${color}+${letter.id}`;
            }
            else {
                return `${color}/${letter}`;
            }
        }
    }
    static { this._classNamesPrefix = 'monaco-decoration'; }
    constructor(themeService, data, key) {
        this.themeService = themeService;
        this._refCounter = 0;
        this.data = data;
        const suffix = hash(key).toString(36);
        this.itemColorClassName = `${DecorationRule._classNamesPrefix}-itemColor-${suffix}`;
        this.itemBadgeClassName = `${DecorationRule._classNamesPrefix}-itemBadge-${suffix}`;
        this.bubbleBadgeClassName = `${DecorationRule._classNamesPrefix}-bubbleBadge-${suffix}`;
        this.iconBadgeClassName = `${DecorationRule._classNamesPrefix}-iconBadge-${suffix}`;
    }
    acquire() {
        this._refCounter += 1;
    }
    release() {
        return --this._refCounter === 0;
    }
    appendCSSRules(element) {
        if (!Array.isArray(this.data)) {
            this._appendForOne(this.data, element);
        }
        else {
            this._appendForMany(this.data, element);
        }
    }
    _appendForOne(data, element) {
        const { color, letter } = data;
        // label
        createCSSRule(`.${this.itemColorClassName}`, `color: ${getColor(color)};`, element);
        if (ThemeIcon.isThemeIcon(letter)) {
            this._createIconCSSRule(letter, color, element);
        }
        else if (letter) {
            createCSSRule(`.${this.itemBadgeClassName}::after`, `content: "${letter}"; color: ${getColor(color)};`, element);
        }
    }
    _appendForMany(data, element) {
        // label
        const { color } = data.find(d => !!d.color) ?? data[0];
        createCSSRule(`.${this.itemColorClassName}`, `color: ${getColor(color)};`, element);
        // badge or icon
        const letters = [];
        let icon;
        for (const d of data) {
            if (ThemeIcon.isThemeIcon(d.letter)) {
                icon = d.letter;
                break;
            }
            else if (d.letter) {
                letters.push(d.letter);
            }
        }
        if (icon) {
            this._createIconCSSRule(icon, color, element);
        }
        else {
            if (letters.length) {
                createCSSRule(`.${this.itemBadgeClassName}::after`, `content: "${letters.join(', ')}"; color: ${getColor(color)};`, element);
            }
            // bubble badge
            // TODO @misolori update bubble badge to adopt letter: ThemeIcon instead of unicode
            createCSSRule(`.${this.bubbleBadgeClassName}::after`, `content: "\uea71"; color: ${getColor(color)}; font-family: codicon; font-size: 14px; margin-right: 14px; opacity: 0.4;`, element);
        }
    }
    _createIconCSSRule(icon, color, element) {
        const modifier = ThemeIcon.getModifier(icon);
        if (modifier) {
            icon = ThemeIcon.modify(icon, undefined);
        }
        const iconContribution = getIconRegistry().getIcon(icon.id);
        if (!iconContribution) {
            return;
        }
        const definition = this.themeService.getProductIconTheme().getIcon(iconContribution);
        if (!definition) {
            return;
        }
        createCSSRule(`.${this.iconBadgeClassName}::after`, `content: '${definition.fontCharacter}';
			color: ${icon.color ? getColor(icon.color.id) : getColor(color)};
			font-family: ${asCSSPropertyValue(definition.font?.id ?? 'codicon')};
			font-size: 16px;
			margin-right: 14px;
			font-weight: normal;
			${modifier === 'spin' ? 'animation: codicon-spin 1.5s steps(30) infinite' : ''};
			`, element);
    }
    removeCSSRules(element) {
        removeCSSRulesContainingSelector(this.itemColorClassName, element);
        removeCSSRulesContainingSelector(this.itemBadgeClassName, element);
        removeCSSRulesContainingSelector(this.bubbleBadgeClassName, element);
        removeCSSRulesContainingSelector(this.iconBadgeClassName, element);
    }
}
class DecorationStyles {
    constructor(_themeService) {
        this._themeService = _themeService;
        this._dispoables = new DisposableStore();
        this._styleElement = createStyleSheet(undefined, undefined, this._dispoables);
        this._decorationRules = new Map();
    }
    dispose() {
        this._dispoables.dispose();
    }
    asDecoration(data, onlyChildren) {
        // sort by weight
        data.sort((a, b) => (b.weight || 0) - (a.weight || 0));
        const key = DecorationRule.keyOf(data);
        let rule = this._decorationRules.get(key);
        if (!rule) {
            // new css rule
            rule = new DecorationRule(this._themeService, data, key);
            this._decorationRules.set(key, rule);
            rule.appendCSSRules(this._styleElement);
        }
        rule.acquire();
        const labelClassName = rule.itemColorClassName;
        let badgeClassName = rule.itemBadgeClassName;
        const iconClassName = rule.iconBadgeClassName;
        let tooltip = distinct(data.filter(d => !isFalsyOrWhitespace(d.tooltip)).map(d => d.tooltip)).join(' • ');
        const strikethrough = data.some(d => d.strikethrough);
        if (onlyChildren) {
            // show items from its children only
            badgeClassName = rule.bubbleBadgeClassName;
            tooltip = localize('bubbleTitle', "Contains emphasized items");
        }
        return {
            labelClassName,
            badgeClassName,
            iconClassName,
            strikethrough,
            tooltip,
            dispose: () => {
                if (rule?.release()) {
                    this._decorationRules.delete(key);
                    rule.removeCSSRules(this._styleElement);
                    rule = undefined;
                }
            }
        };
    }
}
class FileDecorationChangeEvent {
    constructor(all) {
        this._data = TernarySearchTree.forUris(_uri => true); // events ignore all path casings
        this._data.fill(true, asArray(all));
    }
    affectsResource(uri) {
        return this._data.hasElementOrSubtree(uri);
    }
}
class DecorationDataRequest {
    constructor(source, thenable) {
        this.source = source;
        this.thenable = thenable;
    }
}
function getColor(color) {
    return color ? asCssVariable(color) : 'inherit';
}
let DecorationsService = class DecorationsService {
    constructor(uriIdentityService, themeService) {
        this._store = new DisposableStore();
        this._onDidChangeDecorationsDelayed = this._store.add(new DebounceEmitter({ merge: all => all.flat() }));
        this._onDidChangeDecorations = this._store.add(new Emitter());
        this.onDidChangeDecorations = this._onDidChangeDecorations.event;
        this._provider = new LinkedList();
        this._decorationStyles = new DecorationStyles(themeService);
        this._data = TernarySearchTree.forUris(key => uriIdentityService.extUri.ignorePathCasing(key));
        this._store.add(this._onDidChangeDecorationsDelayed.event(event => { this._onDidChangeDecorations.fire(new FileDecorationChangeEvent(event)); }));
    }
    dispose() {
        this._store.dispose();
        this._data.clear();
    }
    registerDecorationsProvider(provider) {
        const rm = this._provider.unshift(provider);
        this._onDidChangeDecorations.fire({
            // everything might have changed
            affectsResource() { return true; }
        });
        // remove everything what came from this provider
        const removeAll = () => {
            const uris = [];
            for (const [uri, map] of this._data) {
                if (map.delete(provider)) {
                    uris.push(uri);
                }
            }
            if (uris.length > 0) {
                this._onDidChangeDecorationsDelayed.fire(uris);
            }
        };
        const listener = provider.onDidChange(uris => {
            if (!uris) {
                // flush event -> drop all data, can affect everything
                removeAll();
            }
            else {
                // selective changes -> drop for resource, fetch again, send event
                for (const uri of uris) {
                    const map = this._ensureEntry(uri);
                    this._fetchData(map, uri, provider);
                }
            }
        });
        return toDisposable(() => {
            rm();
            listener.dispose();
            removeAll();
        });
    }
    _ensureEntry(uri) {
        let map = this._data.get(uri);
        if (!map) {
            // nothing known about this uri
            map = new Map();
            this._data.set(uri, map);
        }
        return map;
    }
    getDecoration(uri, includeChildren) {
        const all = [];
        let containsChildren = false;
        const map = this._ensureEntry(uri);
        for (const provider of this._provider) {
            let data = map.get(provider);
            if (data === undefined) {
                // sets data if fetch is sync
                data = this._fetchData(map, uri, provider);
            }
            if (data && !(data instanceof DecorationDataRequest)) {
                // having data
                all.push(data);
            }
        }
        if (includeChildren) {
            // (resolved) children
            const iter = this._data.findSuperstr(uri);
            if (iter) {
                for (const tuple of iter) {
                    for (const data of tuple[1].values()) {
                        if (data && !(data instanceof DecorationDataRequest)) {
                            if (data.bubble) {
                                all.push(data);
                                containsChildren = true;
                            }
                        }
                    }
                }
            }
        }
        return all.length === 0
            ? undefined
            : this._decorationStyles.asDecoration(all, containsChildren);
    }
    _fetchData(map, uri, provider) {
        // check for pending request and cancel it
        const pendingRequest = map.get(provider);
        if (pendingRequest instanceof DecorationDataRequest) {
            pendingRequest.source.cancel();
            map.delete(provider);
        }
        const cts = new CancellationTokenSource();
        const dataOrThenable = provider.provideDecorations(uri, cts.token);
        if (!isThenable(dataOrThenable)) {
            // sync -> we have a result now
            cts.dispose();
            return this._keepItem(map, provider, uri, dataOrThenable);
        }
        else {
            // async -> we have a result soon
            const request = new DecorationDataRequest(cts, Promise.resolve(dataOrThenable).then(data => {
                if (map.get(provider) === request) {
                    this._keepItem(map, provider, uri, data);
                }
            }).catch(err => {
                if (!isCancellationError(err) && map.get(provider) === request) {
                    map.delete(provider);
                }
            }).finally(() => {
                cts.dispose();
            }));
            map.set(provider, request);
            return null;
        }
    }
    _keepItem(map, provider, uri, data) {
        const deco = data ? data : null;
        const old = map.get(provider);
        map.set(provider, deco);
        if (deco || old) {
            // only fire event when something changed
            this._onDidChangeDecorationsDelayed.fire(uri);
        }
        return deco;
    }
};
DecorationsService = __decorate([
    __param(0, IUriIdentityService),
    __param(1, IThemeService),
    __metadata("design:paramtypes", [Object, Object])
], DecorationsService);
export { DecorationsService };
registerSingleton(IDecorationsService, DecorationsService, 1 /* InstantiationType.Delayed */);
