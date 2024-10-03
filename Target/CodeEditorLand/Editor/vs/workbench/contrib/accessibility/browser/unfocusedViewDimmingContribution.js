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
import { createStyleSheet } from '../../../../base/browser/dom.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { clamp } from '../../../../base/common/numbers.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
let UnfocusedViewDimmingContribution = class UnfocusedViewDimmingContribution extends Disposable {
    constructor(configurationService) {
        super();
        this._styleElementDisposables = undefined;
        this._register(toDisposable(() => this._removeStyleElement()));
        this._register(Event.runAndSubscribe(configurationService.onDidChangeConfiguration, e => {
            if (e && !e.affectsConfiguration("accessibility.dimUnfocused.enabled") && !e.affectsConfiguration("accessibility.dimUnfocused.opacity")) {
                return;
            }
            let cssTextContent = '';
            const enabled = ensureBoolean(configurationService.getValue("accessibility.dimUnfocused.enabled"), false);
            if (enabled) {
                const opacity = clamp(ensureNumber(configurationService.getValue("accessibility.dimUnfocused.opacity"), 0.75), 0.2, 1);
                if (opacity !== 1) {
                    const rules = new Set();
                    const filterRule = `filter: opacity(${opacity});`;
                    rules.add(`.monaco-workbench .pane-body.integrated-terminal:not(:focus-within) .tabs-container { ${filterRule} }`);
                    rules.add(`.monaco-workbench .pane-body.integrated-terminal .terminal-wrapper:not(:focus-within) { ${filterRule} }`);
                    rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .monaco-editor { ${filterRule} }`);
                    rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .breadcrumbs-below-tabs { ${filterRule} }`);
                    rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .terminal-wrapper { ${filterRule} }`);
                    rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .settings-editor { ${filterRule} }`);
                    rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .keybindings-editor { ${filterRule} }`);
                    rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .monaco-editor-pane-placeholder { ${filterRule} }`);
                    rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .gettingStartedContainer { ${filterRule} }`);
                    cssTextContent = [...rules].join('\n');
                }
            }
            if (cssTextContent.length === 0) {
                this._removeStyleElement();
            }
            else {
                this._getStyleElement().textContent = cssTextContent;
            }
        }));
    }
    _getStyleElement() {
        if (!this._styleElement) {
            this._styleElementDisposables = new DisposableStore();
            this._styleElement = createStyleSheet(undefined, undefined, this._styleElementDisposables);
            this._styleElement.className = 'accessibilityUnfocusedViewOpacity';
        }
        return this._styleElement;
    }
    _removeStyleElement() {
        this._styleElementDisposables?.dispose();
        this._styleElementDisposables = undefined;
        this._styleElement = undefined;
    }
};
UnfocusedViewDimmingContribution = __decorate([
    __param(0, IConfigurationService),
    __metadata("design:paramtypes", [Object])
], UnfocusedViewDimmingContribution);
export { UnfocusedViewDimmingContribution };
function ensureBoolean(value, defaultValue) {
    return typeof value === 'boolean' ? value : defaultValue;
}
function ensureNumber(value, defaultValue) {
    return typeof value === 'number' ? value : defaultValue;
}
