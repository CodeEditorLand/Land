import '../colorPicker.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from '../../../../browser/editorBrowser.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { ILanguageFeaturesService } from '../../../../common/services/languageFeatures.js';
import { IContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { IEditorWorkerService } from '../../../../common/services/editorWorker.js';
import { StandaloneColorPickerHover } from './standaloneColorPickerParticipant.js';
declare class StandaloneColorPickerResult {
    readonly value: StandaloneColorPickerHover;
    readonly foundInEditor: boolean;
    constructor(value: StandaloneColorPickerHover, foundInEditor: boolean);
}
export declare class StandaloneColorPickerWidget extends Disposable implements IContentWidget {
    private readonly _editor;
    private readonly _standaloneColorPickerVisible;
    private readonly _standaloneColorPickerFocused;
    private readonly _keybindingService;
    private readonly _languageFeaturesService;
    private readonly _editorWorkerService;
    static readonly ID = "editor.contrib.standaloneColorPickerWidget";
    readonly allowEditorOverflow = true;
    private readonly _position;
    private readonly _standaloneColorPickerParticipant;
    private _body;
    private _colorHover;
    private _selectionSetInEditor;
    private readonly _onResult;
    readonly onResult: import("../../../../../workbench/workbench.web.main.internal").Event<StandaloneColorPickerResult>;
    constructor(_editor: ICodeEditor, _standaloneColorPickerVisible: IContextKey<boolean>, _standaloneColorPickerFocused: IContextKey<boolean>, _instantiationService: IInstantiationService, _keybindingService: IKeybindingService, _languageFeaturesService: ILanguageFeaturesService, _editorWorkerService: IEditorWorkerService);
    updateEditor(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    hide(): void;
    focus(): void;
    private _start;
    private _computeAsync;
    private _render;
}
export {};
