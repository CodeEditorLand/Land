/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../base/common/event.js';
import { SCMInputChangeReason } from './scm.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { HistoryNavigator2 } from '../../../../base/common/history.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { URI } from '../../../../base/common/uri.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { Schemas } from '../../../../base/common/network.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
class SCMInput extends Disposable {
    get value() {
        return this._value;
    }
    get placeholder() {
        return this._placeholder;
    }
    set placeholder(placeholder) {
        this._placeholder = placeholder;
        this._onDidChangePlaceholder.fire(placeholder);
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(enabled) {
        this._enabled = enabled;
        this._onDidChangeEnablement.fire(enabled);
    }
    get visible() {
        return this._visible;
    }
    set visible(visible) {
        this._visible = visible;
        this._onDidChangeVisibility.fire(visible);
    }
    setFocus() {
        this._onDidChangeFocus.fire();
    }
    showValidationMessage(message, type) {
        this._onDidChangeValidationMessage.fire({ message: message, type: type });
    }
    get validateInput() {
        return this._validateInput;
    }
    set validateInput(validateInput) {
        this._validateInput = validateInput;
        this._onDidChangeValidateInput.fire();
    }
    constructor(repository, history) {
        super();
        this.repository = repository;
        this.history = history;
        this._value = '';
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._placeholder = '';
        this._onDidChangePlaceholder = new Emitter();
        this.onDidChangePlaceholder = this._onDidChangePlaceholder.event;
        this._enabled = true;
        this._onDidChangeEnablement = new Emitter();
        this.onDidChangeEnablement = this._onDidChangeEnablement.event;
        this._visible = true;
        this._onDidChangeVisibility = new Emitter();
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        this._onDidChangeFocus = new Emitter();
        this.onDidChangeFocus = this._onDidChangeFocus.event;
        this._onDidChangeValidationMessage = new Emitter();
        this.onDidChangeValidationMessage = this._onDidChangeValidationMessage.event;
        this._validateInput = () => Promise.resolve(undefined);
        this._onDidChangeValidateInput = new Emitter();
        this.onDidChangeValidateInput = this._onDidChangeValidateInput.event;
        this.didChangeHistory = false;
        if (this.repository.provider.rootUri) {
            this.historyNavigator = history.getHistory(this.repository.provider.label, this.repository.provider.rootUri);
            this._register(this.history.onWillSaveHistory(event => {
                if (this.historyNavigator.isAtEnd()) {
                    this.saveValue();
                }
                if (this.didChangeHistory) {
                    event.historyDidIndeedChange();
                }
                this.didChangeHistory = false;
            }));
        }
        else { // in memory only
            this.historyNavigator = new HistoryNavigator2([''], 100);
        }
        this._value = this.historyNavigator.current();
    }
    setValue(value, transient, reason) {
        if (value === this._value) {
            return;
        }
        if (!transient) {
            this.historyNavigator.replaceLast(this._value);
            this.historyNavigator.add(value);
            this.didChangeHistory = true;
        }
        this._value = value;
        this._onDidChange.fire({ value, reason });
    }
    showNextHistoryValue() {
        if (this.historyNavigator.isAtEnd()) {
            return;
        }
        else if (!this.historyNavigator.has(this.value)) {
            this.saveValue();
            this.historyNavigator.resetCursor();
        }
        const value = this.historyNavigator.next();
        this.setValue(value, true, SCMInputChangeReason.HistoryNext);
    }
    showPreviousHistoryValue() {
        if (this.historyNavigator.isAtEnd()) {
            this.saveValue();
        }
        else if (!this.historyNavigator.has(this._value)) {
            this.saveValue();
            this.historyNavigator.resetCursor();
        }
        const value = this.historyNavigator.previous();
        this.setValue(value, true, SCMInputChangeReason.HistoryPrevious);
    }
    saveValue() {
        const oldValue = this.historyNavigator.replaceLast(this._value);
        this.didChangeHistory = this.didChangeHistory || (oldValue !== this._value);
    }
}
class SCMRepository {
    get selected() {
        return this._selected;
    }
    constructor(id, provider, disposable, inputHistory) {
        this.id = id;
        this.provider = provider;
        this.disposable = disposable;
        this._selected = false;
        this._onDidChangeSelection = new Emitter();
        this.onDidChangeSelection = this._onDidChangeSelection.event;
        this.input = new SCMInput(this, inputHistory);
    }
    setSelected(selected) {
        if (this._selected === selected) {
            return;
        }
        this._selected = selected;
        this._onDidChangeSelection.fire(selected);
    }
    dispose() {
        this.disposable.dispose();
        this.provider.dispose();
    }
}
class WillSaveHistoryEvent {
    constructor() {
        this._didChangeHistory = false;
    }
    get didChangeHistory() { return this._didChangeHistory; }
    historyDidIndeedChange() { this._didChangeHistory = true; }
}
let SCMInputHistory = class SCMInputHistory {
    constructor(storageService, workspaceContextService) {
        this.storageService = storageService;
        this.workspaceContextService = workspaceContextService;
        this.disposables = new DisposableStore();
        this.histories = new Map();
        this._onWillSaveHistory = this.disposables.add(new Emitter());
        this.onWillSaveHistory = this._onWillSaveHistory.event;
        this.histories = new Map();
        const entries = this.storageService.getObject('scm.history', 1 /* StorageScope.WORKSPACE */, []);
        for (const [providerLabel, rootUri, history] of entries) {
            let providerHistories = this.histories.get(providerLabel);
            if (!providerHistories) {
                providerHistories = new ResourceMap();
                this.histories.set(providerLabel, providerHistories);
            }
            providerHistories.set(rootUri, new HistoryNavigator2(history, 100));
        }
        if (this.migrateStorage()) {
            this.saveToStorage();
        }
        this.disposables.add(this.storageService.onDidChangeValue(1 /* StorageScope.WORKSPACE */, 'scm.history', this.disposables)(e => {
            if (e.external && e.key === 'scm.history') {
                const raw = this.storageService.getObject('scm.history', 1 /* StorageScope.WORKSPACE */, []);
                for (const [providerLabel, uri, rawHistory] of raw) {
                    const history = this.getHistory(providerLabel, uri);
                    for (const value of Iterable.reverse(rawHistory)) {
                        history.prepend(value);
                    }
                }
            }
        }));
        this.disposables.add(this.storageService.onWillSaveState(_ => {
            const event = new WillSaveHistoryEvent();
            this._onWillSaveHistory.fire(event);
            if (event.didChangeHistory) {
                this.saveToStorage();
            }
        }));
    }
    saveToStorage() {
        const raw = [];
        for (const [providerLabel, providerHistories] of this.histories) {
            for (const [rootUri, history] of providerHistories) {
                if (!(history.size === 1 && history.current() === '')) {
                    raw.push([providerLabel, rootUri, [...history]]);
                }
            }
        }
        this.storageService.store('scm.history', raw, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
    }
    getHistory(providerLabel, rootUri) {
        let providerHistories = this.histories.get(providerLabel);
        if (!providerHistories) {
            providerHistories = new ResourceMap();
            this.histories.set(providerLabel, providerHistories);
        }
        let history = providerHistories.get(rootUri);
        if (!history) {
            history = new HistoryNavigator2([''], 100);
            providerHistories.set(rootUri, history);
        }
        return history;
    }
    // Migrates from Application scope storage to Workspace scope.
    // TODO@joaomoreno: Change from January 2024 onwards such that the only code is to remove all `scm/input:` storage keys
    migrateStorage() {
        let didSomethingChange = false;
        const machineKeys = Iterable.filter(this.storageService.keys(-1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */), key => key.startsWith('scm/input:'));
        for (const key of machineKeys) {
            try {
                const legacyHistory = JSON.parse(this.storageService.get(key, -1 /* StorageScope.APPLICATION */, ''));
                const match = /^scm\/input:([^:]+):(.+)$/.exec(key);
                if (!match || !Array.isArray(legacyHistory?.history) || !Number.isInteger(legacyHistory?.timestamp)) {
                    this.storageService.remove(key, -1 /* StorageScope.APPLICATION */);
                    continue;
                }
                const [, providerLabel, rootPath] = match;
                const rootUri = URI.file(rootPath);
                if (this.workspaceContextService.getWorkspaceFolder(rootUri)) {
                    const history = this.getHistory(providerLabel, rootUri);
                    for (const entry of Iterable.reverse(legacyHistory.history)) {
                        history.prepend(entry);
                    }
                    didSomethingChange = true;
                    this.storageService.remove(key, -1 /* StorageScope.APPLICATION */);
                }
            }
            catch {
                this.storageService.remove(key, -1 /* StorageScope.APPLICATION */);
            }
        }
        return didSomethingChange;
    }
    dispose() {
        this.disposables.dispose();
    }
};
SCMInputHistory = __decorate([
    __param(0, IStorageService),
    __param(1, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object])
], SCMInputHistory);
let SCMService = class SCMService {
    get repositories() { return this._repositories.values(); }
    get repositoryCount() { return this._repositories.size; }
    constructor(logService, workspaceContextService, contextKeyService, storageService, uriIdentityService) {
        this.logService = logService;
        this.uriIdentityService = uriIdentityService;
        this._repositories = new Map(); // used in tests
        this._onDidAddProvider = new Emitter();
        this.onDidAddRepository = this._onDidAddProvider.event;
        this._onDidRemoveProvider = new Emitter();
        this.onDidRemoveRepository = this._onDidRemoveProvider.event;
        this.inputHistory = new SCMInputHistory(storageService, workspaceContextService);
        this.providerCount = contextKeyService.createKey('scm.providerCount', 0);
    }
    registerSCMProvider(provider) {
        this.logService.trace('SCMService#registerSCMProvider');
        if (this._repositories.has(provider.id)) {
            throw new Error(`SCM Provider ${provider.id} already exists.`);
        }
        const disposable = toDisposable(() => {
            this._repositories.delete(provider.id);
            this._onDidRemoveProvider.fire(repository);
            this.providerCount.set(this._repositories.size);
        });
        const repository = new SCMRepository(provider.id, provider, disposable, this.inputHistory);
        this._repositories.set(provider.id, repository);
        this._onDidAddProvider.fire(repository);
        this.providerCount.set(this._repositories.size);
        return repository;
    }
    getRepository(idOrResource) {
        if (typeof idOrResource === 'string') {
            return this._repositories.get(idOrResource);
        }
        if (idOrResource.scheme !== Schemas.file &&
            idOrResource.scheme !== Schemas.vscodeRemote) {
            return undefined;
        }
        let bestRepository = undefined;
        let bestMatchLength = Number.POSITIVE_INFINITY;
        for (const repository of this.repositories) {
            const root = repository.provider.rootUri;
            if (!root) {
                continue;
            }
            const path = this.uriIdentityService.extUri.relativePath(root, idOrResource);
            if (path && !/^\.\./.test(path) && path.length < bestMatchLength) {
                bestRepository = repository;
                bestMatchLength = path.length;
            }
        }
        return bestRepository;
    }
};
SCMService = __decorate([
    __param(0, ILogService),
    __param(1, IWorkspaceContextService),
    __param(2, IContextKeyService),
    __param(3, IStorageService),
    __param(4, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], SCMService);
export { SCMService };
