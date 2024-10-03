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
var AbstractTextFileService_1;
import { localize } from '../../../../nls.js';
import { toBufferOrReadable, TextFileOperationError, stringToSnapshot } from '../common/textfiles.js';
import { SaveSourceRegistry } from '../../../common/editor.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { extname as pathExtname } from '../../../../base/common/path.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IUntitledTextEditorService } from '../../untitled/common/untitledTextEditorService.js';
import { UntitledTextEditorModel } from '../../untitled/common/untitledTextEditorModel.js';
import { TextFileEditorModelManager } from '../common/textFileEditorModelManager.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Schemas } from '../../../../base/common/network.js';
import { createTextBufferFactoryFromSnapshot, createTextBufferFactoryFromStream } from '../../../../editor/common/model/textModel.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { joinPath, dirname, basename, toLocalResource, extname, isEqual } from '../../../../base/common/resources.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { bufferToStream } from '../../../../base/common/buffer.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../editor/common/languages/modesRegistry.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { BaseTextEditorModel } from '../../../common/editor/textEditorModel.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IPathService } from '../../path/common/pathService.js';
import { IWorkingCopyFileService } from '../../workingCopy/common/workingCopyFileService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceContextService, WORKSPACE_EXTENSION } from '../../../../platform/workspace/common/workspace.js';
import { UTF8, UTF8_with_bom, UTF16be, UTF16le, encodingExists, toEncodeReadable, toDecodeStream } from '../common/encoding.js';
import { consumeStream } from '../../../../base/common/stream.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { IElevatedFileService } from '../../files/common/elevatedFileService.js';
import { IDecorationsService } from '../../decorations/common/decorations.js';
import { Emitter } from '../../../../base/common/event.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { listErrorForeground } from '../../../../platform/theme/common/colorRegistry.js';
let AbstractTextFileService = class AbstractTextFileService extends Disposable {
    static { AbstractTextFileService_1 = this; }
    static { this.TEXTFILE_SAVE_CREATE_SOURCE = SaveSourceRegistry.registerSource('textFileCreate.source', localize('textFileCreate.source', "File Created")); }
    static { this.TEXTFILE_SAVE_REPLACE_SOURCE = SaveSourceRegistry.registerSource('textFileOverwrite.source', localize('textFileOverwrite.source', "File Replaced")); }
    constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService) {
        super();
        this.fileService = fileService;
        this.untitledTextEditorService = untitledTextEditorService;
        this.lifecycleService = lifecycleService;
        this.instantiationService = instantiationService;
        this.modelService = modelService;
        this.environmentService = environmentService;
        this.dialogService = dialogService;
        this.fileDialogService = fileDialogService;
        this.textResourceConfigurationService = textResourceConfigurationService;
        this.filesConfigurationService = filesConfigurationService;
        this.codeEditorService = codeEditorService;
        this.pathService = pathService;
        this.workingCopyFileService = workingCopyFileService;
        this.uriIdentityService = uriIdentityService;
        this.languageService = languageService;
        this.logService = logService;
        this.elevatedFileService = elevatedFileService;
        this.decorationsService = decorationsService;
        this.files = this._register(this.instantiationService.createInstance(TextFileEditorModelManager));
        this.untitled = this.untitledTextEditorService;
        this.provideDecorations();
    }
    provideDecorations() {
        const provider = this._register(new class extends Disposable {
            constructor(files) {
                super();
                this.files = files;
                this.label = localize('textFileModelDecorations', "Text File Model Decorations");
                this._onDidChange = this._register(new Emitter());
                this.onDidChange = this._onDidChange.event;
                this.registerListeners();
            }
            registerListeners() {
                this._register(this.files.onDidResolve(({ model }) => {
                    if (model.isReadonly() || model.hasState(4)) {
                        this._onDidChange.fire([model.resource]);
                    }
                }));
                this._register(this.files.onDidRemove(modelUri => this._onDidChange.fire([modelUri])));
                this._register(this.files.onDidChangeReadonly(model => this._onDidChange.fire([model.resource])));
                this._register(this.files.onDidChangeOrphaned(model => this._onDidChange.fire([model.resource])));
            }
            provideDecorations(uri) {
                const model = this.files.get(uri);
                if (!model || model.isDisposed()) {
                    return undefined;
                }
                const isReadonly = model.isReadonly();
                const isOrphaned = model.hasState(4);
                if (isReadonly && isOrphaned) {
                    return {
                        color: listErrorForeground,
                        letter: Codicon.lockSmall,
                        strikethrough: true,
                        tooltip: localize('readonlyAndDeleted', "Deleted, Read-only"),
                    };
                }
                else if (isReadonly) {
                    return {
                        letter: Codicon.lockSmall,
                        tooltip: localize('readonly', "Read-only"),
                    };
                }
                else if (isOrphaned) {
                    return {
                        color: listErrorForeground,
                        strikethrough: true,
                        tooltip: localize('deleted', "Deleted"),
                    };
                }
                return undefined;
            }
        }(this.files));
        this._register(this.decorationsService.registerDecorationsProvider(provider));
    }
    get encoding() {
        if (!this._encoding) {
            this._encoding = this._register(this.instantiationService.createInstance(EncodingOracle));
        }
        return this._encoding;
    }
    async read(resource, options) {
        const [bufferStream, decoder] = await this.doRead(resource, {
            ...options,
            preferUnbuffered: true
        });
        return {
            ...bufferStream,
            encoding: decoder.detected.encoding || UTF8,
            value: await consumeStream(decoder.stream, strings => strings.join(''))
        };
    }
    async readStream(resource, options) {
        const [bufferStream, decoder] = await this.doRead(resource, options);
        return {
            ...bufferStream,
            encoding: decoder.detected.encoding || UTF8,
            value: await createTextBufferFactoryFromStream(decoder.stream)
        };
    }
    async doRead(resource, options) {
        const cts = new CancellationTokenSource();
        let bufferStream;
        if (options?.preferUnbuffered) {
            const content = await this.fileService.readFile(resource, options, cts.token);
            bufferStream = {
                ...content,
                value: bufferToStream(content.value)
            };
        }
        else {
            bufferStream = await this.fileService.readFileStream(resource, options, cts.token);
        }
        try {
            const decoder = await this.doGetDecodedStream(resource, bufferStream.value, options);
            return [bufferStream, decoder];
        }
        catch (error) {
            cts.dispose(true);
            if (error.decodeStreamErrorKind === 1) {
                throw new TextFileOperationError(localize('fileBinaryError', "File seems to be binary and cannot be opened as text"), 0, options);
            }
            else {
                throw error;
            }
        }
    }
    async create(operations, undoInfo) {
        const operationsWithContents = await Promise.all(operations.map(async (operation) => {
            const contents = await this.getEncodedReadable(operation.resource, operation.value);
            return {
                resource: operation.resource,
                contents,
                overwrite: operation.options?.overwrite
            };
        }));
        return this.workingCopyFileService.create(operationsWithContents, CancellationToken.None, undoInfo);
    }
    async write(resource, value, options) {
        const readable = await this.getEncodedReadable(resource, value, options);
        if (options?.writeElevated && this.elevatedFileService.isSupported(resource)) {
            return this.elevatedFileService.writeFileElevated(resource, readable, options);
        }
        return this.fileService.writeFile(resource, readable, options);
    }
    async getEncodedReadable(resource, value, options) {
        const { encoding, addBOM } = await this.encoding.getWriteEncoding(resource, options);
        if (encoding === UTF8 && !addBOM) {
            return typeof value === 'undefined'
                ? undefined
                : toBufferOrReadable(value);
        }
        value = value || '';
        const snapshot = typeof value === 'string' ? stringToSnapshot(value) : value;
        return toEncodeReadable(snapshot, encoding, { addBOM });
    }
    async getDecodedStream(resource, value, options) {
        return (await this.doGetDecodedStream(resource, value, options)).stream;
    }
    doGetDecodedStream(resource, stream, options) {
        return toDecodeStream(stream, {
            acceptTextOnly: options?.acceptTextOnly ?? false,
            guessEncoding: options?.autoGuessEncoding ||
                this.textResourceConfigurationService.getValue(resource, 'files.autoGuessEncoding'),
            candidateGuessEncodings: options?.candidateGuessEncodings ||
                this.textResourceConfigurationService.getValue(resource, 'files.candidateGuessEncodings'),
            overwriteEncoding: async (detectedEncoding) => {
                const { encoding } = await this.encoding.getPreferredReadEncoding(resource, options, detectedEncoding ?? undefined);
                return encoding;
            }
        });
    }
    async save(resource, options) {
        if (resource.scheme === Schemas.untitled) {
            const model = this.untitled.get(resource);
            if (model) {
                let targetUri;
                if (model.hasAssociatedFilePath) {
                    targetUri = await this.suggestSavePath(resource);
                }
                else {
                    targetUri = await this.fileDialogService.pickFileToSave(await this.suggestSavePath(resource), options?.availableFileSystems);
                }
                if (targetUri) {
                    return this.saveAs(resource, targetUri, options);
                }
            }
        }
        else {
            const model = this.files.get(resource);
            if (model) {
                return await model.save(options) ? resource : undefined;
            }
        }
        return undefined;
    }
    async saveAs(source, target, options) {
        if (!target) {
            target = await this.fileDialogService.pickFileToSave(await this.suggestSavePath(options?.suggestedTarget ?? source), options?.availableFileSystems);
        }
        if (!target) {
            return;
        }
        if (this.filesConfigurationService.isReadonly(target)) {
            const confirmed = await this.confirmMakeWriteable(target);
            if (!confirmed) {
                return;
            }
            else {
                this.filesConfigurationService.updateReadonly(target, false);
            }
        }
        if (isEqual(source, target)) {
            return this.save(source, { ...options, force: true });
        }
        if (this.fileService.hasProvider(source) && this.uriIdentityService.extUri.isEqual(source, target) && (await this.fileService.exists(source))) {
            await this.workingCopyFileService.move([{ file: { source, target } }], CancellationToken.None);
            const success = await this.save(source, options);
            if (!success) {
                await this.save(target, options);
            }
            return target;
        }
        return this.doSaveAs(source, target, options);
    }
    async doSaveAs(source, target, options) {
        let success = false;
        const textFileModel = this.files.get(source);
        if (textFileModel?.isResolved()) {
            success = await this.doSaveAsTextFile(textFileModel, source, target, options);
        }
        else if (this.fileService.hasProvider(source)) {
            await this.fileService.copy(source, target, true);
            success = true;
        }
        else {
            const textModel = this.modelService.getModel(source);
            if (textModel) {
                success = await this.doSaveAsTextFile(textModel, source, target, options);
            }
        }
        if (!success) {
            return undefined;
        }
        try {
            await this.revert(source);
        }
        catch (error) {
            this.logService.error(error);
        }
        return target;
    }
    async doSaveAsTextFile(sourceModel, source, target, options) {
        let sourceModelEncoding = undefined;
        const sourceModelWithEncodingSupport = sourceModel;
        if (typeof sourceModelWithEncodingSupport.getEncoding === 'function') {
            sourceModelEncoding = sourceModelWithEncodingSupport.getEncoding();
        }
        let targetExists = false;
        let targetModel = this.files.get(target);
        if (targetModel?.isResolved()) {
            targetExists = true;
        }
        else {
            targetExists = await this.fileService.exists(target);
            if (!targetExists) {
                await this.create([{ resource: target, value: '' }]);
            }
            try {
                targetModel = await this.files.resolve(target, { encoding: sourceModelEncoding });
            }
            catch (error) {
                if (targetExists) {
                    if (error.textFileOperationResult === 0 ||
                        error.fileOperationResult === 7) {
                        await this.fileService.del(target);
                        return this.doSaveAsTextFile(sourceModel, source, target, options);
                    }
                }
                throw error;
            }
        }
        let write;
        if (sourceModel instanceof UntitledTextEditorModel && sourceModel.hasAssociatedFilePath && targetExists && this.uriIdentityService.extUri.isEqual(target, toLocalResource(sourceModel.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme))) {
            write = await this.confirmOverwrite(target);
        }
        else {
            write = true;
        }
        if (!write) {
            return false;
        }
        let sourceTextModel = undefined;
        if (sourceModel instanceof BaseTextEditorModel) {
            if (sourceModel.isResolved()) {
                sourceTextModel = sourceModel.textEditorModel ?? undefined;
            }
        }
        else {
            sourceTextModel = sourceModel;
        }
        let targetTextModel = undefined;
        if (targetModel.isResolved()) {
            targetTextModel = targetModel.textEditorModel;
        }
        if (sourceTextModel && targetTextModel) {
            targetModel.updatePreferredEncoding(sourceModelEncoding);
            this.modelService.updateModel(targetTextModel, createTextBufferFactoryFromSnapshot(sourceTextModel.createSnapshot()));
            const sourceLanguageId = sourceTextModel.getLanguageId();
            const targetLanguageId = targetTextModel.getLanguageId();
            if (sourceLanguageId !== PLAINTEXT_LANGUAGE_ID && targetLanguageId === PLAINTEXT_LANGUAGE_ID) {
                targetTextModel.setLanguage(sourceLanguageId);
            }
            const sourceTransientProperties = this.codeEditorService.getTransientModelProperties(sourceTextModel);
            if (sourceTransientProperties) {
                for (const [key, value] of sourceTransientProperties) {
                    this.codeEditorService.setTransientModelProperty(targetTextModel, key, value);
                }
            }
        }
        if (!options?.source) {
            options = {
                ...options,
                source: targetExists ? AbstractTextFileService_1.TEXTFILE_SAVE_REPLACE_SOURCE : AbstractTextFileService_1.TEXTFILE_SAVE_CREATE_SOURCE
            };
        }
        return targetModel.save({
            ...options,
            from: source
        });
    }
    async confirmOverwrite(resource) {
        const { confirmed } = await this.dialogService.confirm({
            type: 'warning',
            message: localize('confirmOverwrite', "'{0}' already exists. Do you want to replace it?", basename(resource)),
            detail: localize('overwriteIrreversible', "A file or folder with the name '{0}' already exists in the folder '{1}'. Replacing it will overwrite its current contents.", basename(resource), basename(dirname(resource))),
            primaryButton: localize({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
        });
        return confirmed;
    }
    async confirmMakeWriteable(resource) {
        const { confirmed } = await this.dialogService.confirm({
            type: 'warning',
            message: localize('confirmMakeWriteable', "'{0}' is marked as read-only. Do you want to save anyway?", basename(resource)),
            detail: localize('confirmMakeWriteableDetail', "Paths can be configured as read-only via settings."),
            primaryButton: localize({ key: 'makeWriteableButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Save Anyway")
        });
        return confirmed;
    }
    async suggestSavePath(resource) {
        if (this.fileService.hasProvider(resource)) {
            return resource;
        }
        const remoteAuthority = this.environmentService.remoteAuthority;
        const defaultFilePath = await this.fileDialogService.defaultFilePath();
        let suggestedFilename = undefined;
        if (resource.scheme === Schemas.untitled) {
            const model = this.untitled.get(resource);
            if (model) {
                if (model.hasAssociatedFilePath) {
                    return toLocalResource(resource, remoteAuthority, this.pathService.defaultUriScheme);
                }
                let nameCandidate;
                if (await this.pathService.hasValidBasename(joinPath(defaultFilePath, model.name), model.name)) {
                    nameCandidate = model.name;
                }
                else {
                    nameCandidate = basename(resource);
                }
                const languageId = model.getLanguageId();
                if (languageId && languageId !== PLAINTEXT_LANGUAGE_ID) {
                    suggestedFilename = this.suggestFilename(languageId, nameCandidate);
                }
                else {
                    suggestedFilename = nameCandidate;
                }
            }
        }
        if (!suggestedFilename) {
            suggestedFilename = basename(resource);
        }
        return joinPath(defaultFilePath, suggestedFilename);
    }
    suggestFilename(languageId, untitledName) {
        const languageName = this.languageService.getLanguageName(languageId);
        if (!languageName) {
            return untitledName;
        }
        const untitledExtension = pathExtname(untitledName);
        const extensions = this.languageService.getExtensions(languageId);
        if (extensions.includes(untitledExtension)) {
            return untitledName;
        }
        const primaryExtension = extensions.at(0);
        if (primaryExtension) {
            if (untitledExtension) {
                return `${untitledName.substring(0, untitledName.indexOf(untitledExtension))}${primaryExtension}`;
            }
            return `${untitledName}${primaryExtension}`;
        }
        const filenames = this.languageService.getFilenames(languageId);
        if (filenames.includes(untitledName)) {
            return untitledName;
        }
        return filenames.at(0) ?? untitledName;
    }
    async revert(resource, options) {
        if (resource.scheme === Schemas.untitled) {
            const model = this.untitled.get(resource);
            if (model) {
                return model.revert(options);
            }
        }
        else {
            const model = this.files.get(resource);
            if (model && (model.isDirty() || options?.force)) {
                return model.revert(options);
            }
        }
    }
    isDirty(resource) {
        const model = resource.scheme === Schemas.untitled ? this.untitled.get(resource) : this.files.get(resource);
        if (model) {
            return model.isDirty();
        }
        return false;
    }
};
AbstractTextFileService = AbstractTextFileService_1 = __decorate([
    __param(0, IFileService),
    __param(1, IUntitledTextEditorService),
    __param(2, ILifecycleService),
    __param(3, IInstantiationService),
    __param(4, IModelService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, IDialogService),
    __param(7, IFileDialogService),
    __param(8, ITextResourceConfigurationService),
    __param(9, IFilesConfigurationService),
    __param(10, ICodeEditorService),
    __param(11, IPathService),
    __param(12, IWorkingCopyFileService),
    __param(13, IUriIdentityService),
    __param(14, ILanguageService),
    __param(15, ILogService),
    __param(16, IElevatedFileService),
    __param(17, IDecorationsService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AbstractTextFileService);
export { AbstractTextFileService };
let EncodingOracle = class EncodingOracle extends Disposable {
    get encodingOverrides() { return this._encodingOverrides; }
    set encodingOverrides(value) { this._encodingOverrides = value; }
    constructor(textResourceConfigurationService, environmentService, contextService, uriIdentityService) {
        super();
        this.textResourceConfigurationService = textResourceConfigurationService;
        this.environmentService = environmentService;
        this.contextService = contextService;
        this.uriIdentityService = uriIdentityService;
        this._encodingOverrides = this.getDefaultEncodingOverrides();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.encodingOverrides = this.getDefaultEncodingOverrides()));
    }
    getDefaultEncodingOverrides() {
        const defaultEncodingOverrides = [];
        defaultEncodingOverrides.push({ parent: this.environmentService.userRoamingDataHome, encoding: UTF8 });
        defaultEncodingOverrides.push({ extension: WORKSPACE_EXTENSION, encoding: UTF8 });
        defaultEncodingOverrides.push({ parent: this.environmentService.untitledWorkspacesHome, encoding: UTF8 });
        this.contextService.getWorkspace().folders.forEach(folder => {
            defaultEncodingOverrides.push({ parent: joinPath(folder.uri, '.vscode'), encoding: UTF8 });
        });
        return defaultEncodingOverrides;
    }
    async getWriteEncoding(resource, options) {
        const { encoding, hasBOM } = await this.getPreferredWriteEncoding(resource, options ? options.encoding : undefined);
        return { encoding, addBOM: hasBOM };
    }
    async getPreferredWriteEncoding(resource, preferredEncoding) {
        const resourceEncoding = await this.getEncodingForResource(resource, preferredEncoding);
        return {
            encoding: resourceEncoding,
            hasBOM: resourceEncoding === UTF16be || resourceEncoding === UTF16le || resourceEncoding === UTF8_with_bom
        };
    }
    async getPreferredReadEncoding(resource, options, detectedEncoding) {
        let preferredEncoding;
        if (options?.encoding) {
            if (detectedEncoding === UTF8_with_bom && options.encoding === UTF8) {
                preferredEncoding = UTF8_with_bom;
            }
            else {
                preferredEncoding = options.encoding;
            }
        }
        else if (typeof detectedEncoding === 'string') {
            preferredEncoding = detectedEncoding;
        }
        else if (this.textResourceConfigurationService.getValue(resource, 'files.encoding') === UTF8_with_bom) {
            preferredEncoding = UTF8;
        }
        const encoding = await this.getEncodingForResource(resource, preferredEncoding);
        return {
            encoding,
            hasBOM: encoding === UTF16be || encoding === UTF16le || encoding === UTF8_with_bom
        };
    }
    async getEncodingForResource(resource, preferredEncoding) {
        let fileEncoding;
        const override = this.getEncodingOverride(resource);
        if (override) {
            fileEncoding = override;
        }
        else if (preferredEncoding) {
            fileEncoding = preferredEncoding;
        }
        else {
            fileEncoding = this.textResourceConfigurationService.getValue(resource, 'files.encoding');
        }
        if (fileEncoding !== UTF8) {
            if (!fileEncoding || !(await encodingExists(fileEncoding))) {
                fileEncoding = UTF8;
            }
        }
        return fileEncoding;
    }
    getEncodingOverride(resource) {
        if (this.encodingOverrides?.length) {
            for (const override of this.encodingOverrides) {
                if (override.parent && this.uriIdentityService.extUri.isEqualOrParent(resource, override.parent)) {
                    return override.encoding;
                }
                if (override.extension && extname(resource) === `.${override.extension}`) {
                    return override.encoding;
                }
            }
        }
        return undefined;
    }
};
EncodingOracle = __decorate([
    __param(0, ITextResourceConfigurationService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IWorkspaceContextService),
    __param(3, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], EncodingOracle);
export { EncodingOracle };
