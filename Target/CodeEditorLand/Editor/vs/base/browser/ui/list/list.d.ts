import { IDragAndDropData } from '../../dnd.js';
import { IKeyboardEvent } from '../../keyboardEvent.js';
import { IMouseEvent } from '../../mouseEvent.js';
import { GestureEvent } from '../../touch.js';
import { ListViewTargetSector } from './listView.js';
import { IDisposable } from '../../../common/lifecycle.js';
export interface IListVirtualDelegate<T> {
    getHeight(element: T): number;
    getTemplateId(element: T): string;
    hasDynamicHeight?(element: T): boolean;
    getDynamicHeight?(element: T): number | null;
    setDynamicHeight?(element: T, height: number): void;
}
export interface IListRenderer<T, TTemplateData> {
    readonly templateId: string;
    renderTemplate(container: HTMLElement): TTemplateData;
    renderElement(element: T, index: number, templateData: TTemplateData, height: number | undefined): void;
    disposeElement?(element: T, index: number, templateData: TTemplateData, height: number | undefined): void;
    disposeTemplate(templateData: TTemplateData): void;
}
export interface IListEvent<T> {
    readonly elements: readonly T[];
    readonly indexes: readonly number[];
    readonly browserEvent?: UIEvent;
}
export interface IListBrowserMouseEvent extends MouseEvent {
    isHandledByList?: boolean;
}
export interface IListMouseEvent<T> {
    readonly browserEvent: IListBrowserMouseEvent;
    readonly element: T | undefined;
    readonly index: number | undefined;
}
export interface IListTouchEvent<T> {
    readonly browserEvent: TouchEvent;
    readonly element: T | undefined;
    readonly index: number | undefined;
}
export interface IListGestureEvent<T> {
    readonly browserEvent: GestureEvent;
    readonly element: T | undefined;
    readonly index: number | undefined;
}
export interface IListDragEvent<T> {
    readonly browserEvent: DragEvent;
    readonly element: T | undefined;
    readonly index: number | undefined;
    readonly sector: ListViewTargetSector | undefined;
}
export interface IListContextMenuEvent<T> {
    readonly browserEvent: UIEvent;
    readonly element: T | undefined;
    readonly index: number | undefined;
    readonly anchor: HTMLElement | IMouseEvent;
}
export interface IIdentityProvider<T> {
    getId(element: T): {
        toString(): string;
    };
}
export interface IKeyboardNavigationLabelProvider<T> {
    getKeyboardNavigationLabel(element: T): {
        toString(): string | undefined;
    } | {
        toString(): string | undefined;
    }[] | undefined;
}
export interface IKeyboardNavigationDelegate {
    mightProducePrintableCharacter(event: IKeyboardEvent): boolean;
}
export declare const enum ListDragOverEffectType {
    Copy = 0,
    Move = 1
}
export declare const enum ListDragOverEffectPosition {
    Over = "drop-target",
    Before = "drop-target-before",
    After = "drop-target-after"
}
export interface ListDragOverEffect {
    type: ListDragOverEffectType;
    position?: ListDragOverEffectPosition;
}
export interface IListDragOverReaction {
    accept: boolean;
    effect?: ListDragOverEffect;
    feedback?: number[];
}
export declare const ListDragOverReactions: {
    reject(): IListDragOverReaction;
    accept(): IListDragOverReaction;
};
export interface IListDragAndDrop<T> extends IDisposable {
    getDragURI(element: T): string | null;
    getDragLabel?(elements: T[], originalEvent: DragEvent): string | undefined;
    onDragStart?(data: IDragAndDropData, originalEvent: DragEvent): void;
    onDragOver(data: IDragAndDropData, targetElement: T | undefined, targetIndex: number | undefined, targetSector: ListViewTargetSector | undefined, originalEvent: DragEvent): boolean | IListDragOverReaction;
    onDragLeave?(data: IDragAndDropData, targetElement: T | undefined, targetIndex: number | undefined, originalEvent: DragEvent): void;
    drop(data: IDragAndDropData, targetElement: T | undefined, targetIndex: number | undefined, targetSector: ListViewTargetSector | undefined, originalEvent: DragEvent): void;
    onDragEnd?(originalEvent: DragEvent): void;
}
export declare class ListError extends Error {
    constructor(user: string, message: string);
}
export declare abstract class CachedListVirtualDelegate<T extends object> implements IListVirtualDelegate<T> {
    private cache;
    getHeight(element: T): number;
    protected abstract estimateHeight(element: T): number;
    abstract getTemplateId(element: T): string;
    setDynamicHeight(element: T, height: number): void;
}
