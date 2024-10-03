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
var LanguageDetectionService_1;
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageDetectionService, LanguageDetectionStatsId } from '../common/languageDetectionWorkerService.js';
import { FileAccess, nodeModulesAsarPath, nodeModulesPath, Schemas } from '../../../../base/common/network.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { URI } from '../../../../base/common/uri.js';
import { isWeb } from '../../../../base/common/platform.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IDiagnosticsService } from '../../../../platform/diagnostics/common/diagnostics.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { LRUCache } from '../../../../base/common/map.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { canASAR } from '../../../../amdX.js';
import { createWebWorker } from '../../../../base/browser/defaultWorkerFactory.js';
import { WorkerTextModelSyncClient } from '../../../../editor/common/services/textModelSync/textModelSync.impl.js';
import { LanguageDetectionWorkerHost } from './languageDetectionWorker.protocol.js';
const TOP_LANG_COUNTS = 12;
const regexpModuleLocation = `${nodeModulesPath}/vscode-regexp-languagedetection`;
const regexpModuleLocationAsar = `${nodeModulesAsarPath}/vscode-regexp-languagedetection`;
const moduleLocation = `${nodeModulesPath}/@vscode/vscode-languagedetection`;
const moduleLocationAsar = `${nodeModulesAsarPath}/@vscode/vscode-languagedetection`;
let LanguageDetectionService = class LanguageDetectionService extends Disposable {
    static { LanguageDetectionService_1 = this; }
    static { this.enablementSettingKey = 'workbench.editor.languageDetection'; }
    static { this.historyBasedEnablementConfig = 'workbench.editor.historyBasedLanguageDetection'; }
    static { this.preferHistoryConfig = 'workbench.editor.preferHistoryBasedLanguageDetection'; }
    static { this.workspaceOpenedLanguagesStorageKey = 'workbench.editor.languageDetectionOpenedLanguages.workspace'; }
    static { this.globalOpenedLanguagesStorageKey = 'workbench.editor.languageDetectionOpenedLanguages.global'; }
    constructor(_environmentService, languageService, _configurationService, _diagnosticsService, _workspaceContextService, modelService, _editorService, telemetryService, storageService, _logService) {
        super();
        this._environmentService = _environmentService;
        this._configurationService = _configurationService;
        this._diagnosticsService = _diagnosticsService;
        this._workspaceContextService = _workspaceContextService;
        this._editorService = _editorService;
        this._logService = _logService;
        this.hasResolvedWorkspaceLanguageIds = false;
        this.workspaceLanguageIds = new Set();
        this.sessionOpenedLanguageIds = new Set();
        this.historicalGlobalOpenedLanguageIds = new LRUCache(TOP_LANG_COUNTS);
        this.historicalWorkspaceOpenedLanguageIds = new LRUCache(TOP_LANG_COUNTS);
        this.dirtyBiases = true;
        this.langBiases = {};
        const useAsar = canASAR && this._environmentService.isBuilt && !isWeb;
        this._languageDetectionWorkerClient = this._register(new LanguageDetectionWorkerClient(modelService, languageService, telemetryService, useAsar
            ? FileAccess.asBrowserUri(`${moduleLocationAsar}/dist/lib/index.js`).toString(true)
            : FileAccess.asBrowserUri(`${moduleLocation}/dist/lib/index.js`).toString(true), useAsar
            ? FileAccess.asBrowserUri(`${moduleLocationAsar}/model/model.json`).toString(true)
            : FileAccess.asBrowserUri(`${moduleLocation}/model/model.json`).toString(true), useAsar
            ? FileAccess.asBrowserUri(`${moduleLocationAsar}/model/group1-shard1of1.bin`).toString(true)
            : FileAccess.asBrowserUri(`${moduleLocation}/model/group1-shard1of1.bin`).toString(true), useAsar
            ? FileAccess.asBrowserUri(`${regexpModuleLocationAsar}/dist/index.js`).toString(true)
            : FileAccess.asBrowserUri(`${regexpModuleLocation}/dist/index.js`).toString(true)));
        this.initEditorOpenedListeners(storageService);
    }
    async resolveWorkspaceLanguageIds() {
        if (this.hasResolvedWorkspaceLanguageIds) {
            return;
        }
        this.hasResolvedWorkspaceLanguageIds = true;
        const fileExtensions = await this._diagnosticsService.getWorkspaceFileExtensions(this._workspaceContextService.getWorkspace());
        let count = 0;
        for (const ext of fileExtensions.extensions) {
            const langId = this._languageDetectionWorkerClient.getLanguageId(ext);
            if (langId && count < TOP_LANG_COUNTS) {
                this.workspaceLanguageIds.add(langId);
                count++;
                if (count > TOP_LANG_COUNTS) {
                    break;
                }
            }
        }
        this.dirtyBiases = true;
    }
    isEnabledForLanguage(languageId) {
        return !!languageId && this._configurationService.getValue(LanguageDetectionService_1.enablementSettingKey, { overrideIdentifier: languageId });
    }
    getLanguageBiases() {
        if (!this.dirtyBiases) {
            return this.langBiases;
        }
        const biases = {};
        this.sessionOpenedLanguageIds.forEach(lang => biases[lang] = (biases[lang] ?? 0) + 7);
        this.workspaceLanguageIds.forEach(lang => biases[lang] = (biases[lang] ?? 0) + 5);
        [...this.historicalWorkspaceOpenedLanguageIds.keys()].forEach(lang => biases[lang] = (biases[lang] ?? 0) + 3);
        [...this.historicalGlobalOpenedLanguageIds.keys()].forEach(lang => biases[lang] = (biases[lang] ?? 0) + 1);
        this._logService.trace('Session Languages:', JSON.stringify([...this.sessionOpenedLanguageIds]));
        this._logService.trace('Workspace Languages:', JSON.stringify([...this.workspaceLanguageIds]));
        this._logService.trace('Historical Workspace Opened Languages:', JSON.stringify([...this.historicalWorkspaceOpenedLanguageIds.keys()]));
        this._logService.trace('Historical Globally Opened Languages:', JSON.stringify([...this.historicalGlobalOpenedLanguageIds.keys()]));
        this._logService.trace('Computed Language Detection Biases:', JSON.stringify(biases));
        this.dirtyBiases = false;
        this.langBiases = biases;
        return biases;
    }
    async detectLanguage(resource, supportedLangs) {
        const useHistory = this._configurationService.getValue(LanguageDetectionService_1.historyBasedEnablementConfig);
        const preferHistory = this._configurationService.getValue(LanguageDetectionService_1.preferHistoryConfig);
        if (useHistory) {
            await this.resolveWorkspaceLanguageIds();
        }
        const biases = useHistory ? this.getLanguageBiases() : undefined;
        return this._languageDetectionWorkerClient.detectLanguage(resource, biases, preferHistory, supportedLangs);
    }
    initEditorOpenedListeners(storageService) {
        try {
            const globalLangHistoryData = JSON.parse(storageService.get(LanguageDetectionService_1.globalOpenedLanguagesStorageKey, 0, '[]'));
            this.historicalGlobalOpenedLanguageIds.fromJSON(globalLangHistoryData);
        }
        catch (e) {
            console.error(e);
        }
        try {
            const workspaceLangHistoryData = JSON.parse(storageService.get(LanguageDetectionService_1.workspaceOpenedLanguagesStorageKey, 1, '[]'));
            this.historicalWorkspaceOpenedLanguageIds.fromJSON(workspaceLangHistoryData);
        }
        catch (e) {
            console.error(e);
        }
        this._register(this._editorService.onDidActiveEditorChange(() => {
            const activeLanguage = this._editorService.activeTextEditorLanguageId;
            if (activeLanguage && this._editorService.activeEditor?.resource?.scheme !== Schemas.untitled) {
                this.sessionOpenedLanguageIds.add(activeLanguage);
                this.historicalGlobalOpenedLanguageIds.set(activeLanguage, true);
                this.historicalWorkspaceOpenedLanguageIds.set(activeLanguage, true);
                storageService.store(LanguageDetectionService_1.globalOpenedLanguagesStorageKey, JSON.stringify(this.historicalGlobalOpenedLanguageIds.toJSON()), 0, 1);
                storageService.store(LanguageDetectionService_1.workspaceOpenedLanguagesStorageKey, JSON.stringify(this.historicalWorkspaceOpenedLanguageIds.toJSON()), 1, 1);
                this.dirtyBiases = true;
            }
        }));
    }
};
LanguageDetectionService = LanguageDetectionService_1 = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, ILanguageService),
    __param(2, IConfigurationService),
    __param(3, IDiagnosticsService),
    __param(4, IWorkspaceContextService),
    __param(5, IModelService),
    __param(6, IEditorService),
    __param(7, ITelemetryService),
    __param(8, IStorageService),
    __param(9, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], LanguageDetectionService);
