import './media/part.css';
import { Component } from '../common/component.js';
import { IThemeService, IColorTheme } from '../../platform/theme/common/themeService.js';
import { Dimension, IDimension, IDomPosition } from '../../base/browser/dom.js';
import { IStorageService } from '../../platform/storage/common/storage.js';
import { ISerializableView, IViewSize } from '../../base/browser/ui/grid/grid.js';
import { Event, Emitter } from '../../base/common/event.js';
import { IWorkbenchLayoutService } from '../services/layout/browser/layoutService.js';
import { IDisposable } from '../../base/common/lifecycle.js';
export interface IPartOptions {
    readonly hasTitle?: boolean;
    readonly borderWidth?: () => number;
}
export interface ILayoutContentResult {
    readonly headerSize: IDimension;
    readonly titleSize: IDimension;
    readonly contentSize: IDimension;
    readonly footerSize: IDimension;
}
/**
 * Parts are layed out in the workbench and have their own layout that
 * arranges an optional title and mandatory content area to show content.
 */
export declare abstract class Part extends Component implements ISerializableView {
    private options;
    protected readonly layoutService: IWorkbenchLayoutService;
    private _dimension;
    get dimension(): Dimension | undefined;
    private _contentPosition;
    get contentPosition(): IDomPosition | undefined;
    protected _onDidVisibilityChange: Emitter<boolean>;
    readonly onDidVisibilityChange: Event<boolean>;
    private parent;
    private headerArea;
    private titleArea;
    private contentArea;
    private footerArea;
    private partLayout;
    constructor(id: string, options: IPartOptions, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService);
    protected onThemeChange(theme: IColorTheme): void;
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Called to create title and content area of the part.
     */
    create(parent: HTMLElement, options?: object): void;
    /**
     * Returns the overall part container.
     */
    getContainer(): HTMLElement | undefined;
    /**
     * Subclasses override to provide a title area implementation.
     */
    protected createTitleArea(parent: HTMLElement, options?: object): HTMLElement | undefined;
    /**
     * Returns the title area container.
     */
    protected getTitleArea(): HTMLElement | undefined;
    /**
     * Subclasses override to provide a content area implementation.
     */
    protected createContentArea(parent: HTMLElement, options?: object): HTMLElement | undefined;
    /**
     * Returns the content area container.
     */
    protected getContentArea(): HTMLElement | undefined;
    /**
     * Sets the header area
     */
    protected setHeaderArea(headerContainer: HTMLElement): void;
    /**
     * Sets the footer area
     */
    protected setFooterArea(footerContainer: HTMLElement): void;
    /**
     * removes the header area
     */
    protected removeHeaderArea(): void;
    /**
     * removes the footer area
     */
    protected removeFooterArea(): void;
    private relayout;
    /**
     * Layout title and content area in the given dimension.
     */
    protected layoutContents(width: number, height: number): ILayoutContentResult;
    protected _onDidChange: Emitter<IViewSize | undefined>;
    get onDidChange(): Event<IViewSize | undefined>;
    element: HTMLElement;
    abstract minimumWidth: number;
    abstract maximumWidth: number;
    abstract minimumHeight: number;
    abstract maximumHeight: number;
    layout(width: number, height: number, top: number, left: number): void;
    setVisible(visible: boolean): void;
    abstract toJSON(): object;
}
export interface IMultiWindowPart {
    readonly element: HTMLElement;
}
export declare abstract class MultiWindowParts<T extends IMultiWindowPart> extends Component {
    protected readonly _parts: Set<T>;
    get parts(): T[];
    abstract readonly mainPart: T;
    registerPart(part: T): IDisposable;
    protected unregisterPart(part: T): void;
    getPart(container: HTMLElement): T;
    protected getPartByDocument(document: Document): T;
    get activePart(): T;
}
