import { Dimension } from '../../../../base/browser/dom.js';
import { AsyncIterableObject } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor, IEditorMouseEvent } from '../../../browser/editorBrowser.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { IModelDecoration } from '../../../common/model.js';
import { BrandedService, IConstructorSignature } from '../../../../platform/instantiation/common/instantiation.js';
export interface IHoverPart {
    readonly owner: IEditorHoverParticipant;
    readonly range: Range;
    readonly forceShowAtRange?: boolean;
    readonly isBeforeContent?: boolean;
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare const enum HoverAnchorType {
    Range = 1,
    ForeignElement = 2
}
export declare class HoverRangeAnchor {
    readonly priority: number;
    readonly range: Range;
    readonly initialMousePosX: number | undefined;
    readonly initialMousePosY: number | undefined;
    readonly type = HoverAnchorType.Range;
    constructor(priority: number, range: Range, initialMousePosX: number | undefined, initialMousePosY: number | undefined);
    equals(other: HoverAnchor): boolean;
    canAdoptVisibleHover(lastAnchor: HoverAnchor, showAtPosition: Position): boolean;
}
export declare class HoverForeignElementAnchor {
    readonly priority: number;
    readonly owner: IEditorHoverParticipant;
    readonly range: Range;
    readonly initialMousePosX: number | undefined;
    readonly initialMousePosY: number | undefined;
    readonly supportsMarkerHover: boolean | undefined;
    readonly type = HoverAnchorType.ForeignElement;
    constructor(priority: number, owner: IEditorHoverParticipant, range: Range, initialMousePosX: number | undefined, initialMousePosY: number | undefined, supportsMarkerHover: boolean | undefined);
    equals(other: HoverAnchor): boolean;
    canAdoptVisibleHover(lastAnchor: HoverAnchor, showAtPosition: Position): boolean;
}
export type HoverAnchor = HoverRangeAnchor | HoverForeignElementAnchor;
export interface IEditorHoverStatusBar {
    addAction(actionOptions: {
        label: string;
        iconClass?: string;
        run: (target: HTMLElement) => void;
        commandId: string;
    }): IEditorHoverAction;
    append(element: HTMLElement): HTMLElement;
}
export interface IEditorHoverAction {
    setEnabled(enabled: boolean): void;
}
export interface IEditorHoverColorPickerWidget {
    layout(): void;
}
export interface IEditorHoverContext {
    onContentsChanged(): void;
    setMinimumDimensions?(dimensions: Dimension): void;
    hide(): void;
}
export interface IEditorHoverRenderContext extends IEditorHoverContext {
    readonly fragment: DocumentFragment;
    readonly statusBar: IEditorHoverStatusBar;
}
export interface IRenderedHoverPart<T extends IHoverPart> extends IDisposable {
    hoverPart: T;
    hoverElement: HTMLElement;
}
export interface IRenderedHoverParts<T extends IHoverPart> extends IDisposable {
    renderedHoverParts: IRenderedHoverPart<T>[];
}
export declare class RenderedHoverParts<T extends IHoverPart> implements IRenderedHoverParts<T> {
    readonly renderedHoverParts: IRenderedHoverPart<T>[];
    constructor(renderedHoverParts: IRenderedHoverPart<T>[]);
    dispose(): void;
}
export interface IEditorHoverParticipant<T extends IHoverPart = IHoverPart> {
    readonly hoverOrdinal: number;
    suggestHoverAnchor?(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): T[];
    computeAsync?(anchor: HoverAnchor, lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<T>;
    createLoadingMessage?(anchor: HoverAnchor): T | null;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: T[]): IRenderedHoverParts<T>;
    getAccessibleContent(hoverPart: T): string;
    handleResize?(): void;
}
export type IEditorHoverParticipantCtor = IConstructorSignature<IEditorHoverParticipant, [ICodeEditor]>;
export declare const HoverParticipantRegistry: {
    _participants: IEditorHoverParticipantCtor[];
    register<Services extends BrandedService[]>(ctor: {
        new (editor: ICodeEditor, ...services: Services): IEditorHoverParticipant;
    }): void;
    getAll(): IEditorHoverParticipantCtor[];
};
export interface IHoverWidget {
    showsOrWillShow(mouseEvent: IEditorMouseEvent): boolean;
    hide(): void;
}
