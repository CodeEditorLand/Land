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
var UntitledTextEditorInput_1;
import { DEFAULT_EDITOR_ASSOCIATION, findViewStateForEditor, isUntitledResourceEditorInput } from '../../../common/editor.js';
import { AbstractTextResourceEditorInput } from '../../../common/editor/textResourceEditorInput.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { isEqual, toLocalResource } from '../../../../base/common/resources.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IPathService } from '../../path/common/pathService.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { DisposableStore, dispose } from '../../../../base/common/lifecycle.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { ICustomEditorLabelService } from '../../editor/common/customEditorLabelService.js';
let UntitledTextEditorInput = class UntitledTextEditorInput extends AbstractTextResourceEditorInput {
    static { UntitledTextEditorInput_1 = this; }
    static { this.ID = 'workbench.editors.untitledEditorInput'; }
    get typeId() {
        return UntitledTextEditorInput_1.ID;
    }
    get editorId() {
        return DEFAULT_EDITOR_ASSOCIATION.id;
    }
    constructor(model, textFileService, labelService, editorService, fileService, environmentService, pathService, filesConfigurationService, textModelService, textResourceConfigurationService, customEditorLabelService) {
        super(model.resource, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
        this.model = model;
        this.environmentService = environmentService;
        this.pathService = pathService;
        this.textModelService = textModelService;
        this.modelResolve = undefined;
        this.modelDisposables = this._register(new DisposableStore());
        this.cachedUntitledTextEditorModelReference = undefined;
        this.registerModelListeners(model);
        this._register(this.textFileService.untitled.onDidCreate(model => this.onDidCreateUntitledModel(model)));
    }
    registerModelListeners(model) {
        this.modelDisposables.clear();
        this.modelDisposables.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
        this.modelDisposables.add(model.onDidChangeName(() => this._onDidChangeLabel.fire()));
        this.modelDisposables.add(model.onDidRevert(() => this.dispose()));
    }
    onDidCreateUntitledModel(model) {
        if (isEqual(model.resource, this.model.resource) && model !== this.model) {
            this.model = model;
            this.registerModelListeners(model);
        }
    }
    getName() {
        return this.model.name;
    }
    getDescription(verbosity = 1) {
        if (!this.model.hasAssociatedFilePath) {
            const descriptionCandidate = this.resource.path;
            if (descriptionCandidate !== this.getName()) {
                return descriptionCandidate;
            }
            return undefined;
        }
        return super.getDescription(verbosity);
    }
    getTitle(verbosity) {
        if (!this.model.hasAssociatedFilePath) {
            const name = this.getName();
            const description = this.getDescription();
            if (description && description !== name) {
                return `${name} • ${description}`;
            }
            return name;
        }
        return super.getTitle(verbosity);
    }
    isDirty() {
        return this.model.isDirty();
    }
    getEncoding() {
        return this.model.getEncoding();
    }
    setEncoding(encoding, mode) {
        return this.model.setEncoding(encoding);
    }
    get hasLanguageSetExplicitly() { return this.model.hasLanguageSetExplicitly; }
    get hasAssociatedFilePath() { return this.model.hasAssociatedFilePath; }
    setLanguageId(languageId, source) {
        this.model.setLanguageId(languageId, source);
    }
    getLanguageId() {
        return this.model.getLanguageId();
    }
    async resolve() {
        if (!this.modelResolve) {
            this.modelResolve = (async () => {
                this.cachedUntitledTextEditorModelReference = await this.textModelService.createModelReference(this.resource);
            })();
        }
        await this.modelResolve;
        if (this.isDisposed()) {
            this.disposeModelReference();
        }
        return this.model;
    }
    toUntyped(options) {
        const untypedInput = {
            resource: this.model.hasAssociatedFilePath ? toLocalResource(this.model.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme) : this.resource,
            forceUntitled: true,
            options: {
                override: this.editorId
            }
        };
        if (typeof options?.preserveViewState === 'number') {
            untypedInput.encoding = this.getEncoding();
            untypedInput.languageId = this.getLanguageId();
            untypedInput.contents = this.model.isModified() ? this.model.textEditorModel?.getValue() : undefined;
            untypedInput.options.viewState = findViewStateForEditor(this, options.preserveViewState, this.editorService);
            if (typeof untypedInput.contents === 'string' && !this.model.hasAssociatedFilePath && !options.preserveResource) {
                untypedInput.resource = undefined;
            }
        }
        return untypedInput;
    }
    matches(otherInput) {
        if (this === otherInput) {
            return true;
        }
        if (otherInput instanceof UntitledTextEditorInput_1) {
            return isEqual(otherInput.resource, this.resource);
        }
        if (isUntitledResourceEditorInput(otherInput)) {
            return super.matches(otherInput);
        }
        return false;
    }
    dispose() {
        this.modelResolve = undefined;
        this.disposeModelReference();
        super.dispose();
    }
    disposeModelReference() {
        dispose(this.cachedUntitledTextEditorModelReference);
        this.cachedUntitledTextEditorModelReference = undefined;
    }
};
UntitledTextEditorInput = UntitledTextEditorInput_1 = __decorate([
    __param(1, ITextFileService),
    __param(2, ILabelService),
    __param(3, IEditorService),
    __param(4, IFileService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, IPathService),
    __param(7, IFilesConfigurationService),
    __param(8, ITextModelService),
    __param(9, ITextResourceConfigurationService),
    __param(10, ICustomEditorLabelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UntitledTextEditorInput);
export { UntitledTextEditorInput };
