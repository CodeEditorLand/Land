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
import * as dom from '../../../../base/browser/dom.js';
import { Delayer } from '../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { MicrotaskDelay } from '../../../../base/common/symbols.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { TerminalCapabilityStore } from '../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js';
import { TerminalExtensionsRegistry } from './terminalExtensions.js';
import { TerminalWidgetManager } from './widgets/widgetManager.js';
import { XtermTerminal } from './xterm/xtermTerminal.js';
let DetachedTerminal = class DetachedTerminal extends Disposable {
    get xterm() {
        return this._xterm;
    }
    constructor(_xterm, options, instantiationService) {
        super();
        this._xterm = _xterm;
        this._widgets = this._register(new TerminalWidgetManager());
        this.capabilities = new TerminalCapabilityStore();
        this._contributions = new Map();
        this._register(_xterm);
        const contributionDescs = TerminalExtensionsRegistry.getTerminalContributions();
        for (const desc of contributionDescs) {
            if (this._contributions.has(desc.id)) {
                onUnexpectedError(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
                continue;
            }
            if (desc.canRunInDetachedTerminals === false) {
                continue;
            }
            let contribution;
            try {
                contribution = instantiationService.createInstance(desc.ctor, this, options.processInfo, this._widgets);
                this._contributions.set(desc.id, contribution);
                this._register(contribution);
            }
            catch (err) {
                onUnexpectedError(err);
            }
        }
        this._register(new Delayer(MicrotaskDelay)).trigger(() => {
            for (const contr of this._contributions.values()) {
                contr.xtermReady?.(this._xterm);
            }
        });
    }
    get selection() {
        return this._xterm && this.hasSelection() ? this._xterm.raw.getSelection() : undefined;
    }
    hasSelection() {
        return this._xterm.hasSelection();
    }
    clearSelection() {
        this._xterm.clearSelection();
    }
    focus(force) {
        if (force || !dom.getActiveWindow().getSelection()?.toString()) {
            this.xterm.focus();
        }
    }
    attachToElement(container, options) {
        this.domElement = container;
        const screenElement = this._xterm.attachToElement(container, options);
        this._widgets.attachToElement(screenElement);
    }
    forceScrollbarVisibility() {
        this.domElement?.classList.add('force-scrollbar');
    }
    resetScrollbarVisibility() {
        this.domElement?.classList.remove('force-scrollbar');
    }
    getContribution(id) {
        return this._contributions.get(id);
    }
};
DetachedTerminal = __decorate([
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [XtermTerminal, Object, Object])
], DetachedTerminal);
export { DetachedTerminal };
export class DetachedProcessInfo {
    constructor(initialValues) {
        this.processState = 3;
        this.ptyProcessReady = Promise.resolve();
        this.initialCwd = '';
        this.shouldPersist = false;
        this.hasWrittenData = false;
        this.hasChildProcesses = false;
        this.capabilities = new TerminalCapabilityStore();
        this.shellIntegrationNonce = '';
        Object.assign(this, initialValues);
    }
}
