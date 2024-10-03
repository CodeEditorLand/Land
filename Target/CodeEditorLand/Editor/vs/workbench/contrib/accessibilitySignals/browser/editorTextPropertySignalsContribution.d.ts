import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class EditorTextPropertySignalsContribution extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _instantiationService;
    private readonly _accessibilitySignalService;
    private readonly _textProperties;
    private readonly _someAccessibilitySignalIsEnabled;
    private readonly _activeEditorObservable;
    constructor(_editorService: IEditorService, _instantiationService: IInstantiationService, _accessibilitySignalService: IAccessibilitySignalService);
    private _registerAccessibilitySignalsForEditor;
}
