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
var TerminalMouseWheelZoomContribution_1;
import { Event } from '../../../../../base/common/event.js';
import { MouseWheelClassifier } from '../../../../../base/browser/ui/scrollbar/scrollableElement.js';
import { Disposable, MutableDisposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { isMacintosh } from '../../../../../base/common/platform.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { registerTerminalAction } from '../../../terminal/browser/terminalActions.js';
import { localize2 } from '../../../../../nls.js';
import { isNumber } from '../../../../../base/common/types.js';
import { defaultTerminalFontSize } from '../../../terminal/common/terminalConfiguration.js';
let TerminalMouseWheelZoomContribution = class TerminalMouseWheelZoomContribution extends Disposable {
    static { TerminalMouseWheelZoomContribution_1 = this; }
    static { this.ID = 'terminal.mouseWheelZoom'; }
    static get(instance) {
        return instance.getContribution(TerminalMouseWheelZoomContribution_1.ID);
    }
    constructor(_ctx, _configurationService) {
        super();
        this._configurationService = _configurationService;
        this._listener = this._register(new MutableDisposable());
    }
    xtermOpen(xterm) {
        this._register(Event.runAndSubscribe(this._configurationService.onDidChangeConfiguration, e => {
            if (!e || e.affectsConfiguration("terminal.integrated.mouseWheelZoom" /* TerminalZoomSettingId.MouseWheelZoom */)) {
                if (!!this._configurationService.getValue("terminal.integrated.mouseWheelZoom" /* TerminalZoomSettingId.MouseWheelZoom */)) {
                    this._setupMouseWheelZoomListener(xterm.raw);
                }
                else {
                    this._listener.clear();
                }
            }
        }));
    }
    _getConfigFontSize() {
        return this._configurationService.getValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */);
    }
    _setupMouseWheelZoomListener(raw) {
        // This is essentially a copy of what we do in the editor, just we modify font size directly
        // as there is no separate zoom level concept in the terminal
        const classifier = MouseWheelClassifier.INSTANCE;
        let prevMouseWheelTime = 0;
        let gestureStartFontSize = this._getConfigFontSize();
        let gestureHasZoomModifiers = false;
        let gestureAccumulatedDelta = 0;
        raw.attachCustomWheelEventHandler((e) => {
            const browserEvent = e;
            if (classifier.isPhysicalMouseWheel()) {
                if (this._hasMouseWheelZoomModifiers(browserEvent)) {
                    const delta = browserEvent.deltaY > 0 ? -1 : 1;
                    this._configurationService.updateValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */, this._getConfigFontSize() + delta);
                    // EditorZoom.setZoomLevel(zoomLevel + delta);
                    browserEvent.preventDefault();
                    browserEvent.stopPropagation();
                    return false;
                }
            }
            else {
                // we consider mousewheel events that occur within 50ms of each other to be part of the same gesture
                // we don't want to consider mouse wheel events where ctrl/cmd is pressed during the inertia phase
                // we also want to accumulate deltaY values from the same gesture and use that to set the zoom level
                if (Date.now() - prevMouseWheelTime > 50) {
                    // reset if more than 50ms have passed
                    gestureStartFontSize = this._getConfigFontSize();
                    gestureHasZoomModifiers = this._hasMouseWheelZoomModifiers(browserEvent);
                    gestureAccumulatedDelta = 0;
                }
                prevMouseWheelTime = Date.now();
                gestureAccumulatedDelta += browserEvent.deltaY;
                if (gestureHasZoomModifiers) {
                    const deltaAbs = Math.ceil(Math.abs(gestureAccumulatedDelta / 5));
                    const deltaDirection = gestureAccumulatedDelta > 0 ? -1 : 1;
                    const delta = deltaAbs * deltaDirection;
                    this._configurationService.updateValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */, gestureStartFontSize + delta);
                    gestureAccumulatedDelta += browserEvent.deltaY;
                    browserEvent.preventDefault();
                    browserEvent.stopPropagation();
                    return false;
                }
            }
            return true;
        });
        this._listener.value = toDisposable(() => raw.attachCustomWheelEventHandler(() => true));
    }
    _hasMouseWheelZoomModifiers(browserEvent) {
        return (isMacintosh
            // on macOS we support cmd + two fingers scroll (`metaKey` set)
            // and also the two fingers pinch gesture (`ctrKey` set)
            ? ((browserEvent.metaKey || browserEvent.ctrlKey) && !browserEvent.shiftKey && !browserEvent.altKey)
            : (browserEvent.ctrlKey && !browserEvent.metaKey && !browserEvent.shiftKey && !browserEvent.altKey));
    }
};
TerminalMouseWheelZoomContribution = TerminalMouseWheelZoomContribution_1 = __decorate([
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], TerminalMouseWheelZoomContribution);
registerTerminalContribution(TerminalMouseWheelZoomContribution.ID, TerminalMouseWheelZoomContribution, true);
registerTerminalAction({
    id: "workbench.action.terminal.fontZoomIn" /* TerminalZoomCommandId.FontZoomIn */,
    title: localize2('fontZoomIn', 'Increase Font Size'),
    run: async (c, accessor) => {
        const configurationService = accessor.get(IConfigurationService);
        const value = configurationService.getValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */);
        if (isNumber(value)) {
            await configurationService.updateValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */, value + 1);
        }
    }
});
registerTerminalAction({
    id: "workbench.action.terminal.fontZoomOut" /* TerminalZoomCommandId.FontZoomOut */,
    title: localize2('fontZoomOut', 'Decrease Font Size'),
    run: async (c, accessor) => {
        const configurationService = accessor.get(IConfigurationService);
        const value = configurationService.getValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */);
        if (isNumber(value)) {
            await configurationService.updateValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */, value - 1);
        }
    }
});
registerTerminalAction({
    id: "workbench.action.terminal.fontZoomReset" /* TerminalZoomCommandId.FontZoomReset */,
    title: localize2('fontZoomReset', 'Reset Font Size'),
    run: async (c, accessor) => {
        const configurationService = accessor.get(IConfigurationService);
        await configurationService.updateValue("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */, defaultTerminalFontSize);
    }
});
