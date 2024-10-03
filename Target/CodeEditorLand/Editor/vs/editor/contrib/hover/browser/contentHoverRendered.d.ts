import { IEditorHoverContext, IEditorHoverParticipant, IHoverPart } from './hoverTypes.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { HoverStartSource } from './hoverOperation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { ContentHoverResult } from './contentHoverTypes.js';
import { HoverVerbosityAction } from '../../../common/languages.js';
export declare class RenderedContentHover extends Disposable {
    closestMouseDistance: number | undefined;
    initialMousePosX: number | undefined;
    initialMousePosY: number | undefined;
    readonly showAtPosition: Position;
    readonly showAtSecondaryPosition: Position;
    readonly shouldFocus: boolean;
    readonly source: HoverStartSource;
    readonly shouldAppearBeforeContent: boolean;
    private readonly _renderedHoverParts;
    constructor(editor: ICodeEditor, hoverResult: ContentHoverResult, participants: IEditorHoverParticipant<IHoverPart>[], context: IEditorHoverContext, keybindingService: IKeybindingService);
    get domNode(): DocumentFragment;
    get domNodeHasChildren(): boolean;
    get focusedHoverPartIndex(): number;
    focusHoverPartWithIndex(index: number): void;
    getAccessibleWidgetContent(): string;
    getAccessibleWidgetContentAtIndex(index: number): string;
    updateHoverVerbosityLevel(action: HoverVerbosityAction, index: number, focus?: boolean): Promise<void>;
    doesHoverAtIndexSupportVerbosityAction(index: number, action: HoverVerbosityAction): boolean;
    isColorPickerVisible(): boolean;
    static computeHoverPositions(editor: ICodeEditor, anchorRange: Range, hoverParts: IHoverPart[]): {
        showAtPosition: Position;
        showAtSecondaryPosition: Position;
    };
}
