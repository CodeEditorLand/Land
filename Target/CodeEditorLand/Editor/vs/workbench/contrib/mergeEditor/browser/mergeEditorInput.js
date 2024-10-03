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
var MergeEditorInput_1;
import { assertFn } from '../../../../base/common/assert.js';
import { autorun } from '../../../../base/common/observable.js';
import { isEqual } from '../../../../base/common/resources.js';
import { isDefined } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { DEFAULT_EDITOR_ASSOCIATION, isResourceMergeEditorInput } from '../../../common/editor.js';
import { ICustomEditorLabelService } from '../../../services/editor/common/customEditorLabelService.js';
import { AbstractTextResourceEditorInput } from '../../../common/editor/textResourceEditorInput.js';
import { TempFileMergeEditorModeFactory, WorkspaceMergeEditorModeFactory } from './mergeEditorInputModel.js';
import { MergeEditorTelemetry } from './telemetry.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
export class MergeEditorInputData {
    constructor(uri, title, detail, description) {
        this.uri = uri;
        this.title = title;
        this.detail = detail;
        this.description = description;
    }
}
let MergeEditorInput = class MergeEditorInput extends AbstractTextResourceEditorInput {
    static { MergeEditorInput_1 = this; }
    static { this.ID = 'mergeEditor.Input'; }
    get useWorkingCopy() {
        return this.configurationService.getValue('mergeEditor.useWorkingCopy') ?? false;
    }
    constructor(base, input1, input2, result, _instaService, editorService, textFileService, labelService, fileService, configurationService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService) {
        super(result, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
        this.base = base;
        this.input1 = input1;
        this.input2 = input2;
        this.result = result;
        this._instaService = _instaService;
        this.configurationService = configurationService;
        this.closeHandler = {
            showConfirm: () => this._inputModel?.shouldConfirmClose() ?? false,
            confirm: async (editors) => {
                assertFn(() => editors.every(e => e.editor instanceof MergeEditorInput_1));
                const inputModels = editors.map(e => e.editor._inputModel).filter(isDefined);
                return await this._inputModel.confirmClose(inputModels);
            },
        };
        this.mergeEditorModeFactory = this._instaService.createInstance(this.useWorkingCopy
            ? TempFileMergeEditorModeFactory
            : WorkspaceMergeEditorModeFactory, this._instaService.createInstance(MergeEditorTelemetry));
    }
    dispose() {
        super.dispose();
    }
    get typeId() {
        return MergeEditorInput_1.ID;
    }
    get editorId() {
        return DEFAULT_EDITOR_ASSOCIATION.id;
    }
    get capabilities() {
        let capabilities = super.capabilities | 256;
        if (this.useWorkingCopy) {
            capabilities |= 4;
        }
        return capabilities;
    }
    getName() {
        return localize('name', "Merging: {0}", super.getName());
    }
    async resolve() {
        if (!this._inputModel) {
            const inputModel = this._register(await this.mergeEditorModeFactory.createInputModel({
                base: this.base,
                input1: this.input1,
                input2: this.input2,
                result: this.result,
            }));
            this._inputModel = inputModel;
            this._register(autorun(reader => {
                inputModel.isDirty.read(reader);
                this._onDidChangeDirty.fire();
            }));
            await this._inputModel.model.onInitialized;
        }
        return this._inputModel;
    }
    async accept() {
        await this._inputModel?.accept();
    }
    async save(group, options) {
        await this._inputModel?.save(options);
        return undefined;
    }
    toUntyped() {
        return {
            input1: { resource: this.input1.uri, label: this.input1.title, description: this.input1.description, detail: this.input1.detail },
            input2: { resource: this.input2.uri, label: this.input2.title, description: this.input2.description, detail: this.input2.detail },
            base: { resource: this.base },
            result: { resource: this.result },
            options: {
                override: this.typeId
            }
        };
    }
    matches(otherInput) {
        if (this === otherInput) {
            return true;
        }
        if (otherInput instanceof MergeEditorInput_1) {
            return isEqual(this.base, otherInput.base)
                && isEqual(this.input1.uri, otherInput.input1.uri)
                && isEqual(this.input2.uri, otherInput.input2.uri)
                && isEqual(this.result, otherInput.result);
        }
        if (isResourceMergeEditorInput(otherInput)) {
            return (this.editorId === otherInput.options?.override || otherInput.options?.override === undefined)
                && isEqual(this.base, otherInput.base.resource)
                && isEqual(this.input1.uri, otherInput.input1.resource)
                && isEqual(this.input2.uri, otherInput.input2.resource)
                && isEqual(this.result, otherInput.result.resource);
        }
        return false;
    }
    async revert(group, options) {
        return this._inputModel?.revert(options);
    }
    isDirty() {
        return this._inputModel?.isDirty.get() ?? false;
    }
    setLanguageId(languageId, source) {
        this._inputModel?.model.setLanguageId(languageId, source);
    }
};
MergeEditorInput = MergeEditorInput_1 = __decorate([
    __param(4, IInstantiationService),
    __param(5, IEditorService),
    __param(6, ITextFileService),
    __param(7, ILabelService),
    __param(8, IFileService),
    __param(9, IConfigurationService),
    __param(10, IFilesConfigurationService),
    __param(11, ITextResourceConfigurationService),
    __param(12, ICustomEditorLabelService),
    __metadata("design:paramtypes", [URI,
        MergeEditorInputData,
        MergeEditorInputData,
        URI, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], MergeEditorInput);
export { MergeEditorInput };
