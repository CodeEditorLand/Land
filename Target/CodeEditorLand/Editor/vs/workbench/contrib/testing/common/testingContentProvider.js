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
import { VSBuffer } from '../../../../base/common/buffer.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { removeAnsiEscapeCodes } from '../../../../base/common/strings.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../nls.js';
import { ITestResultService } from './testResultService.js';
import { TEST_DATA_SCHEME, parseTestUri } from './testingUri.js';
/**
 * A content provider that returns various outputs for tests. This is used
 * in the inline peek view.
 */
let TestingContentProvider = class TestingContentProvider {
    constructor(textModelResolverService, languageService, modelService, resultService) {
        this.languageService = languageService;
        this.modelService = modelService;
        this.resultService = resultService;
        textModelResolverService.registerTextModelContentProvider(TEST_DATA_SCHEME, this);
    }
    /**
     * @inheritdoc
     */
    async provideTextContent(resource) {
        const existing = this.modelService.getModel(resource);
        if (existing && !existing.isDisposed()) {
            return existing;
        }
        const parsed = parseTestUri(resource);
        if (!parsed) {
            return null;
        }
        const result = this.resultService.getResult(parsed.resultId);
        if (!result) {
            return null;
        }
        if (parsed.type === 0 /* TestUriType.TaskOutput */) {
            const task = result.tasks[parsed.taskIndex];
            const model = this.modelService.createModel('', null, resource, false);
            const append = (text) => model.applyEdits([{
                    range: { startColumn: 1, endColumn: 1, startLineNumber: Infinity, endLineNumber: Infinity },
                    text,
                }]);
            const init = VSBuffer.concat(task.output.buffers, task.output.length).toString();
            append(removeAnsiEscapeCodes(init));
            let hadContent = init.length > 0;
            const dispose = new DisposableStore();
            dispose.add(task.output.onDidWriteData(d => {
                hadContent ||= d.byteLength > 0;
                append(removeAnsiEscapeCodes(d.toString()));
            }));
            task.output.endPromise.then(() => {
                if (dispose.isDisposed) {
                    return;
                }
                if (!hadContent) {
                    append(localize('runNoOutout', 'The test run did not record any output.'));
                    dispose.dispose();
                }
            });
            model.onWillDispose(() => dispose.dispose());
            return model;
        }
        const test = result?.getStateById(parsed.testExtId);
        if (!test) {
            return null;
        }
        let text;
        let language = null;
        switch (parsed.type) {
            case 3 /* TestUriType.ResultActualOutput */: {
                const message = test.tasks[parsed.taskIndex].messages[parsed.messageIndex];
                if (message?.type === 0 /* TestMessageType.Error */) {
                    text = message.actual;
                }
                break;
            }
            case 1 /* TestUriType.TestOutput */: {
                text = '';
                const output = result.tasks[parsed.taskIndex].output;
                for (const message of test.tasks[parsed.taskIndex].messages) {
                    if (message.type === 1 /* TestMessageType.Output */) {
                        text += removeAnsiEscapeCodes(output.getRange(message.offset, message.length).toString());
                    }
                }
                break;
            }
            case 4 /* TestUriType.ResultExpectedOutput */: {
                const message = test.tasks[parsed.taskIndex].messages[parsed.messageIndex];
                if (message?.type === 0 /* TestMessageType.Error */) {
                    text = message.expected;
                }
                break;
            }
            case 2 /* TestUriType.ResultMessage */: {
                const message = test.tasks[parsed.taskIndex].messages[parsed.messageIndex];
                if (!message) {
                    break;
                }
                if (message.type === 1 /* TestMessageType.Output */) {
                    const content = result.tasks[parsed.taskIndex].output.getRange(message.offset, message.length);
                    text = removeAnsiEscapeCodes(content.toString());
                }
                else if (typeof message.message === 'string') {
                    text = removeAnsiEscapeCodes(message.message);
                }
                else {
                    text = message.message.value;
                    language = this.languageService.createById('markdown');
                }
            }
        }
        if (text === undefined) {
            return null;
        }
        return this.modelService.createModel(text, language, resource, false);
    }
};
TestingContentProvider = __decorate([
    __param(0, ITextModelService),
    __param(1, ILanguageService),
    __param(2, IModelService),
    __param(3, ITestResultService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TestingContentProvider);
export { TestingContentProvider };