export { LanguageDetectionService };
export class LanguageDetectionWorkerClient extends Disposable {
    constructor(_modelService, _languageService, _telemetryService, _indexJsUri, _modelJsonUri, _weightsUri, _regexpModelUri) {
        super();
        this._modelService = _modelService;
        this._languageService = _languageService;
        this._telemetryService = _telemetryService;
        this._indexJsUri = _indexJsUri;
        this._modelJsonUri = _modelJsonUri;
        this._weightsUri = _weightsUri;
        this._regexpModelUri = _regexpModelUri;
    }
    _getOrCreateLanguageDetectionWorker() {
        if (!this.worker) {
            const workerClient = this._register(createWebWorker('vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker', 'LanguageDetectionWorker'));
            LanguageDetectionWorkerHost.setChannel(workerClient, {
                $getIndexJsUri: async () => this.getIndexJsUri(),
                $getLanguageId: async (languageIdOrExt) => this.getLanguageId(languageIdOrExt),
                $sendTelemetryEvent: async (languages, confidences, timeSpent) => this.sendTelemetryEvent(languages, confidences, timeSpent),
                $getRegexpModelUri: async () => this.getRegexpModelUri(),
                $getModelJsonUri: async () => this.getModelJsonUri(),
                $getWeightsUri: async () => this.getWeightsUri(),
            });
            const workerTextModelSyncClient = WorkerTextModelSyncClient.create(workerClient, this._modelService);
            this.worker = { workerClient, workerTextModelSyncClient };
        }
        return this.worker;
    }
    _guessLanguageIdByUri(uri) {
        const guess = this._languageService.guessLanguageIdByFilepathOrFirstLine(uri);
        if (guess && guess !== 'unknown') {
            return guess;
        }
        return undefined;
    }
    async getIndexJsUri() {
        return this._indexJsUri;
    }
    getLanguageId(languageIdOrExt) {
        if (!languageIdOrExt) {
            return undefined;
        }
        if (this._languageService.isRegisteredLanguageId(languageIdOrExt)) {
            return languageIdOrExt;
        }
        const guessed = this._guessLanguageIdByUri(URI.file(`file.${languageIdOrExt}`));
        if (!guessed || guessed === 'unknown') {
            return undefined;
        }
        return guessed;
    }
    async getModelJsonUri() {
        return this._modelJsonUri;
    }
    async getWeightsUri() {
        return this._weightsUri;
    }
    async getRegexpModelUri() {
        return this._regexpModelUri;
    }
    async sendTelemetryEvent(languages, confidences, timeSpent) {
        this._telemetryService.publicLog2(LanguageDetectionStatsId, {
            languages: languages.join(','),
            confidences: confidences.join(','),
            timeSpent
        });
    }
    async detectLanguage(resource, langBiases, preferHistory, supportedLangs) {
        const startTime = Date.now();
        const quickGuess = this._guessLanguageIdByUri(resource);
        if (quickGuess) {
            return quickGuess;
        }
        const { workerClient, workerTextModelSyncClient } = this._getOrCreateLanguageDetectionWorker();
        await workerTextModelSyncClient.ensureSyncedResources([resource]);
        const modelId = await workerClient.proxy.$detectLanguage(resource.toString(), langBiases, preferHistory, supportedLangs);
        const languageId = this.getLanguageId(modelId);
        const LanguageDetectionStatsId = 'automaticlanguagedetection.perf';
        this._telemetryService.publicLog2(LanguageDetectionStatsId, {
            timeSpent: Date.now() - startTime,
            detection: languageId || 'unknown',
        });
        return languageId;
    }
}
registerSingleton(ILanguageDetectionService, LanguageDetectionService, 0);
