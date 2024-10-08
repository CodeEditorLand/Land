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
import { generateUuid } from '../../../../base/common/uuid.js';
import { generateTokensCSSForColorMap } from '../../../../editor/common/languages/supports/tokenization.js';
import { TokenizationRegistry } from '../../../../editor/common/languages.js';
import { DEFAULT_MARKDOWN_STYLES, renderMarkdownDocument } from '../../markdown/browser/markdownDocumentRenderer.js';
import { language } from '../../../../base/common/platform.js';
import { joinPath } from '../../../../base/common/resources.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { asWebviewUri } from '../../webview/common/webview.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { gettingStartedContentRegistry } from '../common/gettingStartedContent.js';
let GettingStartedDetailsRenderer = class GettingStartedDetailsRenderer {
    constructor(fileService, notificationService, extensionService, languageService) {
        this.fileService = fileService;
        this.notificationService = notificationService;
        this.extensionService = extensionService;
        this.languageService = languageService;
        this.mdCache = new ResourceMap();
        this.svgCache = new ResourceMap();
    }
    async renderMarkdown(path, base) {
        const content = await this.readAndCacheStepMarkdown(path, base);
        const nonce = generateUuid();
        const colorMap = TokenizationRegistry.getColorMap();
        const css = colorMap ? generateTokensCSSForColorMap(colorMap) : '';
        const inDev = document.location.protocol === 'http:';
        const imgSrcCsp = inDev ? 'img-src https: data: http:' : 'img-src https: data:';
        return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; ${imgSrcCsp}; media-src https:; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${DEFAULT_MARKDOWN_STYLES}
					${css}
					body > img {
						align-self: flex-start;
					}
					body > img[centered] {
						align-self: center;
					}
					body {
						display: flex;
						flex-direction: column;
						padding: 0;
						height: inherit;
					}
					.theme-picker-row {
						display: flex;
						justify-content: center;
						gap: 32px;
					}
					checklist {
						display: flex;
						gap: 32px;
						flex-direction: column;
					}
					checkbox {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin: 5px;
						cursor: pointer;
					}
					checkbox > img {
						margin-bottom: 8px !important;
					}
					checkbox.checked > img {
						box-sizing: border-box;
					}
					checkbox.checked > img {
						outline: 2px solid var(--vscode-focusBorder);
						outline-offset: 4px;
						border-radius: 4px;
					}
					.theme-picker-link {
						margin-top: 16px;
						color: var(--vscode-textLink-foreground);
					}
					blockquote > p:first-child {
						margin-top: 0;
					}
					body > * {
						margin-block-end: 0.25em;
						margin-block-start: 0.25em;
					}
					vertically-centered {
						padding-top: 5px;
						padding-bottom: 5px;
						display: flex;
						justify-content: center;
						flex-direction: column;
					}
					html {
						height: 100%;
						padding-right: 32px;
					}
					h1 {
						font-size: 19.5px;
					}
					h2 {
						font-size: 18.5px;
					}
				</style>
			</head>
			<body>
				<vertically-centered>
					${content}
				</vertically-centered>
			</body>
			<script nonce="${nonce}">
				const vscode = acquireVsCodeApi();

				document.querySelectorAll('[when-checked]').forEach(el => {
					el.addEventListener('click', () => {
						vscode.postMessage(el.getAttribute('when-checked'));
					});
				});

				let ongoingLayout = undefined;
				const doLayout = () => {
					document.querySelectorAll('vertically-centered').forEach(element => {
						element.style.marginTop = Math.max((document.body.clientHeight - element.scrollHeight) * 3/10, 0) + 'px';
					});
					ongoingLayout = undefined;
				};

				const layout = () => {
					if (ongoingLayout) {
						clearTimeout(ongoingLayout);
					}
					ongoingLayout = setTimeout(doLayout, 0);
				};

				layout();

				document.querySelectorAll('img').forEach(element => {
					element.onload = layout;
				})

				window.addEventListener('message', event => {
					if (event.data.layoutMeNow) {
						layout();
					}
					if (event.data.enabledContextKeys) {
						document.querySelectorAll('.checked').forEach(element => element.classList.remove('checked'))
						for (const key of event.data.enabledContextKeys) {
							document.querySelectorAll('[checked-on="' + key + '"]').forEach(element => element.classList.add('checked'))
						}
					}
				});
		</script>
		</html>`;
    }
    async renderSVG(path) {
        const content = await this.readAndCacheSVGFile(path);
        const nonce = generateUuid();
        const colorMap = TokenizationRegistry.getColorMap();
        const css = colorMap ? generateTokensCSSForColorMap(colorMap) : '';
        return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${DEFAULT_MARKDOWN_STYLES}
					${css}
					svg {
						position: fixed;
						height: 100%;
						width: 80%;
						left: 50%;
						top: 50%;
						max-width: 530px;
						min-width: 350px;
						transform: translate(-50%,-50%);
					}
				</style>
			</head>
			<body>
				${content}
			</body>
		</html>`;
    }
    async readAndCacheSVGFile(path) {
        if (!this.svgCache.has(path)) {
            const contents = await this.readContentsOfPath(path, false);
            this.svgCache.set(path, contents);
        }
        return assertIsDefined(this.svgCache.get(path));
    }
    async readAndCacheStepMarkdown(path, base) {
        if (!this.mdCache.has(path)) {
            const contents = await this.readContentsOfPath(path);
            const markdownContents = await renderMarkdownDocument(transformUris(contents, base), this.extensionService, this.languageService, { allowUnknownProtocols: true });
            this.mdCache.set(path, markdownContents);
        }
        return assertIsDefined(this.mdCache.get(path));
    }
    async readContentsOfPath(path, useModuleId = true) {
        try {
            const moduleId = JSON.parse(path.query).moduleId;
            if (useModuleId && moduleId) {
                const contents = await new Promise((resolve, reject) => {
                    const provider = gettingStartedContentRegistry.getProvider(moduleId);
                    if (!provider) {
                        reject(`Getting started: no provider registered for ${moduleId}`);
                    }
                    else {
                        resolve(provider());
                    }
                });
                return contents;
            }
        }
        catch { }
        try {
            const localizedPath = path.with({ path: path.path.replace(/\.md$/, `.nls.${language}.md`) });
            const generalizedLocale = language?.replace(/-.*$/, '');
            const generalizedLocalizedPath = path.with({ path: path.path.replace(/\.md$/, `.nls.${generalizedLocale}.md`) });
            const fileExists = (file) => this.fileService
                .stat(file)
                .then((stat) => !!stat.size) // Double check the file actually has content for fileSystemProviders that fake `stat`. #131809
                .catch(() => false);
            const [localizedFileExists, generalizedLocalizedFileExists] = await Promise.all([
                fileExists(localizedPath),
                fileExists(generalizedLocalizedPath),
            ]);
            const bytes = await this.fileService.readFile(localizedFileExists
                ? localizedPath
                : generalizedLocalizedFileExists
                    ? generalizedLocalizedPath
                    : path);
            return bytes.value.toString();
        }
        catch (e) {
            this.notificationService.error('Error reading markdown document at `' + path + '`: ' + e);
            return '';
        }
    }
};
GettingStartedDetailsRenderer = __decorate([
    __param(0, IFileService),
    __param(1, INotificationService),
    __param(2, IExtensionService),
    __param(3, ILanguageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GettingStartedDetailsRenderer);
export { GettingStartedDetailsRenderer };
const transformUri = (src, base) => {
    const path = joinPath(base, src);
    return asWebviewUri(path).toString(true);
};
const transformUris = (content, base) => content
    .replace(/src="([^"]*)"/g, (_, src) => {
    if (src.startsWith('https://')) {
        return `src="${src}"`;
    }
    return `src="${transformUri(src, base)}"`;
})
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (_, title, src) => {
    if (src.startsWith('https://')) {
        return `![${title}](${src})`;
    }
    return `![${title}](${transformUri(src, base)})`;
});
