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
var ChatEditorOptions_1;
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewDescriptorService } from '../../../common/views.js';
let ChatEditorOptions = class ChatEditorOptions extends Disposable {
    static { ChatEditorOptions_1 = this; }
    static { this.lineHeightEm = 1.4; }
    get configuration() {
        return this._config;
    }
    static { this.relevantSettingIds = [
        'chat.editor.lineHeight',
        'chat.editor.fontSize',
        'chat.editor.fontFamily',
        'chat.editor.fontWeight',
        'chat.editor.wordWrap',
        'editor.cursorBlinking',
        'editor.fontLigatures',
        'editor.accessibilitySupport',
        'editor.bracketPairColorization.enabled',
        'editor.bracketPairColorization.independentColorPoolPerBracketType',
    ]; }
    constructor(viewId, foreground, inputEditorBackgroundColor, resultEditorBackgroundColor, configurationService, themeService, viewDescriptorService) {
        super();
        this.foreground = foreground;
        this.inputEditorBackgroundColor = inputEditorBackgroundColor;
        this.resultEditorBackgroundColor = resultEditorBackgroundColor;
        this.configurationService = configurationService;
        this.themeService = themeService;
        this.viewDescriptorService = viewDescriptorService;
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._register(this.themeService.onDidColorThemeChange(e => this.update()));
        this._register(this.viewDescriptorService.onDidChangeLocation(e => {
            if (e.views.some(v => v.id === viewId)) {
                this.update();
            }
        }));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (ChatEditorOptions_1.relevantSettingIds.some(id => e.affectsConfiguration(id))) {
                this.update();
            }
        }));
        this.update();
    }
    update() {
        const editorConfig = this.configurationService.getValue('editor');
        const chatEditorConfig = this.configurationService.getValue('chat')?.editor;
        const accessibilitySupport = this.configurationService.getValue('editor.accessibilitySupport');
        this._config = {
            foreground: this.themeService.getColorTheme().getColor(this.foreground),
            inputEditor: {
                backgroundColor: this.themeService.getColorTheme().getColor(this.inputEditorBackgroundColor),
                accessibilitySupport,
            },
            resultEditor: {
                backgroundColor: this.themeService.getColorTheme().getColor(this.resultEditorBackgroundColor),
                fontSize: chatEditorConfig.fontSize,
                fontFamily: chatEditorConfig.fontFamily === 'default' ? editorConfig.fontFamily : chatEditorConfig.fontFamily,
                fontWeight: chatEditorConfig.fontWeight,
                lineHeight: chatEditorConfig.lineHeight ? chatEditorConfig.lineHeight : ChatEditorOptions_1.lineHeightEm * chatEditorConfig.fontSize,
                bracketPairColorization: {
                    enabled: this.configurationService.getValue('editor.bracketPairColorization.enabled'),
                    independentColorPoolPerBracketType: this.configurationService.getValue('editor.bracketPairColorization.independentColorPoolPerBracketType'),
                },
                wordWrap: chatEditorConfig.wordWrap,
                fontLigatures: editorConfig.fontLigatures,
            }
        };
        this._onDidChange.fire();
    }
};
ChatEditorOptions = ChatEditorOptions_1 = __decorate([
    __param(4, IConfigurationService),
    __param(5, IThemeService),
    __param(6, IViewDescriptorService),
    __metadata("design:paramtypes", [Object, String, String, String, Object, Object, Object])
], ChatEditorOptions);
export { ChatEditorOptions };
