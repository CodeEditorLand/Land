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
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { EDITOR_FONT_DEFAULTS } from '../../../../editor/common/config/editorOptions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { DEFAULT_BOLD_FONT_WEIGHT, DEFAULT_FONT_WEIGHT, DEFAULT_LETTER_SPACING, DEFAULT_LINE_HEIGHT, MAXIMUM_FONT_WEIGHT, MINIMUM_FONT_WEIGHT, MINIMUM_LETTER_SPACING, TERMINAL_CONFIG_SECTION } from '../common/terminal.js';
import { isMacintosh } from '../../../../base/common/platform.js';
// #region TerminalConfigurationService
let TerminalConfigurationService = class TerminalConfigurationService extends Disposable {
    get config() { return this._config; }
    get onConfigChanged() { return this._onConfigChanged.event; }
    constructor(_configurationService) {
        super();
        this._configurationService = _configurationService;
        this._onConfigChanged = new Emitter();
        this._fontMetrics = this._register(new TerminalFontMetrics(this, this._configurationService));
        this._register(Event.runAndSubscribe(this._configurationService.onDidChangeConfiguration, e => {
            if (!e || e.affectsConfiguration(TERMINAL_CONFIG_SECTION)) {
                this._updateConfig();
            }
        }));
    }
    setPanelContainer(panelContainer) { return this._fontMetrics.setPanelContainer(panelContainer); }
    configFontIsMonospace() { return this._fontMetrics.configFontIsMonospace(); }
    getFont(w, xtermCore, excludeDimensions) { return this._fontMetrics.getFont(w, xtermCore, excludeDimensions); }
    _updateConfig() {
        const configValues = { ...this._configurationService.getValue(TERMINAL_CONFIG_SECTION) };
        configValues.fontWeight = this._normalizeFontWeight(configValues.fontWeight, DEFAULT_FONT_WEIGHT);
        configValues.fontWeightBold = this._normalizeFontWeight(configValues.fontWeightBold, DEFAULT_BOLD_FONT_WEIGHT);
        this._config = configValues;
        this._onConfigChanged.fire();
    }
    _normalizeFontWeight(input, defaultWeight) {
        if (input === 'normal' || input === 'bold') {
            return input;
        }
        return clampInt(input, MINIMUM_FONT_WEIGHT, MAXIMUM_FONT_WEIGHT, defaultWeight);
    }
};
TerminalConfigurationService = __decorate([
    __param(0, IConfigurationService),
    __metadata("design:paramtypes", [Object])
], TerminalConfigurationService);
export { TerminalConfigurationService };
export class TerminalFontMetrics extends Disposable {
    constructor(_terminalConfigurationService, _configurationService) {
        super();
        this._terminalConfigurationService = _terminalConfigurationService;
        this._configurationService = _configurationService;
        this.linuxDistro = 1 /* LinuxDistro.Unknown */;
        this._register(toDisposable(() => this._charMeasureElement?.remove()));
    }
    setPanelContainer(panelContainer) {
        this._panelContainer = panelContainer;
    }
    configFontIsMonospace() {
        const fontSize = 15;
        const fontFamily = this._terminalConfigurationService.config.fontFamily || this._configurationService.getValue('editor').fontFamily || EDITOR_FONT_DEFAULTS.fontFamily;
        const iRect = this._getBoundingRectFor('i', fontFamily, fontSize);
        const wRect = this._getBoundingRectFor('w', fontFamily, fontSize);
        // Check for invalid bounds, there is no reason to believe the font is not monospace
        if (!iRect || !wRect || !iRect.width || !wRect.width) {
            return true;
        }
        return iRect.width === wRect.width;
    }
    /**
     * Gets the font information based on the terminal.integrated.fontFamily
     * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
     */
    getFont(w, xtermCore, excludeDimensions) {
        const editorConfig = this._configurationService.getValue('editor');
        let fontFamily = this._terminalConfigurationService.config.fontFamily || editorConfig.fontFamily || EDITOR_FONT_DEFAULTS.fontFamily || 'monospace';
        let fontSize = clampInt(this._terminalConfigurationService.config.fontSize, 6 /* FontConstants.MinimumFontSize */, 100 /* FontConstants.MaximumFontSize */, EDITOR_FONT_DEFAULTS.fontSize);
        // Work around bad font on Fedora/Ubuntu
        if (!this._terminalConfigurationService.config.fontFamily) {
            if (this.linuxDistro === 2 /* LinuxDistro.Fedora */) {
                fontFamily = '\'DejaVu Sans Mono\'';
            }
            if (this.linuxDistro === 3 /* LinuxDistro.Ubuntu */) {
                fontFamily = '\'Ubuntu Mono\'';
                // Ubuntu mono is somehow smaller, so set fontSize a bit larger to get the same perceived size.
                fontSize = clampInt(fontSize + 2, 6 /* FontConstants.MinimumFontSize */, 100 /* FontConstants.MaximumFontSize */, EDITOR_FONT_DEFAULTS.fontSize);
            }
        }
        // Always fallback to monospace, otherwise a proportional font may become the default
        fontFamily += ', monospace';
        // Always fallback to AppleBraille on macOS, otherwise braille will render with filled and
        // empty circles in all 8 positions, instead of just filled circles
        // See https://github.com/microsoft/vscode/issues/174521
        if (isMacintosh) {
            fontFamily += ', AppleBraille';
        }
        const letterSpacing = this._terminalConfigurationService.config.letterSpacing ? Math.max(Math.floor(this._terminalConfigurationService.config.letterSpacing), MINIMUM_LETTER_SPACING) : DEFAULT_LETTER_SPACING;
        const lineHeight = this._terminalConfigurationService.config.lineHeight ? Math.max(this._terminalConfigurationService.config.lineHeight, 1) : DEFAULT_LINE_HEIGHT;
        if (excludeDimensions) {
            return {
                fontFamily,
                fontSize,
                letterSpacing,
                lineHeight
            };
        }
        // Get the character dimensions from xterm if it's available
        if (xtermCore?._renderService?._renderer.value) {
            const cellDims = xtermCore._renderService.dimensions.css.cell;
            if (cellDims?.width && cellDims?.height) {
                return {
                    fontFamily,
                    fontSize,
                    letterSpacing,
                    lineHeight,
                    charHeight: cellDims.height / lineHeight,
                    charWidth: cellDims.width - Math.round(letterSpacing) / w.devicePixelRatio
                };
            }
        }
        // Fall back to measuring the font ourselves
        return this._measureFont(w, fontFamily, fontSize, letterSpacing, lineHeight);
    }
    _createCharMeasureElementIfNecessary() {
        if (!this._panelContainer) {
            throw new Error('Cannot measure element when terminal is not attached');
        }
        // Create charMeasureElement if it hasn't been created or if it was orphaned by its parent
        if (!this._charMeasureElement || !this._charMeasureElement.parentElement) {
            this._charMeasureElement = document.createElement('div');
            this._panelContainer.appendChild(this._charMeasureElement);
        }
        return this._charMeasureElement;
    }
    _getBoundingRectFor(char, fontFamily, fontSize) {
        let charMeasureElement;
        try {
            charMeasureElement = this._createCharMeasureElementIfNecessary();
        }
        catch {
            return undefined;
        }
        const style = charMeasureElement.style;
        style.display = 'inline-block';
        style.fontFamily = fontFamily;
        style.fontSize = fontSize + 'px';
        style.lineHeight = 'normal';
        charMeasureElement.innerText = char;
        const rect = charMeasureElement.getBoundingClientRect();
        style.display = 'none';
        return rect;
    }
    _measureFont(w, fontFamily, fontSize, letterSpacing, lineHeight) {
        const rect = this._getBoundingRectFor('X', fontFamily, fontSize);
        // Bounding client rect was invalid, use last font measurement if available.
        if (this._lastFontMeasurement && (!rect || !rect.width || !rect.height)) {
            return this._lastFontMeasurement;
        }
        this._lastFontMeasurement = {
            fontFamily,
            fontSize,
            letterSpacing,
            lineHeight,
            charWidth: 0,
            charHeight: 0
        };
        if (rect && rect.width && rect.height) {
            this._lastFontMeasurement.charHeight = Math.ceil(rect.height);
            // Char width is calculated differently for DOM and the other renderer types. Refer to
            // how each renderer updates their dimensions in xterm.js
            if (this._terminalConfigurationService.config.gpuAcceleration === 'off') {
                this._lastFontMeasurement.charWidth = rect.width;
            }
            else {
                const deviceCharWidth = Math.floor(rect.width * w.devicePixelRatio);
                const deviceCellWidth = deviceCharWidth + Math.round(letterSpacing);
                const cssCellWidth = deviceCellWidth / w.devicePixelRatio;
                this._lastFontMeasurement.charWidth = cssCellWidth - Math.round(letterSpacing) / w.devicePixelRatio;
            }
        }
        return this._lastFontMeasurement;
    }
}
// #endregion TerminalFontMetrics
// #region Utils
function clampInt(source, minimum, maximum, fallback) {
    let r = parseInt(source, 10);
    if (isNaN(r)) {
        return fallback;
    }
    if (typeof minimum === 'number') {
        r = Math.max(minimum, r);
    }
    if (typeof maximum === 'number') {
        r = Math.min(maximum, r);
    }
    return r;
}
// #endregion Utils
