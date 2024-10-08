import './media/statusbarpart.css';
import { Disposable, DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { MultiWindowParts, Part } from '../../part.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { StatusbarAlignment, IStatusbarService, IStatusbarEntry, IStatusbarEntryAccessor, IStatusbarStyleOverride, IStatusbarEntryLocation, IStatusbarEntryPriority } from '../../../services/statusbar/browser/statusbar.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Event } from '../../../../base/common/event.js';
import { IView } from '../../../../base/browser/ui/grid/grid.js';
export interface IStatusbarEntryContainer extends IDisposable {
    /**
     * An event that is triggered when an entry's visibility is changed.
     */
    readonly onDidChangeEntryVisibility: Event<{
        id: string;
        visible: boolean;
    }>;
    /**
     * Adds an entry to the statusbar with the given alignment and priority. Use the returned accessor
     * to update or remove the statusbar entry.
     *
     * @param id identifier of the entry is needed to allow users to hide entries via settings
     * @param alignment either LEFT or RIGHT side in the status bar
     * @param priority items get arranged from highest priority to lowest priority from left to right
     * in their respective alignment slot
     */
    addEntry(entry: IStatusbarEntry, id: string, alignment: StatusbarAlignment, priority?: number | IStatusbarEntryPriority): IStatusbarEntryAccessor;
    addEntry(entry: IStatusbarEntry, id: string, alignment: StatusbarAlignment, priority?: number | IStatusbarEntryPriority | IStatusbarEntryLocation): IStatusbarEntryAccessor;
    /**
     * Adds an entry to the statusbar with the given alignment relative to another entry. Use the returned
     * accessor to update or remove the statusbar entry.
     *
     * @param id identifier of the entry is needed to allow users to hide entries via settings
     * @param alignment either LEFT or RIGHT side in the status bar
     * @param location a reference to another entry to position relative to
     */
    addEntry(entry: IStatusbarEntry, id: string, alignment: StatusbarAlignment, location?: IStatusbarEntryLocation): IStatusbarEntryAccessor;
    /**
     * Return if an entry is visible or not.
     */
    isEntryVisible(id: string): boolean;
    /**
     * Allows to update an entry's visibility with the provided ID.
     */
    updateEntryVisibility(id: string, visible: boolean): void;
    /**
     * Focused the status bar. If one of the status bar entries was focused, focuses it directly.
     */
    focus(preserveEntryFocus?: boolean): void;
    /**
     * Focuses the next status bar entry. If none focused, focuses the first.
     */
    focusNextEntry(): void;
    /**
     * Focuses the previous status bar entry. If none focused, focuses the last.
     */
    focusPreviousEntry(): void;
    /**
     *	Returns true if a status bar entry is focused.
     */
    isEntryFocused(): boolean;
    /**
     * Temporarily override statusbar style.
     */
    overrideStyle(style: IStatusbarStyleOverride): IDisposable;
}
declare class StatusbarPart extends Part implements IStatusbarEntryContainer {
    private readonly instantiationService;
    private readonly contextService;
    private readonly storageService;
    private readonly contextMenuService;
    private readonly contextKeyService;
    static readonly HEIGHT = 22;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    private styleElement;
    private pendingEntries;
    private readonly viewModel;
    readonly onDidChangeEntryVisibility: Event<{
        id: string;
        visible: boolean;
    }>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    private leftItemsContainer;
    private rightItemsContainer;
    private readonly hoverDelegate;
    private readonly compactEntriesDisposable;
    private readonly styleOverrides;
    constructor(id: string, instantiationService: IInstantiationService, themeService: IThemeService, contextService: IWorkspaceContextService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService);
    private registerListeners;
    addEntry(entry: IStatusbarEntry, id: string, alignment: StatusbarAlignment, priorityOrLocation?: number | IStatusbarEntryLocation | IStatusbarEntryPriority): IStatusbarEntryAccessor;
    private doAddPendingEntry;
    private doAddEntry;
    private doCreateStatusItem;
    private doAddOrRemoveModelEntry;
    isEntryVisible(id: string): boolean;
    updateEntryVisibility(id: string, visible: boolean): void;
    focusNextEntry(): void;
    focusPreviousEntry(): void;
    isEntryFocused(): boolean;
    focus(preserveEntryFocus?: boolean): void;
    protected createContentArea(parent: HTMLElement): HTMLElement;
    private createInitialStatusbarEntries;
    private appendStatusbarEntries;
    private appendStatusbarEntry;
    private updateCompactEntries;
    private showContextMenu;
    private getContextMenuActions;
    updateStyles(): void;
    layout(width: number, height: number, top: number, left: number): void;
    overrideStyle(style: IStatusbarStyleOverride): IDisposable;
    toJSON(): object;
    dispose(): void;
}
export declare class MainStatusbarPart extends StatusbarPart {
    constructor(instantiationService: IInstantiationService, themeService: IThemeService, contextService: IWorkspaceContextService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService);
}
export interface IAuxiliaryStatusbarPart extends IStatusbarEntryContainer, IView {
    readonly container: HTMLElement;
    readonly height: number;
}
export declare class AuxiliaryStatusbarPart extends StatusbarPart implements IAuxiliaryStatusbarPart {
    readonly container: HTMLElement;
    private static COUNTER;
    readonly height = 22;
    constructor(container: HTMLElement, instantiationService: IInstantiationService, themeService: IThemeService, contextService: IWorkspaceContextService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService);
}
export declare class StatusbarService extends MultiWindowParts<StatusbarPart> implements IStatusbarService {
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    readonly mainPart: MainStatusbarPart;
    private readonly _onDidCreateAuxiliaryStatusbarPart;
    private readonly onDidCreateAuxiliaryStatusbarPart;
    constructor(instantiationService: IInstantiationService, storageService: IStorageService, themeService: IThemeService);
    createAuxiliaryStatusbarPart(container: HTMLElement): IAuxiliaryStatusbarPart;
    createScoped(statusbarEntryContainer: IStatusbarEntryContainer, disposables: DisposableStore): IStatusbarService;
    readonly onDidChangeEntryVisibility: Event<{
        id: string;
        visible: boolean;
    }>;
    addEntry(entry: IStatusbarEntry, id: string, alignment: StatusbarAlignment, priorityOrLocation?: number | IStatusbarEntryLocation | IStatusbarEntryPriority): IStatusbarEntryAccessor;
    private doAddEntryToAllWindows;
    isEntryVisible(id: string): boolean;
    updateEntryVisibility(id: string, visible: boolean): void;
    focus(preserveEntryFocus?: boolean): void;
    focusNextEntry(): void;
    focusPreviousEntry(): void;
    isEntryFocused(): boolean;
    overrideStyle(style: IStatusbarStyleOverride): IDisposable;
}
export declare class ScopedStatusbarService extends Disposable implements IStatusbarService {
    private readonly statusbarEntryContainer;
    private readonly statusbarService;
    readonly _serviceBrand: undefined;
    constructor(statusbarEntryContainer: IStatusbarEntryContainer, statusbarService: IStatusbarService);
    createAuxiliaryStatusbarPart(container: HTMLElement): IAuxiliaryStatusbarPart;
    createScoped(statusbarEntryContainer: IStatusbarEntryContainer, disposables: DisposableStore): IStatusbarService;
    getPart(): IStatusbarEntryContainer;
    readonly onDidChangeEntryVisibility: Event<{
        id: string;
        visible: boolean;
    }>;
    addEntry(entry: IStatusbarEntry, id: string, alignment: StatusbarAlignment, priorityOrLocation?: number | IStatusbarEntryLocation | IStatusbarEntryPriority): IStatusbarEntryAccessor;
    isEntryVisible(id: string): boolean;
    updateEntryVisibility(id: string, visible: boolean): void;
    focus(preserveEntryFocus?: boolean): void;
    focusNextEntry(): void;
    focusPreviousEntry(): void;
    isEntryFocused(): boolean;
    overrideStyle(style: IStatusbarStyleOverride): IDisposable;
}
export {};
