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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { extractCodeblockUrisFromText, extractVulnerabilitiesFromText } from './annotations.js';
import { isResponseVM } from './chatViewModel.js';
let CodeBlockModelCollection = class CodeBlockModelCollection extends Disposable {
    constructor(languageService, textModelService) {
        super();
        this.languageService = languageService;
        this.textModelService = textModelService;
        this._models = new ResourceMap();
        /**
         * Max number of models to keep in memory.
         *
         * Currently always maintains the most recently created models.
         */
        this.maxModelCount = 100;
    }
    dispose() {
        super.dispose();
        this.clear();
    }
    get(sessionId, chat, codeBlockIndex) {
        const uri = this.getUri(sessionId, chat, codeBlockIndex);
        const entry = this._models.get(uri);
        if (!entry) {
            return;
        }
        return { model: entry.model.then(ref => ref.object), vulns: entry.vulns, codemapperUri: entry.codemapperUri };
    }
    getOrCreate(sessionId, chat, codeBlockIndex) {
        const existing = this.get(sessionId, chat, codeBlockIndex);
        if (existing) {
            return existing;
        }
        const uri = this.getUri(sessionId, chat, codeBlockIndex);
        const ref = this.textModelService.createModelReference(uri);
        this._models.set(uri, { model: ref, vulns: [], codemapperUri: undefined });
        while (this._models.size > this.maxModelCount) {
            const first = Array.from(this._models.keys()).at(0);
            if (!first) {
                break;
            }
            this.delete(first);
        }
        return { model: ref.then(ref => ref.object), vulns: [], codemapperUri: undefined };
    }
    delete(codeBlockUri) {
        const entry = this._models.get(codeBlockUri);
        if (!entry) {
            return;
        }
        entry.model.then(ref => ref.dispose());
        this._models.delete(codeBlockUri);
    }
    clear() {
        this._models.forEach(async (entry) => (await entry.model).dispose());
        this._models.clear();
    }
    async update(sessionId, chat, codeBlockIndex, content) {
        const entry = this.getOrCreate(sessionId, chat, codeBlockIndex);
        const extractedVulns = extractVulnerabilitiesFromText(content.text);
        let newText = fixCodeText(extractedVulns.newText, content.languageId);
        this.setVulns(sessionId, chat, codeBlockIndex, extractedVulns.vulnerabilities);
        const codeblockUri = extractCodeblockUrisFromText(newText);
        if (codeblockUri) {
            this.setCodemapperUri(sessionId, chat, codeBlockIndex, codeblockUri.uri);
            newText = codeblockUri.textWithoutResult;
        }
        const textModel = (await entry.model).textEditorModel;
        if (content.languageId) {
            const vscodeLanguageId = this.languageService.getLanguageIdByLanguageName(content.languageId);
            if (vscodeLanguageId && vscodeLanguageId !== textModel.getLanguageId()) {
                textModel.setLanguage(vscodeLanguageId);
            }
        }
        const currentText = textModel.getValue(1 /* EndOfLinePreference.LF */);
        if (newText === currentText) {
            return entry;
        }
        if (newText.startsWith(currentText)) {
            const text = newText.slice(currentText.length);
            const lastLine = textModel.getLineCount();
            const lastCol = textModel.getLineMaxColumn(lastLine);
            textModel.applyEdits([{ range: new Range(lastLine, lastCol, lastLine, lastCol), text }]);
        }
        else {
            // console.log(`Failed to optimize setText`);
            textModel.setValue(newText);
        }
        return entry;
    }
    setCodemapperUri(sessionId, chat, codeBlockIndex, codemapperUri) {
        const uri = this.getUri(sessionId, chat, codeBlockIndex);
        const entry = this._models.get(uri);
        if (entry) {
            entry.codemapperUri = codemapperUri;
        }
    }
    setVulns(sessionId, chat, codeBlockIndex, vulnerabilities) {
        const uri = this.getUri(sessionId, chat, codeBlockIndex);
        const entry = this._models.get(uri);
        if (entry) {
            entry.vulns = vulnerabilities;
        }
    }
    getUri(sessionId, chat, index) {
        const metadata = this.getUriMetaData(chat);
        return URI.from({
            scheme: Schemas.vscodeChatCodeBlock,
            authority: sessionId,
            path: `/${chat.id}/${index}`,
            fragment: metadata ? JSON.stringify(metadata) : undefined,
        });
    }
    getUriMetaData(chat) {
        if (!isResponseVM(chat)) {
            return undefined;
        }
        return {
            references: chat.contentReferences.map(ref => {
                if (typeof ref.reference === 'string') {
                    return;
                }
                const uriOrLocation = 'variableName' in ref.reference ?
                    ref.reference.value :
                    ref.reference;
                if (!uriOrLocation) {
                    return;
                }
                if (URI.isUri(uriOrLocation)) {
                    return {
                        uri: uriOrLocation.toJSON()
                    };
                }
                return {
                    uri: uriOrLocation.uri.toJSON(),
                    range: uriOrLocation.range,
                };
            })
        };
    }
};
CodeBlockModelCollection = __decorate([
    __param(0, ILanguageService),
    __param(1, ITextModelService),
    __metadata("design:paramtypes", [Object, Object])
], CodeBlockModelCollection);
export { CodeBlockModelCollection };
function fixCodeText(text, languageId) {
    if (languageId === 'php') {
        if (!text.trim().startsWith('<')) {
            return `<?php\n${text}`;
        }
    }
    return text;
}
