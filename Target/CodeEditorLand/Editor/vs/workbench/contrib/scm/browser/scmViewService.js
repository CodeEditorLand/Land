var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { ISCMService } from '../common/scm.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { SCMMenus } from './menus.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { debounce } from '../../../../base/common/decorators.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { compareFileNames, comparePaths } from '../../../../base/common/comparers.js';
import { basename } from '../../../../base/common/resources.js';
import { binarySearch } from '../../../../base/common/arrays.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { derivedObservableWithCache, latestChangedValue, observableFromEventOpts } from '../../../../base/common/observable.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { EditorResourceAccessor } from '../../../common/editor.js';
function getProviderStorageKey(provider) {
    return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ''}`;
}
function getRepositoryName(workspaceContextService, repository) {
    if (!repository.provider.rootUri) {
        return repository.provider.label;
    }
    const folder = workspaceContextService.getWorkspaceFolder(repository.provider.rootUri);
    return folder?.uri.toString() === repository.provider.rootUri.toString() ? folder.name : basename(repository.provider.rootUri);
}
export const RepositoryContextKeys = {
    RepositorySortKey: new RawContextKey('scmRepositorySortKey', "discoveryTime"),
};
let SCMViewService = class SCMViewService {
    get repositories() {
        return this._repositories.map(r => r.repository);
    }
    get visibleRepositories() {
        if (this._repositoriesSortKey === "discoveryTime") {
            return this._repositories.filter(r => r.selectionIndex !== -1)
                .sort((r1, r2) => r1.selectionIndex - r2.selectionIndex)
                .map(r => r.repository);
        }
        return this._repositories
            .filter(r => r.selectionIndex !== -1)
            .map(r => r.repository);
    }
    set visibleRepositories(visibleRepositories) {
        const set = new Set(visibleRepositories);
        const added = new Set();
        const removed = new Set();
        for (const repositoryView of this._repositories) {
            if (!set.has(repositoryView.repository) && repositoryView.selectionIndex !== -1) {
                repositoryView.selectionIndex = -1;
                removed.add(repositoryView.repository);
            }
            if (set.has(repositoryView.repository)) {
                if (repositoryView.selectionIndex === -1) {
                    added.add(repositoryView.repository);
                }
                repositoryView.selectionIndex = visibleRepositories.indexOf(repositoryView.repository);
            }
        }
        if (added.size === 0 && removed.size === 0) {
            return;
        }
        this._onDidSetVisibleRepositories.fire({ added, removed });
        if (this._repositories.find(r => r.focused && r.selectionIndex === -1)) {
            this.focus(this._repositories.find(r => r.selectionIndex !== -1)?.repository);
        }
    }
    get focusedRepository() {
        return this._repositories.find(r => r.focused)?.repository;
    }
    constructor(scmService, contextKeyService, editorService, extensionService, instantiationService, configurationService, storageService, workspaceContextService) {
        this.scmService = scmService;
        this.editorService = editorService;
        this.configurationService = configurationService;
        this.storageService = storageService;
        this.workspaceContextService = workspaceContextService;
        this.didFinishLoading = false;
        this.didSelectRepository = false;
        this.disposables = new DisposableStore();
        this._repositories = [];
        this._onDidChangeRepositories = new Emitter();
        this.onDidChangeRepositories = this._onDidChangeRepositories.event;
        this._onDidSetVisibleRepositories = new Emitter();
        this.onDidChangeVisibleRepositories = Event.any(this._onDidSetVisibleRepositories.event, Event.debounce(this._onDidChangeRepositories.event, (last, e) => {
            if (!last) {
                return e;
            }
            const added = new Set(last.added);
            const removed = new Set(last.removed);
            for (const repository of e.added) {
                if (removed.has(repository)) {
                    removed.delete(repository);
                }
                else {
                    added.add(repository);
                }
            }
            for (const repository of e.removed) {
                if (added.has(repository)) {
                    added.delete(repository);
                }
                else {
                    removed.add(repository);
                }
            }
            return { added, removed };
        }, 0, undefined, undefined, undefined, this.disposables));
        this._onDidFocusRepository = new Emitter();
        this.onDidFocusRepository = this._onDidFocusRepository.event;
        this._focusedRepository = observableFromEventOpts({ owner: this, equalsFn: () => false }, this.onDidFocusRepository, () => this.focusedRepository);
        this._activeEditor = observableFromEventOpts({ owner: this, equalsFn: () => false }, this.editorService.onDidActiveEditorChange, () => this.editorService.activeEditor);
        this._activeEditorRepository = derivedObservableWithCache(this, (reader, lastValue) => {
            const activeResource = EditorResourceAccessor.getOriginalUri(this._activeEditor.read(reader));
            if (!activeResource) {
                return lastValue;
            }
            const repository = this.scmService.getRepository(activeResource);
            if (!repository) {
                return lastValue;
            }
            return Object.create(repository);
        });
        this.activeRepository = latestChangedValue(this, [this._activeEditorRepository, this._focusedRepository]);
        this.menus = instantiationService.createInstance(SCMMenus);
        try {
            this.previousState = JSON.parse(storageService.get('scm:view:visibleRepositories', 1, ''));
        }
        catch {
        }
        this._repositoriesSortKey = this.previousState?.sortKey ?? this.getViewSortOrder();
        this._sortKeyContextKey = RepositoryContextKeys.RepositorySortKey.bindTo(contextKeyService);
        this._sortKeyContextKey.set(this._repositoriesSortKey);
        scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
        scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
        for (const repository of scmService.repositories) {
            this.onDidAddRepository(repository);
        }
        storageService.onWillSaveState(this.onWillSaveState, this, this.disposables);
        extensionService.onWillStop(() => {
            this.onWillSaveState();
            this.didFinishLoading = false;
        }, this, this.disposables);
    }
    onDidAddRepository(repository) {
        if (!this.didFinishLoading) {
            this.eventuallyFinishLoading();
        }
        const repositoryView = {
            repository, discoveryTime: Date.now(), focused: false, selectionIndex: -1
        };
        let removed = Iterable.empty();
        if (this.previousState && !this.didFinishLoading) {
            const index = this.previousState.all.indexOf(getProviderStorageKey(repository.provider));
            if (index === -1) {
                const added = [];
                this.insertRepositoryView(this._repositories, repositoryView);
                this._repositories.forEach((repositoryView, index) => {
                    if (repositoryView.selectionIndex === -1) {
                        added.push(repositoryView.repository);
                    }
                    repositoryView.selectionIndex = index;
                });
                this._onDidChangeRepositories.fire({ added, removed: Iterable.empty() });
                this.didSelectRepository = false;
                return;
            }
            if (this.previousState.visible.indexOf(index) === -1) {
                if (this.didSelectRepository) {
                    this.insertRepositoryView(this._repositories, repositoryView);
                    this._onDidChangeRepositories.fire({ added: Iterable.empty(), removed: Iterable.empty() });
                    return;
                }
            }
            else {
                if (!this.didSelectRepository) {
                    removed = [...this.visibleRepositories];
                    this._repositories.forEach(r => {
                        r.focused = false;
                        r.selectionIndex = -1;
                    });
                    this.didSelectRepository = true;
                }
            }
        }
        const maxSelectionIndex = this.getMaxSelectionIndex();
        this.insertRepositoryView(this._repositories, { ...repositoryView, selectionIndex: maxSelectionIndex + 1 });
        this._onDidChangeRepositories.fire({ added: [repositoryView.repository], removed });
        if (!this._repositories.find(r => r.focused)) {
            this.focus(repository);
        }
    }
    onDidRemoveRepository(repository) {
        if (!this.didFinishLoading) {
            this.eventuallyFinishLoading();
        }
        const repositoriesIndex = this._repositories.findIndex(r => r.repository === repository);
        if (repositoriesIndex === -1) {
            return;
        }
        let added = Iterable.empty();
        const repositoryView = this._repositories.splice(repositoriesIndex, 1);
        if (this._repositories.length > 0 && this.visibleRepositories.length === 0) {
            this._repositories[0].selectionIndex = 0;
            added = [this._repositories[0].repository];
        }
        this._onDidChangeRepositories.fire({ added, removed: repositoryView.map(r => r.repository) });
        if (repositoryView.length === 1 && repositoryView[0].focused && this.visibleRepositories.length > 0) {
            this.focus(this.visibleRepositories[0]);
        }
    }
    isVisible(repository) {
        return this._repositories.find(r => r.repository === repository)?.selectionIndex !== -1;
    }
    toggleVisibility(repository, visible) {
        if (typeof visible === 'undefined') {
            visible = !this.isVisible(repository);
        }
        else if (this.isVisible(repository) === visible) {
            return;
        }
        if (visible) {
            this.visibleRepositories = [...this.visibleRepositories, repository];
        }
        else {
            const index = this.visibleRepositories.indexOf(repository);
            if (index > -1) {
                this.visibleRepositories = [
                    ...this.visibleRepositories.slice(0, index),
                    ...this.visibleRepositories.slice(index + 1)
                ];
            }
        }
    }
    toggleSortKey(sortKey) {
        this._repositoriesSortKey = sortKey;
        this._sortKeyContextKey.set(this._repositoriesSortKey);
        this._repositories.sort(this.compareRepositories.bind(this));
        this._onDidChangeRepositories.fire({ added: Iterable.empty(), removed: Iterable.empty() });
    }
    focus(repository) {
        if (repository && !this.isVisible(repository)) {
            return;
        }
        this._repositories.forEach(r => r.focused = r.repository === repository);
        if (this._repositories.find(r => r.focused)) {
            this._onDidFocusRepository.fire(repository);
        }
    }
    compareRepositories(op1, op2) {
        if (this._repositoriesSortKey === "discoveryTime") {
            return op1.discoveryTime - op2.discoveryTime;
        }
        if (this._repositoriesSortKey === 'path' && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
            return comparePaths(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
        }
        const name1 = getRepositoryName(this.workspaceContextService, op1.repository);
        const name2 = getRepositoryName(this.workspaceContextService, op2.repository);
        const nameComparison = compareFileNames(name1, name2);
        if (nameComparison === 0 && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
            return comparePaths(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
        }
        return nameComparison;
    }
    getMaxSelectionIndex() {
        return this._repositories.length === 0 ? -1 :
            Math.max(...this._repositories.map(r => r.selectionIndex));
    }
    getViewSortOrder() {
        const sortOder = this.configurationService.getValue('scm.repositories.sortOrder');
        switch (sortOder) {
            case 'discovery time':
                return "discoveryTime";
            case 'name':
                return "name";
            case 'path':
                return "path";
            default:
                return "discoveryTime";
        }
    }
    insertRepositoryView(repositories, repositoryView) {
        const index = binarySearch(repositories, repositoryView, this.compareRepositories.bind(this));
        repositories.splice(index < 0 ? ~index : index, 0, repositoryView);
    }
    onWillSaveState() {
        if (!this.didFinishLoading) {
            return;
        }
        const all = this.repositories.map(r => getProviderStorageKey(r.provider));
        const visible = this.visibleRepositories.map(r => all.indexOf(getProviderStorageKey(r.provider)));
        this.previousState = { all, sortKey: this._repositoriesSortKey, visible };
        this.storageService.store('scm:view:visibleRepositories', JSON.stringify(this.previousState), 1, 1);
    }
    eventuallyFinishLoading() {
        this.finishLoading();
    }
    finishLoading() {
        if (this.didFinishLoading) {
            return;
        }
        this.didFinishLoading = true;
    }
    dispose() {
        this.disposables.dispose();
        this._onDidChangeRepositories.dispose();
        this._onDidSetVisibleRepositories.dispose();
    }
};
__decorate([
    debounce(5000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SCMViewService.prototype, "eventuallyFinishLoading", null);
SCMViewService = __decorate([
    __param(0, ISCMService),
    __param(1, IContextKeyService),
    __param(2, IEditorService),
    __param(3, IExtensionService),
    __param(4, IInstantiationService),
    __param(5, IConfigurationService),
    __param(6, IStorageService),
    __param(7, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], SCMViewService);
export { SCMViewService };
