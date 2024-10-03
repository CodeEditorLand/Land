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
var SideBySideEditorInput_1;
import { Event } from '../../../base/common/event.js';
import { localize } from '../../../nls.js';
import { Registry } from '../../../platform/registry/common/platform.js';
import { EditorExtensions, isResourceSideBySideEditorInput, isDiffEditorInput, isResourceDiffEditorInput, findViewStateForEditor, isEditorInput, isResourceEditorInput, isResourceMergeEditorInput, isResourceMultiDiffEditorInput } from '../editor.js';
import { EditorInput } from './editorInput.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
let SideBySideEditorInput = class SideBySideEditorInput extends EditorInput {
    static { SideBySideEditorInput_1 = this; }
    static { this.ID = 'workbench.editorinputs.sidebysideEditorInput'; }
    get typeId() {
        return SideBySideEditorInput_1.ID;
    }
    get capabilities() {
        let capabilities = this.primary.capabilities;
        capabilities &= ~32;
        if (this.secondary.hasCapability(16)) {
            capabilities |= 16;
        }
        if (this.secondary.hasCapability(8)) {
            capabilities |= 8;
        }
        capabilities |= 256;
        return capabilities;
    }
    get resource() {
        if (this.hasIdenticalSides) {
            return this.primary.resource;
        }
        return undefined;
    }
    constructor(preferredName, preferredDescription, secondary, primary, editorService) {
        super();
        this.preferredName = preferredName;
        this.preferredDescription = preferredDescription;
        this.secondary = secondary;
        this.primary = primary;
        this.editorService = editorService;
        this.hasIdenticalSides = this.primary.matches(this.secondary);
        this.registerListeners();
    }
    registerListeners() {
        this._register(Event.once(Event.any(this.primary.onWillDispose, this.secondary.onWillDispose))(() => {
            if (!this.isDisposed()) {
                this.dispose();
            }
        }));
        this._register(this.primary.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
        this._register(this.primary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
        this._register(this.secondary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
        this._register(this.primary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
        this._register(this.secondary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
    }
    getName() {
        const preferredName = this.getPreferredName();
        if (preferredName) {
            return preferredName;
        }
        if (this.hasIdenticalSides) {
            return this.primary.getName();
        }
        return localize('sideBySideLabels', "{0} - {1}", this.secondary.getName(), this.primary.getName());
    }
    getPreferredName() {
        return this.preferredName;
    }
    getDescription(verbosity) {
        const preferredDescription = this.getPreferredDescription();
        if (preferredDescription) {
            return preferredDescription;
        }
        if (this.hasIdenticalSides) {
            return this.primary.getDescription(verbosity);
        }
        return super.getDescription(verbosity);
    }
    getPreferredDescription() {
        return this.preferredDescription;
    }
    getTitle(verbosity) {
        let title;
        if (this.hasIdenticalSides) {
            title = this.primary.getTitle(verbosity) ?? this.getName();
        }
        else {
            title = super.getTitle(verbosity);
        }
        const preferredTitle = this.getPreferredTitle();
        if (preferredTitle) {
            title = `${preferredTitle} (${title})`;
        }
        return title;
    }
    getPreferredTitle() {
        if (this.preferredName && this.preferredDescription) {
            return `${this.preferredName} ${this.preferredDescription}`;
        }
        if (this.preferredName || this.preferredDescription) {
            return this.preferredName ?? this.preferredDescription;
        }
        return undefined;
    }
    getLabelExtraClasses() {
        if (this.hasIdenticalSides) {
            return this.primary.getLabelExtraClasses();
        }
        return super.getLabelExtraClasses();
    }
    getAriaLabel() {
        if (this.hasIdenticalSides) {
            return this.primary.getAriaLabel();
        }
        return super.getAriaLabel();
    }
    getTelemetryDescriptor() {
        const descriptor = this.primary.getTelemetryDescriptor();
        return { ...descriptor, ...super.getTelemetryDescriptor() };
    }
    isDirty() {
        return this.primary.isDirty();
    }
    isSaving() {
        return this.primary.isSaving();
    }
    async save(group, options) {
        const primarySaveResult = await this.primary.save(group, options);
        return this.saveResultToEditor(primarySaveResult);
    }
    async saveAs(group, options) {
        const primarySaveResult = await this.primary.saveAs(group, options);
        return this.saveResultToEditor(primarySaveResult);
    }
    saveResultToEditor(primarySaveResult) {
        if (!primarySaveResult || !this.hasIdenticalSides) {
            return primarySaveResult;
        }
        if (this.primary.matches(primarySaveResult)) {
            return this;
        }
        if (primarySaveResult instanceof EditorInput) {
            return new SideBySideEditorInput_1(this.preferredName, this.preferredDescription, primarySaveResult, primarySaveResult, this.editorService);
        }
        if (!isResourceDiffEditorInput(primarySaveResult) && !isResourceMultiDiffEditorInput(primarySaveResult) && !isResourceSideBySideEditorInput(primarySaveResult) && !isResourceMergeEditorInput(primarySaveResult)) {
            return {
                primary: primarySaveResult,
                secondary: primarySaveResult,
                label: this.preferredName,
                description: this.preferredDescription
            };
        }
        return undefined;
    }
    revert(group, options) {
        return this.primary.revert(group, options);
    }
    async rename(group, target) {
        if (!this.hasIdenticalSides) {
            return;
        }
        const renameResult = await this.primary.rename(group, target);
        if (!renameResult) {
            return undefined;
        }
        if (isEditorInput(renameResult.editor)) {
            return {
                editor: new SideBySideEditorInput_1(this.preferredName, this.preferredDescription, renameResult.editor, renameResult.editor, this.editorService),
                options: {
                    ...renameResult.options,
                    viewState: findViewStateForEditor(this, group, this.editorService)
                }
            };
        }
        if (isResourceEditorInput(renameResult.editor)) {
            return {
                editor: {
                    label: this.preferredName,
                    description: this.preferredDescription,
                    primary: renameResult.editor,
                    secondary: renameResult.editor,
                    options: {
                        ...renameResult.options,
                        viewState: findViewStateForEditor(this, group, this.editorService)
                    }
                }
            };
        }
        return undefined;
    }
    isReadonly() {
        return this.primary.isReadonly();
    }
    toUntyped(options) {
        const primaryResourceEditorInput = this.primary.toUntyped(options);
        const secondaryResourceEditorInput = this.secondary.toUntyped(options);
        if (primaryResourceEditorInput && secondaryResourceEditorInput &&
            !isResourceDiffEditorInput(primaryResourceEditorInput) && !isResourceDiffEditorInput(secondaryResourceEditorInput) &&
            !isResourceMultiDiffEditorInput(primaryResourceEditorInput) && !isResourceMultiDiffEditorInput(secondaryResourceEditorInput) &&
            !isResourceSideBySideEditorInput(primaryResourceEditorInput) && !isResourceSideBySideEditorInput(secondaryResourceEditorInput) &&
            !isResourceMergeEditorInput(primaryResourceEditorInput) && !isResourceMergeEditorInput(secondaryResourceEditorInput)) {
            const untypedInput = {
                label: this.preferredName,
                description: this.preferredDescription,
                primary: primaryResourceEditorInput,
                secondary: secondaryResourceEditorInput
            };
            if (typeof options?.preserveViewState === 'number') {
                untypedInput.options = {
                    viewState: findViewStateForEditor(this, options.preserveViewState, this.editorService)
                };
            }
            return untypedInput;
        }
        return undefined;
    }
    matches(otherInput) {
        if (this === otherInput) {
            return true;
        }
        if (isDiffEditorInput(otherInput) || isResourceDiffEditorInput(otherInput)) {
            return false;
        }
        if (otherInput instanceof SideBySideEditorInput_1) {
            return this.primary.matches(otherInput.primary) && this.secondary.matches(otherInput.secondary);
        }
        if (isResourceSideBySideEditorInput(otherInput)) {
            return this.primary.matches(otherInput.primary) && this.secondary.matches(otherInput.secondary);
        }
        return false;
    }
};
SideBySideEditorInput = SideBySideEditorInput_1 = __decorate([
    __param(4, IEditorService),
    __metadata("design:paramtypes", [Object, Object, EditorInput,
        EditorInput, Object])
], SideBySideEditorInput);
export { SideBySideEditorInput };
export class AbstractSideBySideEditorInputSerializer {
    canSerialize(editorInput) {
        const input = editorInput;
        if (input.primary && input.secondary) {
            const [secondaryInputSerializer, primaryInputSerializer] = this.getSerializers(input.secondary.typeId, input.primary.typeId);
            return !!(secondaryInputSerializer?.canSerialize(input.secondary) && primaryInputSerializer?.canSerialize(input.primary));
        }
        return false;
    }
    serialize(editorInput) {
        const input = editorInput;
        if (input.primary && input.secondary) {
            const [secondaryInputSerializer, primaryInputSerializer] = this.getSerializers(input.secondary.typeId, input.primary.typeId);
            if (primaryInputSerializer && secondaryInputSerializer) {
                const primarySerialized = primaryInputSerializer.serialize(input.primary);
                const secondarySerialized = secondaryInputSerializer.serialize(input.secondary);
                if (primarySerialized && secondarySerialized) {
                    const serializedEditorInput = {
                        name: input.getPreferredName(),
                        description: input.getPreferredDescription(),
                        primarySerialized,
                        secondarySerialized,
                        primaryTypeId: input.primary.typeId,
                        secondaryTypeId: input.secondary.typeId
                    };
                    return JSON.stringify(serializedEditorInput);
                }
            }
        }
        return undefined;
    }
    deserialize(instantiationService, serializedEditorInput) {
        const deserialized = JSON.parse(serializedEditorInput);
        const [secondaryInputSerializer, primaryInputSerializer] = this.getSerializers(deserialized.secondaryTypeId, deserialized.primaryTypeId);
        if (primaryInputSerializer && secondaryInputSerializer) {
            const primaryInput = primaryInputSerializer.deserialize(instantiationService, deserialized.primarySerialized);
            const secondaryInput = secondaryInputSerializer.deserialize(instantiationService, deserialized.secondarySerialized);
            if (primaryInput instanceof EditorInput && secondaryInput instanceof EditorInput) {
                return this.createEditorInput(instantiationService, deserialized.name, deserialized.description, secondaryInput, primaryInput);
            }
        }
        return undefined;
    }
    getSerializers(secondaryEditorInputTypeId, primaryEditorInputTypeId) {
        const registry = Registry.as(EditorExtensions.EditorFactory);
        return [registry.getEditorSerializer(secondaryEditorInputTypeId), registry.getEditorSerializer(primaryEditorInputTypeId)];
    }
}
export class SideBySideEditorInputSerializer extends AbstractSideBySideEditorInputSerializer {
    createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
        return instantiationService.createInstance(SideBySideEditorInput, name, description, secondaryInput, primaryInput);
    }
}
