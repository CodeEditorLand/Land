import { ICodeEditor, IDiffEditorConstructionOptions } from '../../editorBrowser.js';
import { ICodeEditorService } from '../../services/codeEditorService.js';
import { DiffEditorWidget, IDiffCodeEditorWidgetOptions } from './diffEditorWidget.js';
import { IEditorOptions } from '../../../common/config/editorOptions.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorProgressService } from '../../../../platform/progress/common/progress.js';
export declare class EmbeddedDiffEditorWidget extends DiffEditorWidget {
    private readonly _parentEditor;
    private readonly _overwriteOptions;
    constructor(domElement: HTMLElement, options: Readonly<IDiffEditorConstructionOptions>, codeEditorWidgetOptions: IDiffCodeEditorWidgetOptions, parentEditor: ICodeEditor, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, accessibilitySignalService: IAccessibilitySignalService, editorProgressService: IEditorProgressService);
    getParentEditor(): ICodeEditor;
    private _onParentConfigurationChanged;
    updateOptions(newOptions: IEditorOptions): void;
}
