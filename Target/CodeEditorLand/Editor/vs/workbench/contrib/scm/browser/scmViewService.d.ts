import { Event } from '../../../../base/common/event.js';
import { ISCMViewService, ISCMRepository, ISCMService, ISCMViewVisibleRepositoryChangeEvent, ISCMMenus, ISCMRepositorySortKey } from '../common/scm.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare const RepositoryContextKeys: {
    RepositorySortKey: RawContextKey<ISCMRepositorySortKey>;
};
export interface ISCMViewServiceState {
    readonly all: string[];
    readonly sortKey: ISCMRepositorySortKey;
    readonly visible: number[];
}
export declare class SCMViewService implements ISCMViewService {
    private readonly scmService;
    private readonly editorService;
    private readonly configurationService;
    private readonly storageService;
    private readonly workspaceContextService;
    readonly _serviceBrand: undefined;
    readonly menus: ISCMMenus;
    private didFinishLoading;
    private didSelectRepository;
    private previousState;
    private readonly disposables;
    private _repositories;
    get repositories(): ISCMRepository[];
    get visibleRepositories(): ISCMRepository[];
    set visibleRepositories(visibleRepositories: ISCMRepository[]);
    private _onDidChangeRepositories;
    readonly onDidChangeRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    private _onDidSetVisibleRepositories;
    readonly onDidChangeVisibleRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    get focusedRepository(): ISCMRepository | undefined;
    private _onDidFocusRepository;
    readonly onDidFocusRepository: Event<ISCMRepository | undefined>;
    private readonly _focusedRepository;
    private readonly _activeEditor;
    private readonly _activeEditorRepository;
    /**
     * The focused repository takes precedence over the active editor repository when the observable
     * values are updated in the same transaction (or during the initial read of the observable value).
     */
    private readonly _activeRepository;
    /**
     * Derived with a custom equality function
     */
    readonly activeRepository: import("../../../../base/common/observable.js").IObservable<ISCMRepository | undefined, unknown>;
    private _repositoriesSortKey;
    private _sortKeyContextKey;
    constructor(scmService: ISCMService, contextKeyService: IContextKeyService, editorService: IEditorService, extensionService: IExtensionService, instantiationService: IInstantiationService, configurationService: IConfigurationService, storageService: IStorageService, workspaceContextService: IWorkspaceContextService);
    private onDidAddRepository;
    private onDidRemoveRepository;
    isVisible(repository: ISCMRepository): boolean;
    toggleVisibility(repository: ISCMRepository, visible?: boolean): void;
    toggleSortKey(sortKey: ISCMRepositorySortKey): void;
    focus(repository: ISCMRepository | undefined): void;
    private compareRepositories;
    private getMaxSelectionIndex;
    private getViewSortOrder;
    private insertRepositoryView;
    private onWillSaveState;
    private eventuallyFinishLoading;
    private finishLoading;
    dispose(): void;
}
