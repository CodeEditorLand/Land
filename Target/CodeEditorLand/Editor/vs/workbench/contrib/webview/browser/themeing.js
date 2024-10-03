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
import { DEFAULT_FONT_FAMILY } from '../../../../base/browser/fonts.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { EDITOR_FONT_DEFAULTS } from '../../../../editor/common/config/editorOptions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import * as colorRegistry from '../../../../platform/theme/common/colorRegistry.js';
import { ColorScheme } from '../../../../platform/theme/common/theme.js';
import { IWorkbenchThemeService } from '../../../services/themes/common/workbenchThemeService.js';
let WebviewThemeDataProvider = class WebviewThemeDataProvider extends Disposable {
    constructor(_themeService, _configurationService) {
        super();
        this._themeService = _themeService;
        this._configurationService = _configurationService;
        this._cachedWebViewThemeData = undefined;
        this._onThemeDataChanged = this._register(new Emitter());
        this.onThemeDataChanged = this._onThemeDataChanged.event;
        this._register(this._themeService.onDidColorThemeChange(() => {
            this._reset();
        }));
        const webviewConfigurationKeys = ['editor.fontFamily', 'editor.fontWeight', 'editor.fontSize', 'accessibility.underlineLinks'];
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (webviewConfigurationKeys.some(key => e.affectsConfiguration(key))) {
                this._reset();
            }
        }));
    }
    getTheme() {
        return this._themeService.getColorTheme();
    }
    getWebviewThemeData() {
        if (!this._cachedWebViewThemeData) {
            const configuration = this._configurationService.getValue('editor');
            const editorFontFamily = configuration.fontFamily || EDITOR_FONT_DEFAULTS.fontFamily;
            const editorFontWeight = configuration.fontWeight || EDITOR_FONT_DEFAULTS.fontWeight;
            const editorFontSize = configuration.fontSize || EDITOR_FONT_DEFAULTS.fontSize;
            const linkUnderlines = this._configurationService.getValue('accessibility.underlineLinks');
            const theme = this._themeService.getColorTheme();
            const exportedColors = colorRegistry.getColorRegistry().getColors().reduce((colors, entry) => {
                const color = theme.getColor(entry.id);
                if (color) {
                    colors['vscode-' + entry.id.replace('.', '-')] = color.toString();
                }
                return colors;
            }, {});
            const styles = {
                'vscode-font-family': DEFAULT_FONT_FAMILY,
                'vscode-font-weight': 'normal',
                'vscode-font-size': '13px',
                'vscode-editor-font-family': editorFontFamily,
                'vscode-editor-font-weight': editorFontWeight,
                'vscode-editor-font-size': editorFontSize + 'px',
                'text-link-decoration': linkUnderlines ? 'underline' : 'none',
                ...exportedColors
            };
            const activeTheme = ApiThemeClassName.fromTheme(theme);
            this._cachedWebViewThemeData = { styles, activeTheme, themeLabel: theme.label, themeId: theme.settingsId };
        }
        return this._cachedWebViewThemeData;
    }
    _reset() {
        this._cachedWebViewThemeData = undefined;
        this._onThemeDataChanged.fire();
    }
};
WebviewThemeDataProvider = __decorate([
    __param(0, IWorkbenchThemeService),
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], WebviewThemeDataProvider);
export { WebviewThemeDataProvider };
var ApiThemeClassName;
(function (ApiThemeClassName) {
    ApiThemeClassName["light"] = "vscode-light";
    ApiThemeClassName["dark"] = "vscode-dark";
    ApiThemeClassName["highContrast"] = "vscode-high-contrast";
    ApiThemeClassName["highContrastLight"] = "vscode-high-contrast-light";
})(ApiThemeClassName || (ApiThemeClassName = {}));
(function (ApiThemeClassName) {
    function fromTheme(theme) {
        switch (theme.type) {
            case ColorScheme.LIGHT: return ApiThemeClassName.light;
            case ColorScheme.DARK: return ApiThemeClassName.dark;
            case ColorScheme.HIGH_CONTRAST_DARK: return ApiThemeClassName.highContrast;
            case ColorScheme.HIGH_CONTRAST_LIGHT: return ApiThemeClassName.highContrastLight;
        }
    }
    ApiThemeClassName.fromTheme = fromTheme;
})(ApiThemeClassName || (ApiThemeClassName = {}));
