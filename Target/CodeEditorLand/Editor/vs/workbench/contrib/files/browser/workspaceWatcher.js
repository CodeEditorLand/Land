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
import { localize } from '../../../../nls.js';
import { Disposable, dispose, DisposableStore } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { INotificationService, Severity, NeverShowAgainScope, NotificationPriority } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { isAbsolute } from '../../../../base/common/path.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
let WorkspaceWatcher = class WorkspaceWatcher extends Disposable {
    static { this.ID = 'workbench.contrib.workspaceWatcher'; }
    constructor(fileService, configurationService, contextService, notificationService, openerService, uriIdentityService, hostService, telemetryService) {
        super();
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.contextService = contextService;
        this.notificationService = notificationService;
        this.openerService = openerService;
        this.uriIdentityService = uriIdentityService;
        this.hostService = hostService;
        this.telemetryService = telemetryService;
        this.watchedWorkspaces = new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource));
        this.registerListeners();
        this.refresh();
    }
    registerListeners() {
        this._register(this.contextService.onDidChangeWorkspaceFolders(e => this.onDidChangeWorkspaceFolders(e)));
        this._register(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onDidChangeConfiguration(e)));
        this._register(this.fileService.onDidWatchError(error => this.onDidWatchError(error)));
    }
    onDidChangeWorkspaceFolders(e) {
        for (const removed of e.removed) {
            this.unwatchWorkspace(removed);
        }
        for (const added of e.added) {
            this.watchWorkspace(added);
        }
    }
    onDidChangeWorkbenchState() {
        this.refresh();
    }
    onDidChangeConfiguration(e) {
        if (e.affectsConfiguration('files.watcherExclude') || e.affectsConfiguration('files.watcherInclude')) {
            this.refresh();
        }
    }
    onDidWatchError(error) {
        const msg = error.toString();
        let reason = undefined;
        if (msg.indexOf('ENOSPC') >= 0) {
            reason = 'ENOSPC';
            this.notificationService.prompt(Severity.Warning, localize('enospcError', "Unable to watch for file changes. Please follow the instructions link to resolve this issue."), [{
                    label: localize('learnMore', "Instructions"),
                    run: () => this.openerService.open(URI.parse('https://go.microsoft.com/fwlink/?linkid=867693'))
                }], {
                sticky: true,
                neverShowAgain: { id: 'ignoreEnospcError', isSecondary: true, scope: NeverShowAgainScope.WORKSPACE }
            });
        }
        else if (msg.indexOf('EUNKNOWN') >= 0) {
            reason = 'EUNKNOWN';
            this.notificationService.prompt(Severity.Warning, localize('eshutdownError', "File changes watcher stopped unexpectedly. A reload of the window may enable the watcher again unless the workspace cannot be watched for file changes."), [{
                    label: localize('reload', "Reload"),
                    run: () => this.hostService.reload()
                }], {
                sticky: true,
                priority: NotificationPriority.SILENT
            });
        }
        else if (msg.indexOf('ETERM') >= 0) {
            reason = 'ETERM';
        }
        if (reason) {
            this.telemetryService.publicLog2('fileWatcherError', { reason });
        }
    }
    watchWorkspace(workspace) {
        const excludes = [];
        const config = this.configurationService.getValue({ resource: workspace.uri });
        if (config.files?.watcherExclude) {
            for (const key in config.files.watcherExclude) {
                if (key && config.files.watcherExclude[key] === true) {
                    excludes.push(key);
                }
            }
        }
        const pathsToWatch = new ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
        pathsToWatch.set(workspace.uri, workspace.uri);
        if (config.files?.watcherInclude) {
            for (const includePath of config.files.watcherInclude) {
                if (!includePath) {
                    continue;
                }
                if (isAbsolute(includePath)) {
                    const candidate = URI.file(includePath).with({ scheme: workspace.uri.scheme });
                    if (this.uriIdentityService.extUri.isEqualOrParent(candidate, workspace.uri)) {
                        pathsToWatch.set(candidate, candidate);
                    }
                }
                else {
                    const candidate = workspace.toResource(includePath);
                    pathsToWatch.set(candidate, candidate);
                }
            }
        }
        const disposables = new DisposableStore();
        for (const [, pathToWatch] of pathsToWatch) {
            disposables.add(this.fileService.watch(pathToWatch, { recursive: true, excludes }));
        }
        this.watchedWorkspaces.set(workspace.uri, disposables);
    }
    unwatchWorkspace(workspace) {
        if (this.watchedWorkspaces.has(workspace.uri)) {
            dispose(this.watchedWorkspaces.get(workspace.uri));
            this.watchedWorkspaces.delete(workspace.uri);
        }
    }
    refresh() {
        this.unwatchWorkspaces();
        for (const folder of this.contextService.getWorkspace().folders) {
            this.watchWorkspace(folder);
        }
    }
    unwatchWorkspaces() {
        for (const [, disposable] of this.watchedWorkspaces) {
            disposable.dispose();
        }
        this.watchedWorkspaces.clear();
    }
    dispose() {
        super.dispose();
        this.unwatchWorkspaces();
    }
};
WorkspaceWatcher = __decorate([
    __param(0, IFileService),
    __param(1, IConfigurationService),
    __param(2, IWorkspaceContextService),
    __param(3, INotificationService),
    __param(4, IOpenerService),
    __param(5, IUriIdentityService),
    __param(6, IHostService),
    __param(7, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], WorkspaceWatcher);
export { WorkspaceWatcher };
