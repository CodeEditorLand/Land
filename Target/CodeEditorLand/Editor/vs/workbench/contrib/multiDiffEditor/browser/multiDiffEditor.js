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
var MultiDiffEditor_1;
import { MultiDiffEditorWidget } from '../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorWidget.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { InstantiationService } from '../../../../platform/instantiation/common/instantiationService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ResourceLabel } from '../../../browser/labels.js';
import { AbstractEditorWithViewState } from '../../../browser/parts/editor/editorWithViewState.js';
import { MultiDiffEditorInput } from './multiDiffEditorInput.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Range } from '../../../../editor/common/core/range.js';
import { IEditorProgressService } from '../../../../platform/progress/common/progress.js';
let MultiDiffEditor = class MultiDiffEditor extends AbstractEditorWithViewState {
    static { MultiDiffEditor_1 = this; }
    static { this.ID = 'multiDiffEditor'; }
    get viewModel() {
        return this._viewModel;
    }
    constructor(group, instantiationService, telemetryService, themeService, storageService, editorService, editorGroupService, textResourceConfigurationService, editorProgressService) {
        super(MultiDiffEditor_1.ID, group, 'multiDiffEditor', telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
        this.editorProgressService = editorProgressService;
        this._multiDiffEditorWidget = undefined;
    }
    createEditor(parent) {
        this._multiDiffEditorWidget = this._register(this.instantiationService.createInstance(MultiDiffEditorWidget, parent, this.instantiationService.createInstance(WorkbenchUIElementFactory)));
        this._register(this._multiDiffEditorWidget.onDidChangeActiveControl(() => {
            this._onDidChangeControl.fire();
        }));
    }
    async setInput(input, options, context, token) {
        await super.setInput(input, options, context, token);
        this._viewModel = await input.getViewModel();
        this._multiDiffEditorWidget.setViewModel(this._viewModel);
        const viewState = this.loadEditorViewState(input, context);
        if (viewState) {
            this._multiDiffEditorWidget.setViewState(viewState);
        }
        this._applyOptions(options);
    }
    setOptions(options) {
        this._applyOptions(options);
    }
    _applyOptions(options) {
        const viewState = options?.viewState;
        if (!viewState || !viewState.revealData) {
            return;
        }
        this._multiDiffEditorWidget?.reveal(viewState.revealData.resource, {
            range: viewState.revealData.range ? Range.lift(viewState.revealData.range) : undefined,
            highlight: true
        });
    }
    async clearInput() {
        await super.clearInput();
        this._multiDiffEditorWidget.setViewModel(undefined);
    }
    layout(dimension) {
        this._multiDiffEditorWidget.layout(dimension);
    }
    getControl() {
        return this._multiDiffEditorWidget.getActiveControl();
    }
    focus() {
        super.focus();
        this._multiDiffEditorWidget?.getActiveControl()?.focus();
    }
    hasFocus() {
        return this._multiDiffEditorWidget?.getActiveControl()?.hasTextFocus() || super.hasFocus();
    }
    computeEditorViewState(resource) {
        return this._multiDiffEditorWidget.getViewState();
    }
    tracksEditorViewState(input) {
        return input instanceof MultiDiffEditorInput;
    }
    toEditorViewStateResource(input) {
        return input.resource;
    }
    tryGetCodeEditor(resource) {
        return this._multiDiffEditorWidget.tryGetCodeEditor(resource);
    }
    findDocumentDiffItem(resource) {
        const i = this._multiDiffEditorWidget.findDocumentDiffItem(resource);
        if (!i) {
            return undefined;
        }
        const i2 = i;
        return i2.multiDiffEditorItem;
    }
    async showWhile(promise) {
        return this.editorProgressService.showWhile(promise);
    }
};
MultiDiffEditor = MultiDiffEditor_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, ITelemetryService),
    __param(3, IThemeService),
    __param(4, IStorageService),
    __param(5, IEditorService),
    __param(6, IEditorGroupsService),
    __param(7, ITextResourceConfigurationService),
    __param(8, IEditorProgressService),
    __metadata("design:paramtypes", [Object, InstantiationService, Object, Object, Object, Object, Object, Object, Object])
], MultiDiffEditor);
export { MultiDiffEditor };
let WorkbenchUIElementFactory = class WorkbenchUIElementFactory {
    constructor(_instantiationService) {
        this._instantiationService = _instantiationService;
    }
    createResourceLabel(element) {
        const label = this._instantiationService.createInstance(ResourceLabel, element, {});
        return {
            setUri(uri, options = {}) {
                if (!uri) {
                    label.element.clear();
                }
                else {
                    label.element.setFile(uri, { strikethrough: options.strikethrough });
                }
            },
            dispose() {
                label.dispose();
            }
        };
    }
};
WorkbenchUIElementFactory = __decorate([
    __param(0, IInstantiationService),
    __metadata("design:paramtypes", [Object])
], WorkbenchUIElementFactory);
