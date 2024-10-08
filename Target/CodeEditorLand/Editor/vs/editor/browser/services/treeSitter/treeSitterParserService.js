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
import { FileAccess, nodeModulesAsarUnpackedPath, nodeModulesPath } from '../../../../base/common/network.js';
import { EDITOR_EXPERIMENTAL_PREFER_TREESITTER } from '../../../common/services/treeSitterParserService.js';
import { IModelService } from '../../../common/services/model.js';
import { Disposable, DisposableMap, DisposableStore, dispose } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { setTimeout0 } from '../../../../base/common/platform.js';
import { canASAR, importAMDNodeModule } from '../../../../amdX.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { cancelOnDispose } from '../../../../base/common/cancellation.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { CancellationError, isCancellationError } from '../../../../base/common/errors.js';
import { PromiseResult } from '../../../../base/common/observable.js';
import { Range } from '../../../common/core/range.js';
const EDITOR_TREESITTER_TELEMETRY = 'editor.experimental.treeSitterTelemetry';
const MODULE_LOCATION_SUBPATH = `@vscode/tree-sitter-wasm/wasm`;
const FILENAME_TREESITTER_WASM = `tree-sitter.wasm`;
function getModuleLocation(environmentService) {
    return `${(canASAR && environmentService.isBuilt) ? nodeModulesAsarUnpackedPath : nodeModulesPath}/${MODULE_LOCATION_SUBPATH}`;
}
export class TextModelTreeSitter extends Disposable {
    get parseResult() { return this._parseResult; }
    constructor(model, _treeSitterLanguages, _treeSitterImporter, _logService, _telemetryService) {
        super();
        this.model = model;
        this._treeSitterLanguages = _treeSitterLanguages;
        this._treeSitterImporter = _treeSitterImporter;
        this._logService = _logService;
        this._telemetryService = _telemetryService;
        this._onDidChangeParseResult = this._register(new Emitter());
        this.onDidChangeParseResult = this._onDidChangeParseResult.event;
        this._languageSessionDisposables = this._register(new DisposableStore());
        this._register(Event.runAndSubscribe(this.model.onDidChangeLanguage, (e => this._onDidChangeLanguage(e ? e.newLanguage : this.model.getLanguageId()))));
    }
    /**
     * Be very careful when making changes to this method as it is easy to introduce race conditions.
     */
    async _onDidChangeLanguage(languageId) {
        this._languageSessionDisposables.clear();
        this._parseResult = undefined;
        const token = cancelOnDispose(this._languageSessionDisposables);
        let language;
        try {
            language = await this._getLanguage(languageId, token);
        }
        catch (e) {
            if (isCancellationError(e)) {
                return;
            }
            throw e;
        }
        const Parser = await this._treeSitterImporter.getParserClass();
        if (token.isCancellationRequested) {
            return;
        }
        const treeSitterTree = this._languageSessionDisposables.add(new TreeSitterParseResult(new Parser(), language, this._logService, this._telemetryService));
        this._languageSessionDisposables.add(this.model.onDidChangeContent(e => this._onDidChangeContent(treeSitterTree, e.changes)));
        await this._onDidChangeContent(treeSitterTree, []);
        if (token.isCancellationRequested) {
            return;
        }
        this._parseResult = treeSitterTree;
    }
    _getLanguage(languageId, token) {
        const language = this._treeSitterLanguages.getOrInitLanguage(languageId);
        if (language) {
            return Promise.resolve(language);
        }
        const disposables = [];
        return new Promise((resolve, reject) => {
            disposables.push(this._treeSitterLanguages.onDidAddLanguage(e => {
                if (e.id === languageId) {
                    dispose(disposables);
                    resolve(e.language);
                }
            }));
            token.onCancellationRequested(() => {
                dispose(disposables);
                reject(new CancellationError());
            }, undefined, disposables);
        });
    }
    async _onDidChangeContent(treeSitterTree, changes) {
        const diff = await treeSitterTree.onDidChangeContent(this.model, changes);
        if (!diff || diff.length > 0) {
            // Tree sitter is 0 based, text model is 1 based
            const ranges = diff ? diff.map(r => new Range(r.startPosition.row + 1, r.startPosition.column + 1, r.endPosition.row + 1, r.endPosition.column + 1)) : [this.model.getFullModelRange()];
            this._onDidChangeParseResult.fire(ranges);
        }
    }
}
export class TreeSitterParseResult {
    constructor(parser, language, _logService, _telemetryService) {
        this.parser = parser;
        this.language = language;
        this._logService = _logService;
        this._telemetryService = _telemetryService;
        this._isDisposed = false;
        this._onDidChangeContentQueue = Promise.resolve();
        this._newEdits = true;
        this.parser.setTimeoutMicros(50 * 1000); // 50 ms
        this.parser.setLanguage(language);
    }
    dispose() {
        this._isDisposed = true;
        this._tree?.delete();
        this.parser?.delete();
    }
    get tree() { return this._tree; }
    set tree(newTree) {
        this._tree?.delete();
        this._tree = newTree;
    }
    get isDisposed() { return this._isDisposed; }
    async onDidChangeContent(model, changes) {
        const oldTree = this.tree?.copy();
        this._applyEdits(model, changes);
        return new Promise(resolve => {
            this._onDidChangeContentQueue = this._onDidChangeContentQueue.then(async () => {
                if (this.isDisposed) {
                    // No need to continue the queue if we are disposed
                    return;
                }
                await this._parseAndUpdateTree(model);
                resolve((this.tree && oldTree) ? oldTree.getChangedRanges(this.tree) : undefined);
            }).catch((e) => {
                this._logService.error('Error parsing tree-sitter tree', e);
            });
        });
    }
    _applyEdits(model, changes) {
        for (const change of changes) {
            const newEndOffset = change.rangeOffset + change.text.length;
            const newEndPosition = model.getPositionAt(newEndOffset);
            this.tree?.edit({
                startIndex: change.rangeOffset,
                oldEndIndex: change.rangeOffset + change.rangeLength,
                newEndIndex: change.rangeOffset + change.text.length,
                startPosition: { row: change.range.startLineNumber - 1, column: change.range.startColumn - 1 },
                oldEndPosition: { row: change.range.endLineNumber - 1, column: change.range.endColumn - 1 },
                newEndPosition: { row: newEndPosition.lineNumber - 1, column: newEndPosition.column - 1 }
            });
            this._newEdits = true;
        }
    }
    async _parseAndUpdateTree(model) {
        const tree = await this._parse(model);
        if (!this._newEdits) {
            this.tree = tree;
        }
    }
    _parse(model) {
        let parseType = "fullParse" /* TelemetryParseType.Full */;
        if (this.tree) {
            parseType = "incrementalParse" /* TelemetryParseType.Incremental */;
        }
        return this._parseAndYield(model, parseType);
    }
    async _parseAndYield(model, parseType) {
        const language = model.getLanguageId();
        let tree;
        let time = 0;
        let passes = 0;
        this._newEdits = false;
        do {
            const timer = performance.now();
            try {
                tree = this.parser.parse((index, position) => this._parseCallback(model, index), this.tree);
            }
            catch (e) {
                // parsing can fail when the timeout is reached, will resume upon next loop
            }
            finally {
                time += performance.now() - timer;
                passes++;
            }
            // Even if the model changes and edits are applied, the tree parsing will continue correctly after the await.
            await new Promise(resolve => setTimeout0(resolve));
            if (model.isDisposed() || this.isDisposed) {
                return;
            }
        } while (!tree && !this._newEdits); // exit if there a new edits, as anhy parsing done while there are new edits is throw away work
        this.sendParseTimeTelemetry(parseType, language, time, passes);
        return tree;
    }
    _parseCallback(textModel, index) {
        try {
            return textModel.getTextBuffer().getNearestChunk(index);
        }
        catch (e) {
            this._logService.debug('Error getting chunk for tree-sitter parsing', e);
        }
        return null;
    }
    sendParseTimeTelemetry(parseType, languageId, time, passes) {
        this._logService.debug(`Tree parsing (${parseType}) took ${time} ms and ${passes} passes.`);
        if (parseType === "fullParse" /* TelemetryParseType.Full */) {
            this._telemetryService.publicLog2(`treeSitter.fullParse`, { languageId, time, passes });
        }
        else {
            this._telemetryService.publicLog2(`treeSitter.incrementalParse`, { languageId, time, passes });
        }
    }
}
export class TreeSitterLanguages extends Disposable {
    constructor(_treeSitterImporter, _fileService, _environmentService, _registeredLanguages) {
        super();
        this._treeSitterImporter = _treeSitterImporter;
        this._fileService = _fileService;
        this._environmentService = _environmentService;
        this._registeredLanguages = _registeredLanguages;
        this._languages = new AsyncCache();
        this._onDidAddLanguage = this._register(new Emitter());
        /**
         * If you're looking for a specific language, make sure to check if it already exists with `getLanguage` as it will kick off the process to add it if it doesn't exist.
         */
        this.onDidAddLanguage = this._onDidAddLanguage.event;
    }
    getOrInitLanguage(languageId) {
        if (this._languages.isCached(languageId)) {
            return this._languages.getSyncIfCached(languageId);
        }
        else {
            // kick off adding the language, but don't wait
            this._addLanguage(languageId);
            return undefined;
        }
    }
    async getLanguage(languageId) {
        if (this._languages.isCached(languageId)) {
            return this._languages.getSyncIfCached(languageId);
        }
        else {
            await this._addLanguage(languageId);
            return this._languages.get(languageId);
        }
    }
    async _addLanguage(languageId) {
        const languagePromise = this._languages.get(languageId);
        if (!languagePromise) {
            this._languages.set(languageId, this._fetchLanguage(languageId));
            const language = await this._languages.get(languageId);
            if (!language) {
                return undefined;
            }
            this._onDidAddLanguage.fire({ id: languageId, language });
        }
    }
    async _fetchLanguage(languageId) {
        const grammarName = this._registeredLanguages.get(languageId);
        const languageLocation = this._getLanguageLocation(languageId);
        if (!grammarName || !languageLocation) {
            return undefined;
        }
        const wasmPath = `${languageLocation}/${grammarName}.wasm`;
        const languageFile = await (this._fileService.readFile(FileAccess.asFileUri(wasmPath)));
        const Parser = await this._treeSitterImporter.getParserClass();
        return Parser.Language.load(languageFile.value.buffer);
    }
    _getLanguageLocation(languageId) {
        const grammarName = this._registeredLanguages.get(languageId);
        if (!grammarName) {
            return undefined;
        }
        return getModuleLocation(this._environmentService);
    }
}
export class TreeSitterImporter {
    async _getTreeSitterImport() {
        if (!this._treeSitterImport) {
            this._treeSitterImport = await importAMDNodeModule('@vscode/tree-sitter-wasm', 'wasm/tree-sitter.js');
        }
        return this._treeSitterImport;
    }
    async getParserClass() {
        if (!this._parserClass) {
            this._parserClass = (await this._getTreeSitterImport()).Parser;
        }
        return this._parserClass;
    }
}
let TreeSitterTextModelService = class TreeSitterTextModelService extends Disposable {
    constructor(_modelService, fileService, _telemetryService, _logService, _configurationService, _environmentService) {
        super();
        this._modelService = _modelService;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this._configurationService = _configurationService;
        this._environmentService = _environmentService;
        this._textModelTreeSitters = this._register(new DisposableMap());
        this._registeredLanguages = new Map();
        this._treeSitterImporter = new TreeSitterImporter();
        this._onDidUpdateTree = this._register(new Emitter());
        this.onDidUpdateTree = this._onDidUpdateTree.event;
        this._hasInit = false;
        this._treeSitterLanguages = this._register(new TreeSitterLanguages(this._treeSitterImporter, fileService, this._environmentService, this._registeredLanguages));
        this.onDidAddLanguage = this._treeSitterLanguages.onDidAddLanguage;
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(EDITOR_EXPERIMENTAL_PREFER_TREESITTER)) {
                this._supportedLanguagesChanged();
            }
        }));
        this._supportedLanguagesChanged();
    }
    getOrInitLanguage(languageId) {
        return this._treeSitterLanguages.getOrInitLanguage(languageId);
    }
    getParseResult(textModel) {
        const textModelTreeSitter = this._textModelTreeSitters.get(textModel);
        return textModelTreeSitter?.textModelTreeSitter.parseResult;
    }
    async getTree(content, languageId) {
        await this._init;
        const language = await this._treeSitterLanguages.getLanguage(languageId);
        const Parser = await this._treeSitterImporter.getParserClass();
        if (language) {
            const parser = new Parser();
            parser.setLanguage(language);
            return parser.parse(content);
        }
        return undefined;
    }
    async _doInitParser() {
        const Parser = await this._treeSitterImporter.getParserClass();
        const environmentService = this._environmentService;
        await Parser.init({
            locateFile(_file, _folder) {
                return FileAccess.asBrowserUri(`${getModuleLocation(environmentService)}/${FILENAME_TREESITTER_WASM}`).toString(true);
            }
        });
        return true;
    }
    async _initParser(hasLanguages) {
        if (this._hasInit) {
            return this._init;
        }
        if (hasLanguages) {
            this._hasInit = true;
            this._init = this._doInitParser();
            // New init, we need to deal with all the existing text models and set up listeners
            this._init.then(() => this._registerModelServiceListeners());
        }
        else {
            this._init = Promise.resolve(false);
        }
        return this._init;
    }
    async _supportedLanguagesChanged() {
        const setting = this._getSetting();
        let hasLanguages = true;
        if (setting.length === 0) {
            hasLanguages = false;
        }
        // Eventually, this should actually use an extension point to add tree sitter grammars, but for now they are hard coded in core
        if (setting.includes('typescript')) {
            this._addGrammar('typescript', 'tree-sitter-typescript');
        }
        else {
            this._removeGrammar('typescript');
        }
        return this._initParser(hasLanguages);
    }
    _getSetting() {
        const setting = this._configurationService.getValue(EDITOR_EXPERIMENTAL_PREFER_TREESITTER);
        if (setting && setting.length > 0) {
            return setting;
        }
        else {
            const expSetting = this._configurationService.getValue(EDITOR_TREESITTER_TELEMETRY);
            if (expSetting) {
                return ['typescript'];
            }
        }
        return [];
    }
    async _registerModelServiceListeners() {
        this._register(this._modelService.onModelAdded(model => {
            this._createTextModelTreeSitter(model);
        }));
        this._register(this._modelService.onModelRemoved(model => {
            this._textModelTreeSitters.deleteAndDispose(model);
        }));
        this._modelService.getModels().forEach(model => this._createTextModelTreeSitter(model));
    }
    _createTextModelTreeSitter(model) {
        const textModelTreeSitter = new TextModelTreeSitter(model, this._treeSitterLanguages, this._treeSitterImporter, this._logService, this._telemetryService);
        const disposables = new DisposableStore();
        disposables.add(textModelTreeSitter);
        disposables.add(textModelTreeSitter.onDidChangeParseResult((ranges) => this._onDidUpdateTree.fire({ textModel: model, ranges })));
        this._textModelTreeSitters.set(model, {
            textModelTreeSitter,
            disposables,
            dispose: disposables.dispose.bind(disposables)
        });
    }
    _addGrammar(languageId, grammarName) {
        if (!this._registeredLanguages.has(languageId)) {
            this._registeredLanguages.set(languageId, grammarName);
        }
    }
    _removeGrammar(languageId) {
        if (this._registeredLanguages.has(languageId)) {
            this._registeredLanguages.delete('typescript');
        }
    }
};
TreeSitterTextModelService = __decorate([
    __param(0, IModelService),
    __param(1, IFileService),
    __param(2, ITelemetryService),
    __param(3, ILogService),
    __param(4, IConfigurationService),
    __param(5, IEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], TreeSitterTextModelService);
export { TreeSitterTextModelService };
class PromiseWithSyncAccess {
    /**
     * Returns undefined if the promise did not resolve yet.
     */
    get result() {
        return this._result;
    }
    constructor(promise) {
        this.promise = promise;
        promise.then(result => {
            this._result = new PromiseResult(result, undefined);
        }).catch(e => {
            this._result = new PromiseResult(undefined, e);
        });
    }
}
class AsyncCache {
    constructor() {
        this._values = new Map();
    }
    set(key, promise) {
        this._values.set(key, new PromiseWithSyncAccess(promise));
    }
    get(key) {
        return this._values.get(key)?.promise;
    }
    getSyncIfCached(key) {
        return this._values.get(key)?.result?.data;
    }
    isCached(key) {
        return this._values.get(key)?.result !== undefined;
    }
}
