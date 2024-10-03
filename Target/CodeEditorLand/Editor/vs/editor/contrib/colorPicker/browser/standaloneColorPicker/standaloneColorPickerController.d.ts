import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor } from '../../../../browser/editorBrowser.js';
import { IEditorContribution } from '../../../../common/editorCommon.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
export declare class StandaloneColorPickerController extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _instantiationService;
    static ID: string;
    private _standaloneColorPickerWidget;
    private _standaloneColorPickerVisible;
    private _standaloneColorPickerFocused;
    constructor(_editor: ICodeEditor, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService);
    showOrFocus(): void;
    hide(): void;
    insertColor(): void;
    static get(editor: ICodeEditor): StandaloneColorPickerController | null;
}
