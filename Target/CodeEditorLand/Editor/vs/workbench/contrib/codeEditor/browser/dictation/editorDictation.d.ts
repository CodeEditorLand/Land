import './editorDictation.css';
import { IDimension } from '../../../../../base/browser/dom.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from '../../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../../editor/common/editorCommon.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ISpeechService } from '../../../speech/common/speechService.js';
import { EditorAction2 } from '../../../../../editor/browser/editorExtensions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
export declare class EditorDictationStartAction extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class EditorDictationStopAction extends EditorAction2 {
    static readonly ID = "workbench.action.editorDictation.stop";
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class DictationWidget extends Disposable implements IContentWidget {
    private readonly editor;
    readonly suppressMouseDown = true;
    readonly allowEditorOverflow = true;
    private readonly domNode;
    constructor(editor: ICodeEditor, keybindingService: IKeybindingService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    beforeRender(): IDimension | null;
    show(): void;
    layout(): void;
    active(): void;
    hide(): void;
}
export declare class EditorDictation extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly speechService;
    private readonly contextKeyService;
    private readonly keybindingService;
    static readonly ID = "editorDictation";
    static get(editor: ICodeEditor): EditorDictation | null;
    private readonly widget;
    private readonly editorDictationInProgress;
    private readonly sessionDisposables;
    constructor(editor: ICodeEditor, speechService: ISpeechService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    start(): Promise<void>;
    stop(): void;
}
