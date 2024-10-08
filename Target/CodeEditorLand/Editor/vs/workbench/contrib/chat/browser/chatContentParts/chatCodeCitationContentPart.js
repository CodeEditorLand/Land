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
import * as dom from '../../../../../base/browser/dom.js';
import { Button } from '../../../../../base/browser/ui/button/button.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { localize } from '../../../../../nls.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { getCodeCitationsMessage } from '../../common/chatModel.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
let ChatCodeCitationContentPart = class ChatCodeCitationContentPart extends Disposable {
    constructor(citations, context, editorService, telemetryService) {
        super();
        this.editorService = editorService;
        this.telemetryService = telemetryService;
        const label = getCodeCitationsMessage(citations.citations);
        const elements = dom.h('.chat-code-citation-message@root', [
            dom.h('span.chat-code-citation-label@label'),
            dom.h('.chat-code-citation-button-container@button'),
        ]);
        elements.label.textContent = label + ' - ';
        const button = this._register(new Button(elements.button, {
            buttonBackground: undefined,
            buttonBorder: undefined,
            buttonForeground: undefined,
            buttonHoverBackground: undefined,
            buttonSecondaryBackground: undefined,
            buttonSecondaryForeground: undefined,
            buttonSecondaryHoverBackground: undefined,
            buttonSeparator: undefined
        }));
        button.label = localize('viewMatches', "View matches");
        this._register(button.onDidClick(() => {
            const citationText = `# Code Citations\n\n` + citations.citations.map(c => `## License: ${c.license}\n${c.value.toString()}\n\n\`\`\`\n${c.snippet}\n\`\`\`\n\n`).join('\n');
            this.editorService.openEditor({ resource: undefined, contents: citationText, languageId: 'markdown' });
            this.telemetryService.publicLog2('openedChatCodeCitations');
        }));
        this.domNode = elements.root;
    }
    hasSameContent(other, followingContent, element) {
        return other.kind === 'codeCitations';
    }
};
ChatCodeCitationContentPart = __decorate([
    __param(2, IEditorService),
    __param(3, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ChatCodeCitationContentPart);
export { ChatCodeCitationContentPart };
