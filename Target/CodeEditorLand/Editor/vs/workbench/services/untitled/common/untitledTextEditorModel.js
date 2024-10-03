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
var UntitledTextEditorModel_1;
import { BaseTextEditorModel } from '../../../common/editor/textEditorModel.js';
import { URI } from '../../../../base/common/uri.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { Emitter } from '../../../../base/common/event.js';
import { IWorkingCopyBackupService } from '../../workingCopy/common/workingCopyBackup.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { createTextBufferFactory, createTextBufferFactoryFromStream } from '../../../../editor/common/model/textModel.js';
import { IWorkingCopyService } from '../../workingCopy/common/workingCopyService.js';
import { NO_TYPE_ID } from '../../workingCopy/common/workingCopy.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ensureValidWordDefinition } from '../../../../editor/common/core/wordHelper.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { getCharContainingOffset } from '../../../../base/common/strings.js';
import { UTF8 } from '../../textfile/common/encoding.js';
import { bufferToReadable, bufferToStream, VSBuffer } from '../../../../base/common/buffer.js';
import { ILanguageDetectionService } from '../../languageDetection/common/languageDetectionWorkerService.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
let UntitledTextEditorModel = class UntitledTextEditorModel extends BaseTextEditorModel {
    static { UntitledTextEditorModel_1 = this; }
    static { this.FIRST_LINE_NAME_MAX_LENGTH = 40; }
    static { this.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH = this.FIRST_LINE_NAME_MAX_LENGTH * 10; }
    static { this.ACTIVE_EDITOR_LANGUAGE_ID = '${activeEditorLanguage}'; }
    get name() {
        if (this.configuredLabelFormat === 'content' && !this.hasAssociatedFilePath && this.cachedModelFirstLineWords) {
            return this.cachedModelFirstLineWords;
        }
        return this.labelService.getUriBasenameLabel(this.resource);
    }
    constructor(resource, hasAssociatedFilePath, initialValue, preferredLanguageId, preferredEncoding, languageService, modelService, workingCopyBackupService, textResourceConfigurationService, workingCopyService, textFileService, labelService, editorService, languageDetectionService, accessibilityService) {
        super(modelService, languageService, languageDetectionService, accessibilityService);
        this.resource = resource;
        this.hasAssociatedFilePath = hasAssociatedFilePath;
        this.initialValue = initialValue;
        this.preferredLanguageId = preferredLanguageId;
        this.preferredEncoding = preferredEncoding;
        this.workingCopyBackupService = workingCopyBackupService;
        this.textResourceConfigurationService = textResourceConfigurationService;
        this.workingCopyService = workingCopyService;
        this.textFileService = textFileService;
        this.labelService = labelService;
        this.editorService = editorService;
        this._onDidChangeContent = this._register(new Emitter());
        this.onDidChangeContent = this._onDidChangeContent.event;
        this._onDidChangeName = this._register(new Emitter());
        this.onDidChangeName = this._onDidChangeName.event;
        this._onDidChangeDirty = this._register(new Emitter());
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this._onDidChangeEncoding = this._register(new Emitter());
        this.onDidChangeEncoding = this._onDidChangeEncoding.event;
        this._onDidSave = this._register(new Emitter());
        this.onDidSave = this._onDidSave.event;
        this._onDidRevert = this._register(new Emitter());
        this.onDidRevert = this._onDidRevert.event;
        this.typeId = NO_TYPE_ID;
        this.capabilities = 2;
        this.configuredLabelFormat = 'content';
        this.cachedModelFirstLineWords = undefined;
        this.dirty = this.hasAssociatedFilePath || !!this.initialValue;
        this.ignoreDirtyOnModelContentChange = false;
        this._register(this.workingCopyService.registerWorkingCopy(this));
        if (preferredLanguageId) {
            this.setLanguageId(preferredLanguageId);
        }
        this.onConfigurationChange(undefined, false);
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.textResourceConfigurationService.onDidChangeConfiguration(e => this.onConfigurationChange(e, true)));
    }
    onConfigurationChange(e, fromEvent) {
        if (!e || e.affectsConfiguration(this.resource, 'files.encoding')) {
            const configuredEncoding = this.textResourceConfigurationService.getValue(this.resource, 'files.encoding');
            if (this.configuredEncoding !== configuredEncoding && typeof configuredEncoding === 'string') {
                this.configuredEncoding = configuredEncoding;
                if (fromEvent && !this.preferredEncoding) {
                    this._onDidChangeEncoding.fire();
                }
            }
        }
        if (!e || e.affectsConfiguration(this.resource, 'workbench.editor.untitled.labelFormat')) {
            const configuredLabelFormat = this.textResourceConfigurationService.getValue(this.resource, 'workbench.editor.untitled.labelFormat');
            if (this.configuredLabelFormat !== configuredLabelFormat && (configuredLabelFormat === 'content' || configuredLabelFormat === 'name')) {
                this.configuredLabelFormat = configuredLabelFormat;
                if (fromEvent) {
                    this._onDidChangeName.fire();
                }
            }
        }
    }
    setLanguageId(languageId, source) {
        const actualLanguage = languageId === UntitledTextEditorModel_1.ACTIVE_EDITOR_LANGUAGE_ID
            ? this.editorService.activeTextEditorLanguageId
            : languageId;
        this.preferredLanguageId = actualLanguage;
        if (actualLanguage) {
            super.setLanguageId(actualLanguage, source);
        }
    }
    getLanguageId() {
        if (this.textEditorModel) {
            return this.textEditorModel.getLanguageId();
        }
        return this.preferredLanguageId;
    }
    getEncoding() {
        return this.preferredEncoding || this.configuredEncoding;
    }
    async setEncoding(encoding) {
        const oldEncoding = this.getEncoding();
        this.preferredEncoding = encoding;
        if (oldEncoding !== this.preferredEncoding) {
            this._onDidChangeEncoding.fire();
        }
    }
    isDirty() {
        return this.dirty;
    }
    isModified() {
        return this.isDirty();
    }
    setDirty(dirty) {
        if (this.dirty === dirty) {
            return;
        }
        this.dirty = dirty;
        this._onDidChangeDirty.fire();
    }
    async save(options) {
        const target = await this.textFileService.save(this.resource, options);
        if (target) {
            this._onDidSave.fire({ reason: options?.reason, source: options?.source });
        }
        return !!target;
    }
    async revert() {
        this.ignoreDirtyOnModelContentChange = true;
        try {
            this.updateTextEditorModel(createTextBufferFactory(''));
        }
        finally {
            this.ignoreDirtyOnModelContentChange = false;
        }
        this.setDirty(false);
        this._onDidRevert.fire();
    }
    async backup(token) {
        let content = undefined;
        if (this.isResolved()) {
            content = await this.textFileService.getEncodedReadable(this.resource, this.createSnapshot() ?? undefined, { encoding: UTF8 });
        }
        else if (typeof this.initialValue === 'string') {
            content = bufferToReadable(VSBuffer.fromString(this.initialValue));
        }
        return { content };
    }
    async resolve() {
        let createdUntitledModel = false;
        let hasBackup = false;
        if (!this.textEditorModel) {
            let untitledContents;
            const backup = await this.workingCopyBackupService.resolve(this);
            if (backup) {
                untitledContents = backup.value;
                hasBackup = true;
            }
            else {
                untitledContents = bufferToStream(VSBuffer.fromString(this.initialValue || ''));
            }
            const untitledContentsFactory = await createTextBufferFactoryFromStream(await this.textFileService.getDecodedStream(this.resource, untitledContents, { encoding: UTF8 }));
            this.createTextEditorModel(untitledContentsFactory, this.resource, this.preferredLanguageId);
            createdUntitledModel = true;
        }
        else {
            this.updateTextEditorModel(undefined, this.preferredLanguageId);
        }
        const textEditorModel = assertIsDefined(this.textEditorModel);
        this.installModelListeners(textEditorModel);
        if (createdUntitledModel) {
            if (hasBackup || this.initialValue) {
                this.updateNameFromFirstLine(textEditorModel);
            }
            this.setDirty(this.hasAssociatedFilePath || !!hasBackup || !!this.initialValue);
            if (hasBackup || this.initialValue) {
                this._onDidChangeContent.fire();
            }
        }
        return super.resolve();
    }
    installModelListeners(model) {
        this._register(model.onDidChangeContent(e => this.onModelContentChanged(model, e)));
        this._register(model.onDidChangeLanguage(() => this.onConfigurationChange(undefined, true)));
        super.installModelListeners(model);
    }
    onModelContentChanged(textEditorModel, e) {
        if (!this.ignoreDirtyOnModelContentChange) {
            if (!this.hasAssociatedFilePath && textEditorModel.getLineCount() === 1 && textEditorModel.getLineLength(1) === 0) {
                this.setDirty(false);
            }
            else {
                this.setDirty(true);
            }
        }
        if (e.changes.some(change => (change.range.startLineNumber === 1 || change.range.endLineNumber === 1) && change.range.startColumn <= UntitledTextEditorModel_1.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH)) {
            this.updateNameFromFirstLine(textEditorModel);
        }
        this._onDidChangeContent.fire();
        this.autoDetectLanguage();
    }
    updateNameFromFirstLine(textEditorModel) {
        if (this.hasAssociatedFilePath) {
            return;
        }
        let modelFirstWordsCandidate = undefined;
        let firstLineText = textEditorModel
            .getValueInRange({
            startLineNumber: 1,
            endLineNumber: 1,
            startColumn: 1,
            endColumn: UntitledTextEditorModel_1.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH + 1
        })
            .trim().replace(/\s+/g, ' ')
            .replace(/\u202E/g, '');
        firstLineText = firstLineText.substr(0, getCharContainingOffset(firstLineText, UntitledTextEditorModel_1.FIRST_LINE_NAME_MAX_LENGTH)[0]);
        if (firstLineText && ensureValidWordDefinition().exec(firstLineText)) {
            modelFirstWordsCandidate = firstLineText;
        }
        if (modelFirstWordsCandidate !== this.cachedModelFirstLineWords) {
            this.cachedModelFirstLineWords = modelFirstWordsCandidate;
            this._onDidChangeName.fire();
        }
    }
    isReadonly() {
        return false;
    }
};
UntitledTextEditorModel = UntitledTextEditorModel_1 = __decorate([
    __param(5, ILanguageService),
    __param(6, IModelService),
    __param(7, IWorkingCopyBackupService),
    __param(8, ITextResourceConfigurationService),
    __param(9, IWorkingCopyService),
    __param(10, ITextFileService),
    __param(11, ILabelService),
    __param(12, IEditorService),
    __param(13, ILanguageDetectionService),
    __param(14, IAccessibilityService),
    __metadata("design:paramtypes", [URI, Boolean, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UntitledTextEditorModel);
export { UntitledTextEditorModel };
