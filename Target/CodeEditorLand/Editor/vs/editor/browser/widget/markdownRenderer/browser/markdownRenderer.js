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
var MarkdownRenderer_1;
import { renderMarkdown } from '../../../../../base/browser/markdownRenderer.js';
import { createTrustedTypesPolicy } from '../../../../../base/browser/trustedTypes.js';
import { onUnexpectedError } from '../../../../../base/common/errors.js';
import { Emitter } from '../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import './renderedMarkdown.css';
import { applyFontInfo } from '../../../config/domFontInfo.js';
import { ILanguageService } from '../../../../common/languages/language.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../common/languages/modesRegistry.js';
import { tokenizeToString } from '../../../../common/languages/textToHtmlTokenizer.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
let MarkdownRenderer = class MarkdownRenderer {
    static { MarkdownRenderer_1 = this; }
    static { this._ttpTokenizer = createTrustedTypesPolicy('tokenizeToString', {
        createHTML(html) {
            return html;
        }
    }); }
    constructor(_options, _languageService, _openerService) {
        this._options = _options;
        this._languageService = _languageService;
        this._openerService = _openerService;
        this._onDidRenderAsync = new Emitter();
        this.onDidRenderAsync = this._onDidRenderAsync.event;
    }
    dispose() {
        this._onDidRenderAsync.dispose();
    }
    render(markdown, options, markedOptions) {
        if (!markdown) {
            const element = document.createElement('span');
            return { element, dispose: () => { } };
        }
        const disposables = new DisposableStore();
        const rendered = disposables.add(renderMarkdown(markdown, { ...this._getRenderOptions(markdown, disposables), ...options }, markedOptions));
        rendered.element.classList.add('rendered-markdown');
        return {
            element: rendered.element,
            dispose: () => disposables.dispose()
        };
    }
    _getRenderOptions(markdown, disposables) {
        return {
            codeBlockRenderer: async (languageAlias, value) => {
                let languageId;
                if (languageAlias) {
                    languageId = this._languageService.getLanguageIdByLanguageName(languageAlias);
                }
                else if (this._options.editor) {
                    languageId = this._options.editor.getModel()?.getLanguageId();
                }
                if (!languageId) {
                    languageId = PLAINTEXT_LANGUAGE_ID;
                }
                const html = await tokenizeToString(this._languageService, value, languageId);
                const element = document.createElement('span');
                element.innerHTML = (MarkdownRenderer_1._ttpTokenizer?.createHTML(html) ?? html);
                if (this._options.editor) {
                    const fontInfo = this._options.editor.getOption(52);
                    applyFontInfo(element, fontInfo);
                }
                else if (this._options.codeBlockFontFamily) {
                    element.style.fontFamily = this._options.codeBlockFontFamily;
                }
                if (this._options.codeBlockFontSize !== undefined) {
                    element.style.fontSize = this._options.codeBlockFontSize;
                }
                return element;
            },
            asyncRenderCallback: () => this._onDidRenderAsync.fire(),
            actionHandler: {
                callback: (link) => this.openMarkdownLink(link, markdown),
                disposables: disposables
            }
        };
    }
    async openMarkdownLink(link, markdown) {
        await openLinkFromMarkdown(this._openerService, link, markdown.isTrusted);
    }
};
MarkdownRenderer = MarkdownRenderer_1 = __decorate([
    __param(1, ILanguageService),
    __param(2, IOpenerService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MarkdownRenderer);
export { MarkdownRenderer };
export async function openLinkFromMarkdown(openerService, link, isTrusted) {
    try {
        return await openerService.open(link, {
            fromUserGesture: true,
            allowContributedOpeners: true,
            allowCommands: toAllowCommandsOption(isTrusted),
        });
    }
    catch (e) {
        onUnexpectedError(e);
        return false;
    }
}
function toAllowCommandsOption(isTrusted) {
    if (isTrusted === true) {
        return true;
    }
    if (isTrusted && Array.isArray(isTrusted.enabledCommands)) {
        return isTrusted.enabledCommands;
    }
    return false;
}
