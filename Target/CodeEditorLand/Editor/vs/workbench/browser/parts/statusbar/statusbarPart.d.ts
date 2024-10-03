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
    readonly onDidChangeEntryVisibility: Event<{
        id: string;
        visible: boolean;
    }>;
    addEntry(entry: IStatusbarEntry, id: string, alignment: StatusbarAlignment, priority?: number | IStatusbarEntryPriority): IStatusbarEntryAccessor;
    addEntry(entry: IStatusbarEntry, id: string, alignment: StatusbarAlignment, priority?: number | IStatusbarEntryPriority | IStatusbarEntryLocation): IStatusbarEntryAccessor;
    addEntry(entry: IStatusbarEntry, id: string, alignment: StatusbarAlignment, location?: IStatusbarEntryLocation): IStatusbarEntryAccessor;
    isEntryVisible(id: string): boolean;
    updateEntryVisibility(id: string, visible: boolean): void;
    focus(preserveEntryFocus?: boolean): void;
    focusNextEntry(): void;
    focusPreviousEntry(): void;
    isEntryFocused(): boolean;
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
