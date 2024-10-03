import { IAction } from '../../base/common/actions.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { URI } from '../../base/common/uri.js';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from '../../editor/browser/editorBrowser.js';
import { IRange } from '../../editor/common/core/range.js';
import { IEditorContribution } from '../../editor/common/editorCommon.js';
import { AbstractFloatingClickMenu, FloatingClickWidget } from '../../platform/actions/browser/floatingMenu.js';
import { IMenuService } from '../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../platform/keybinding/common/keybinding.js';
import { IEditorService } from '../services/editor/common/editorService.js';
export interface IRangeHighlightDecoration {
    resource: URI;
    range: IRange;
    isWholeLine?: boolean;
}
export declare class RangeHighlightDecorations extends Disposable {
    private readonly editorService;
    private readonly _onHighlightRemoved;
    readonly onHighlightRemoved: import("../workbench.web.main.internal.js").Event<void>;
    private rangeHighlightDecorationId;
    private editor;
    private readonly editorDisposables;
    constructor(editorService: IEditorService);
    removeHighlightRange(): void;
    highlightRange(range: IRangeHighlightDecoration, editor?: any): void;
    private doHighlightRange;
    private getEditor;
    private setEditor;
    private static readonly _WHOLE_LINE_RANGE_HIGHLIGHT;
    private static readonly _RANGE_HIGHLIGHT;
    private createRangeHighlightDecoration;
    dispose(): void;
}
export declare class FloatingEditorClickWidget extends FloatingClickWidget implements IOverlayWidget {
    private editor;
    constructor(editor: ICodeEditor, label: string, keyBindingAction: string | null, keybindingService: IKeybindingService);
    getId(): string;
    getPosition(): IOverlayWidgetPosition;
    render(): void;
    dispose(): void;
}
export declare class FloatingEditorClickMenu extends AbstractFloatingClickMenu implements IEditorContribution {
    private readonly editor;
    private readonly instantiationService;
    static readonly ID = "editor.contrib.floatingClickMenu";
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, menuService: IMenuService, contextKeyService: IContextKeyService);
    protected createWidget(action: IAction): FloatingClickWidget;
    protected isVisible(): boolean;
    protected getActionArg(): unknown;
}
