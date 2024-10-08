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
    // Support the special '${activeEditorLanguage}' language by
    // looking up the language id from the editor that is active
    // before the untitled editor opens. This special id is only
    // used for the initial language and can be changed after the
    // fact (either manually or through auto-detection).
    static { this.ACTIVE_EDITOR_LANGUAGE_ID = '${activeEditorLanguage}'; }
    get name() {
        // Take name from first line if present and only if
        // we have no associated file path. In that case we
        // prefer the file name as title.
        if (this.configuredLabelFormat === 'content' && !this.hasAssociatedFilePath && this.cachedModelFirstLineWords) {
            return this.cachedModelFirstLineWords;
        }
        // Otherwise fallback to resource
        return this.labelService.getUriBasenameLabel(this.resource);
    }
    //#endregion
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
        //#region Events
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
        //#endregion
        this.typeId = NO_TYPE_ID; // IMPORTANT: never change this to not break existing assumptions (e.g. backups)
        this.capabilities = 2 /* WorkingCopyCapabilities.Untitled */;
        //#region Name
        this.configuredLabelFormat = 'content';
        this.cachedModelFirstLineWords = undefined;
        //#endregion
        //#region Dirty
        this.dirty = this.hasAssociatedFilePath || !!this.initialValue;
        //#endregion
        //#region Resolve
        this.ignoreDirtyOnModelContentChange = false;
        // Make known to working copy service
        this._register(this.workingCopyService.registerWorkingCopy(this));
        // This is typically controlled by the setting `files.defaultLanguage`.
        // If that setting is set, we should not detect the language.
        if (preferredLanguageId) {
            this.setLanguageId(preferredLanguageId);
        }
        // Fetch config
        this.onConfigurationChange(undefined, false);
        this.registerListeners();
    }
    registerListeners() {
        // Config Changes
        this._register(this.textResourceConfigurationService.onDidChangeConfiguration(e => this.onConfigurationChange(e, true)));
    }
    onConfigurationChange(e, fromEvent) {
        // Encoding
        if (!e || e.affectsConfiguration(this.resource, 'files.encoding')) {
            const configuredEncoding = this.textResourceConfigurationService.getValue(this.resource, 'files.encoding');
            if (this.configuredEncoding !== configuredEncoding && typeof configuredEncoding === 'string') {
                this.configuredEncoding = configuredEncoding;
                if (fromEvent && !this.preferredEncoding) {
                    this._onDidChangeEncoding.fire(); // do not fire event if we have a preferred encoding set
                }
            }
        }
        // Label Format
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
    //#region Language
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
        // Emit if it changed
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
    //#endregion
    //#region Save / Revert / Backup
    async save(options) {
        const target = await this.textFileService.save(this.resource, options);
        // Emit as event
        if (target) {
            this._onDidSave.fire({ reason: options?.reason, source: options?.source });
        }
        return !!target;
    }
    async revert() {
        // Reset contents to be empty
        this.ignoreDirtyOnModelContentChange = true;
        try {
            this.updateTextEditorModel(createTextBufferFactory(''));
        }
        finally {
            this.ignoreDirtyOnModelContentChange = false;
        }
        // No longer dirty
        this.setDirty(false);
        // Emit as event
        this._onDidRevert.fire();
    }
    async backup(token) {
        let content = undefined;
        // Make sure to check whether this model has been resolved
        // or not and fallback to the initial value - if any - to
        // prevent backing up an unresolved model and loosing the
        // initial value.
        if (this.isResolved()) {
            // Fill in content the same way we would do when saving the file
            // via the text file service encoding support (hardcode UTF-8)
            content = await this.textFileService.getEncodedReadable(this.resource, this.createSnapshot() ?? undefined, { encoding: UTF8 });
        }
        else if (typeof this.initialValue === 'string') {
            content = bufferToReadable(VSBuffer.fromString(this.initialValue));
        }
        return { content };
    }
    async resolve() {
        // Create text editor model if not yet done
        let createdUntitledModel = false;
        let hasBackup = false;
        if (!this.textEditorModel) {
            let untitledContents;
            // Check for backups or use initial value or empty
            const backup = await this.workingCopyBackupService.resolve(this);
            if (backup) {
                untitledContents = backup.value;
                hasBackup = true;
            }
            else {
                untitledContents = bufferToStream(VSBuffer.fromString(this.initialValue || ''));
            }
            // Determine untitled contents based on backup
            // or initial value. We must use text file service
            // to create the text factory to respect encodings
            // accordingly.
            const untitledContentsFactory = await createTextBufferFactoryFromStream(await this.textFileService.getDecodedStream(this.resource, untitledContents, { encoding: UTF8 }));
            this.createTextEditorModel(untitledContentsFactory, this.resource, this.preferredLanguageId);
            createdUntitledModel = true;
        }
        // Otherwise: the untitled model already exists and we must assume
        // that the value of the model was changed by the user. As such we
        // do not update the contents, only the language if configured.
        else {
            this.updateTextEditorModel(undefined, this.preferredLanguageId);
        }
        // Listen to text model events
        const textEditorModel = assertIsDefined(this.textEditorModel);
        this.installModelListeners(textEditorModel);
        // Only adjust name and dirty state etc. if we
        // actually created the untitled model
        if (createdUntitledModel) {
            // Name
            if (hasBackup || this.initialValue) {
                this.updateNameFromFirstLine(textEditorModel);
            }
            // Untitled associated to file path are dirty right away as well as untitled with content
            this.setDirty(this.hasAssociatedFilePath || !!hasBackup || !!this.initialValue);
            // If we have initial contents, make sure to emit this
            // as the appropiate events to the outside.
            if (hasBackup || this.initialValue) {
                this._onDidChangeContent.fire();
            }
        }
        return super.resolve();
    }
    installModelListeners(model) {
        this._register(model.onDidChangeContent(e => this.onModelContentChanged(model, e)));
        this._register(model.onDidChangeLanguage(() => this.onConfigurationChange(undefined, true))); // language change can have impact on config
        super.installModelListeners(model);
    }
    onModelContentChanged(textEditorModel, e) {
        if (!this.ignoreDirtyOnModelContentChange) {
            // mark the untitled text editor as non-dirty once its content becomes empty and we do
            // not have an associated path set. we never want dirty indicator in that case.
            if (!this.hasAssociatedFilePath && textEditorModel.getLineCount() === 1 && textEditorModel.getLineLength(1) === 0) {
                this.setDirty(false);
            }
            // turn dirty otherwise
            else {
                this.setDirty(true);
            }
        }
        // Check for name change if first line changed in the range of 0-FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH columns
        if (e.changes.some(change => (change.range.startLineNumber === 1 || change.range.endLineNumber === 1) && change.range.startColumn <= UntitledTextEditorModel_1.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH)) {
            this.updateNameFromFirstLine(textEditorModel);
        }
        // Emit as general content change event
        this._onDidChangeContent.fire();
        // Detect language from content
        this.autoDetectLanguage();
    }
    updateNameFromFirstLine(textEditorModel) {
        if (this.hasAssociatedFilePath) {
            return; // not in case of an associated file path
        }
        // Determine the first words of the model following these rules:
        // - cannot be only whitespace (so we trim())
        // - cannot be only non-alphanumeric characters (so we run word definition regex over it)
        // - cannot be longer than FIRST_LINE_MAX_TITLE_LENGTH
        // - normalize multiple whitespaces to a single whitespace
        let modelFirstWordsCandidate = undefined;
        let firstLineText = textEditorModel
            .getValueInRange({
            startLineNumber: 1,
            endLineNumber: 1,
            startColumn: 1,
            endColumn: UntitledTextEditorModel_1.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH + 1 // first cap at FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH
        })
            .trim().replace(/\s+/g, ' ') // normalize whitespaces
            .replace(/\u202E/g, ''); // drop Right-to-Left Override character (#190133)
        firstLineText = firstLineText.substr(0, getCharContainingOffset(// finally cap at FIRST_LINE_NAME_MAX_LENGTH (grapheme aware #111235)
        firstLineText, UntitledTextEditorModel_1.FIRST_LINE_NAME_MAX_LENGTH)[0]);
        if (firstLineText && ensureValidWordDefinition().exec(firstLineText)) {
            modelFirstWordsCandidate = firstLineText;
        }
        if (modelFirstWordsCandidate !== this.cachedModelFirstLineWords) {
            this.cachedModelFirstLineWords = modelFirstWordsCandidate;
            this._onDidChangeName.fire();
        }
    }
    //#endregion
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
