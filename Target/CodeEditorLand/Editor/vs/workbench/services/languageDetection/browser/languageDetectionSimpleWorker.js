import { importAMDNodeModule } from '../../../../amdX.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { LanguageDetectionWorkerHost } from './languageDetectionWorker.protocol.js';
import { WorkerTextModelSyncServer } from '../../../../editor/common/services/textModelSync/textModelSync.impl.js';
export function create(workerServer) {
    return new LanguageDetectionSimpleWorker(workerServer);
}
export class LanguageDetectionSimpleWorker {
    static { this.expectedRelativeConfidence = 0.2; }
    static { this.positiveConfidenceCorrectionBucket1 = 0.05; }
    static { this.positiveConfidenceCorrectionBucket2 = 0.025; }
    static { this.negativeConfidenceCorrection = 0.5; }
    constructor(workerServer) {
        this._workerTextModelSyncServer = new WorkerTextModelSyncServer();
        this._regexpLoadFailed = false;
        this._loadFailed = false;
        this.modelIdToCoreId = new Map();
        this._host = LanguageDetectionWorkerHost.getChannel(workerServer);
        this._workerTextModelSyncServer.bindToServer(workerServer);
    }
    async $detectLanguage(uri, langBiases, preferHistory, supportedLangs) {
        const languages = [];
        const confidences = [];
        const stopWatch = new StopWatch();
        const documentTextSample = this.getTextForDetection(uri);
        if (!documentTextSample) {
            return;
        }
        const neuralResolver = async () => {
            for await (const language of this.detectLanguagesImpl(documentTextSample)) {
                if (!this.modelIdToCoreId.has(language.languageId)) {
                    this.modelIdToCoreId.set(language.languageId, await this._host.$getLanguageId(language.languageId));
                }
                const coreId = this.modelIdToCoreId.get(language.languageId);
                if (coreId && (!supportedLangs?.length || supportedLangs.includes(coreId))) {
                    languages.push(coreId);
                    confidences.push(language.confidence);
                }
            }
            stopWatch.stop();
            if (languages.length) {
                this._host.$sendTelemetryEvent(languages, confidences, stopWatch.elapsed());
                return languages[0];
            }
            return undefined;
        };
        const historicalResolver = async () => this.runRegexpModel(documentTextSample, langBiases ?? {}, supportedLangs);
        if (preferHistory) {
            const history = await historicalResolver();
            if (history) {
                return history;
            }
            const neural = await neuralResolver();
            if (neural) {
                return neural;
            }
        }
        else {
            const neural = await neuralResolver();
            if (neural) {
                return neural;
            }
            const history = await historicalResolver();
            if (history) {
                return history;
            }
        }
        return undefined;
    }
    getTextForDetection(uri) {
        const editorModel = this._workerTextModelSyncServer.getModel(uri);
        if (!editorModel) {
            return;
        }
        const end = editorModel.positionAt(10000);
        const content = editorModel.getValueInRange({
            startColumn: 1,
            startLineNumber: 1,
            endColumn: end.column,
            endLineNumber: end.lineNumber
        });
        return content;
    }
    async getRegexpModel() {
        if (this._regexpLoadFailed) {
            return;
        }
        if (this._regexpModel) {
            return this._regexpModel;
        }
        const uri = await this._host.$getRegexpModelUri();
        try {
            this._regexpModel = await importAMDNodeModule(uri, '');
            return this._regexpModel;
        }
        catch (e) {
            this._regexpLoadFailed = true;
            return;
        }
    }
    async runRegexpModel(content, langBiases, supportedLangs) {
        const regexpModel = await this.getRegexpModel();
        if (!regexpModel) {
            return;
        }
        if (supportedLangs?.length) {
            for (const lang of Object.keys(langBiases)) {
                if (supportedLangs.includes(lang)) {
                    langBiases[lang] = 1;
                }
                else {
                    langBiases[lang] = 0;
                }
            }
        }
        const detected = regexpModel.detect(content, langBiases, supportedLangs);
        return detected;
    }
    async getModelOperations() {
        if (this._modelOperations) {
            return this._modelOperations;
        }
        const uri = await this._host.$getIndexJsUri();
        const { ModelOperations } = await importAMDNodeModule(uri, '');
        this._modelOperations = new ModelOperations({
            modelJsonLoaderFunc: async () => {
                const response = await fetch(await this._host.$getModelJsonUri());
                try {
                    const modelJSON = await response.json();
                    return modelJSON;
                }
                catch (e) {
                    const message = `Failed to parse model JSON.`;
                    throw new Error(message);
                }
            },
            weightsLoaderFunc: async () => {
                const response = await fetch(await this._host.$getWeightsUri());
                const buffer = await response.arrayBuffer();
                return buffer;
            }
        });
        return this._modelOperations;
    }
    adjustLanguageConfidence(modelResult) {
        switch (modelResult.languageId) {
            case 'js':
            case 'html':
            case 'json':
            case 'ts':
            case 'css':
            case 'py':
            case 'xml':
            case 'php':
                modelResult.confidence += LanguageDetectionSimpleWorker.positiveConfidenceCorrectionBucket1;
                break;
            case 'cpp':
            case 'sh':
            case 'java':
            case 'cs':
            case 'c':
                modelResult.confidence += LanguageDetectionSimpleWorker.positiveConfidenceCorrectionBucket2;
                break;
            case 'bat':
            case 'ini':
            case 'makefile':
            case 'sql':
            case 'csv':
            case 'toml':
                modelResult.confidence -= LanguageDetectionSimpleWorker.negativeConfidenceCorrection;
                break;
            default:
                break;
        }
        return modelResult;
    }
    async *detectLanguagesImpl(content) {
        if (this._loadFailed) {
            return;
        }
        let modelOperations;
        try {
            modelOperations = await this.getModelOperations();
        }
        catch (e) {
            console.log(e);
            this._loadFailed = true;
            return;
        }
        let modelResults;
        try {
            modelResults = await modelOperations.runModel(content);
        }
        catch (e) {
            console.warn(e);
        }
        if (!modelResults
            || modelResults.length === 0
            || modelResults[0].confidence < LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
            return;
        }
        const firstModelResult = this.adjustLanguageConfidence(modelResults[0]);
        if (firstModelResult.confidence < LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
            return;
        }
        const possibleLanguages = [firstModelResult];
        for (let current of modelResults) {
            if (current === firstModelResult) {
                continue;
            }
            current = this.adjustLanguageConfidence(current);
            const currentHighest = possibleLanguages[possibleLanguages.length - 1];
            if (currentHighest.confidence - current.confidence >= LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
                while (possibleLanguages.length) {
                    yield possibleLanguages.shift();
                }
                if (current.confidence > LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
                    possibleLanguages.push(current);
                    continue;
                }
                return;
            }
            else {
                if (current.confidence > LanguageDetectionSimpleWorker.expectedRelativeConfidence) {
                    possibleLanguages.push(current);
                    continue;
                }
                return;
            }
        }
    }
}
