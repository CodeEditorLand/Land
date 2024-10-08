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
import { localize } from '../../../../nls.js';
import { URI } from '../../../../base/common/uri.js';
import { Disposable, dispose } from '../../../../base/common/lifecycle.js';
import { posix, sep, win32 } from '../../../../base/common/path.js';
import { Emitter } from '../../../../base/common/event.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IWorkspaceContextService, isWorkspace, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, toWorkspaceIdentifier, WORKSPACE_EXTENSION, isUntitledWorkspace, isTemporaryWorkspace } from '../../../../platform/workspace/common/workspace.js';
import { basenameOrAuthority, basename, joinPath, dirname } from '../../../../base/common/resources.js';
import { tildify, getPathLabel } from '../../../../base/common/labels.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ExtensionsRegistry } from '../../extensions/common/extensionsRegistry.js';
import { match } from '../../../../base/common/glob.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IPathService } from '../../path/common/pathService.js';
import { isProposedApiEnabled } from '../../extensions/common/extensions.js';
import { OS } from '../../../../base/common/platform.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { Schemas } from '../../../../base/common/network.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Memento } from '../../../common/memento.js';
const resourceLabelFormattersExtPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'resourceLabelFormatters',
    jsonSchema: {
        description: localize('vscode.extension.contributes.resourceLabelFormatters', 'Contributes resource label formatting rules.'),
        type: 'array',
        items: {
            type: 'object',
            required: ['scheme', 'formatting'],
            properties: {
                scheme: {
                    type: 'string',
                    description: localize('vscode.extension.contributes.resourceLabelFormatters.scheme', 'URI scheme on which to match the formatter on. For example "file". Simple glob patterns are supported.'),
                },
                authority: {
                    type: 'string',
                    description: localize('vscode.extension.contributes.resourceLabelFormatters.authority', 'URI authority on which to match the formatter on. Simple glob patterns are supported.'),
                },
                formatting: {
                    description: localize('vscode.extension.contributes.resourceLabelFormatters.formatting', "Rules for formatting uri resource labels."),
                    type: 'object',
                    properties: {
                        label: {
                            type: 'string',
                            description: localize('vscode.extension.contributes.resourceLabelFormatters.label', "Label rules to display. For example: myLabel:/${path}. ${path}, ${scheme}, ${authority} and ${authoritySuffix} are supported as variables.")
                        },
                        separator: {
                            type: 'string',
                            description: localize('vscode.extension.contributes.resourceLabelFormatters.separator', "Separator to be used in the uri label display. '/' or '\' as an example.")
                        },
                        stripPathStartingSeparator: {
                            type: 'boolean',
                            description: localize('vscode.extension.contributes.resourceLabelFormatters.stripPathStartingSeparator', "Controls whether `${path}` substitutions should have starting separator characters stripped.")
                        },
                        tildify: {
                            type: 'boolean',
                            description: localize('vscode.extension.contributes.resourceLabelFormatters.tildify', "Controls if the start of the uri label should be tildified when possible.")
                        },
                        workspaceSuffix: {
                            type: 'string',
                            description: localize('vscode.extension.contributes.resourceLabelFormatters.formatting.workspaceSuffix', "Suffix appended to the workspace label.")
                        }
                    }
                }
            }
        }
    }
});
const sepRegexp = /\//g;
const labelMatchingRegexp = /\$\{(scheme|authoritySuffix|authority|path|(query)\.(.+?))\}/g;
function hasDriveLetterIgnorePlatform(path) {
    return !!(path && path[2] === ':');
}
let ResourceLabelFormattersHandler = class ResourceLabelFormattersHandler {
    constructor(labelService) {
        this.formattersDisposables = new Map();
        resourceLabelFormattersExtPoint.setHandler((extensions, delta) => {
            for (const added of delta.added) {
                for (const untrustedFormatter of added.value) {
                    // We cannot trust that the formatter as it comes from an extension
                    // adheres to our interface, so for the required properties we fill
                    // in some defaults if missing.
                    const formatter = { ...untrustedFormatter };
                    if (typeof formatter.formatting.label !== 'string') {
                        formatter.formatting.label = '${authority}${path}';
                    }
                    if (typeof formatter.formatting.separator !== `string`) {
                        formatter.formatting.separator = sep;
                    }
                    if (!isProposedApiEnabled(added.description, 'contribLabelFormatterWorkspaceTooltip') && formatter.formatting.workspaceTooltip) {
                        formatter.formatting.workspaceTooltip = undefined; // workspaceTooltip is only proposed
                    }
                    this.formattersDisposables.set(formatter, labelService.registerFormatter(formatter));
                }
            }
            for (const removed of delta.removed) {
                for (const formatter of removed.value) {
                    dispose(this.formattersDisposables.get(formatter));
                }
            }
        });
    }
};
ResourceLabelFormattersHandler = __decorate([
    __param(0, ILabelService),
    __metadata("design:paramtypes", [Object])
], ResourceLabelFormattersHandler);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(ResourceLabelFormattersHandler, 3 /* LifecyclePhase.Restored */);
const FORMATTER_CACHE_SIZE = 50;
let LabelService = class LabelService extends Disposable {
    constructor(environmentService, contextService, pathService, remoteAgentService, storageService, lifecycleService) {
        super();
        this.environmentService = environmentService;
        this.contextService = contextService;
        this.pathService = pathService;
        this.remoteAgentService = remoteAgentService;
        this._onDidChangeFormatters = this._register(new Emitter({ leakWarningThreshold: 400 }));
        this.onDidChangeFormatters = this._onDidChangeFormatters.event;
        // Find some meaningful defaults until the remote environment
        // is resolved, by taking the current OS we are running in
        // and by taking the local `userHome` if we run on a local
        // file scheme.
        this.os = OS;
        this.userHome = pathService.defaultUriScheme === Schemas.file ? this.pathService.userHome({ preferLocal: true }) : undefined;
        const memento = this.storedFormattersMemento = new Memento('cachedResourceLabelFormatters2', storageService);
        this.storedFormatters = memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        this.formatters = this.storedFormatters?.formatters?.slice() || [];
        // Remote environment is potentially long running
        this.resolveRemoteEnvironment();
    }
    async resolveRemoteEnvironment() {
        // OS
        const env = await this.remoteAgentService.getEnvironment();
        this.os = env?.os ?? OS;
        // User home
        this.userHome = await this.pathService.userHome();
    }
    findFormatting(resource) {
        let bestResult;
        for (const formatter of this.formatters) {
            if (formatter.scheme === resource.scheme) {
                if (!formatter.authority && (!bestResult || formatter.priority)) {
                    bestResult = formatter;
                    continue;
                }
                if (!formatter.authority) {
                    continue;
                }
                if (match(formatter.authority.toLowerCase(), resource.authority.toLowerCase()) &&
                    (!bestResult ||
                        !bestResult.authority ||
                        formatter.authority.length > bestResult.authority.length ||
                        ((formatter.authority.length === bestResult.authority.length) && formatter.priority))) {
                    bestResult = formatter;
                }
            }
        }
        return bestResult ? bestResult.formatting : undefined;
    }
    getUriLabel(resource, options = {}) {
        let formatting = this.findFormatting(resource);
        if (formatting && options.separator) {
            // mixin separator if defined from the outside
            formatting = { ...formatting, separator: options.separator };
        }
        const label = this.doGetUriLabel(resource, formatting, options);
        // Without formatting we still need to support the separator
        // as provided in options (https://github.com/microsoft/vscode/issues/130019)
        if (!formatting && options.separator) {
            return label.replace(sepRegexp, options.separator);
        }
        return label;
    }
    doGetUriLabel(resource, formatting, options = {}) {
        if (!formatting) {
            return getPathLabel(resource, {
                os: this.os,
                tildify: this.userHome ? { userHome: this.userHome } : undefined,
                relative: options.relative ? {
                    noPrefix: options.noPrefix,
                    getWorkspace: () => this.contextService.getWorkspace(),
                    getWorkspaceFolder: resource => this.contextService.getWorkspaceFolder(resource)
                } : undefined
            });
        }
        // Relative label
        if (options.relative && this.contextService) {
            let folder = this.contextService.getWorkspaceFolder(resource);
            if (!folder) {
                // It is possible that the resource we want to resolve the
                // workspace folder for is not using the same scheme as
                // the folders in the workspace, so we help by trying again
                // to resolve a workspace folder by trying again with a
                // scheme that is workspace contained.
                const workspace = this.contextService.getWorkspace();
                const firstFolder = workspace.folders.at(0);
                if (firstFolder && resource.scheme !== firstFolder.uri.scheme && resource.path.startsWith(posix.sep)) {
                    folder = this.contextService.getWorkspaceFolder(firstFolder.uri.with({ path: resource.path }));
                }
            }
            if (folder) {
                const folderLabel = this.formatUri(folder.uri, formatting, options.noPrefix);
                let relativeLabel = this.formatUri(resource, formatting, options.noPrefix);
                let overlap = 0;
                while (relativeLabel[overlap] && relativeLabel[overlap] === folderLabel[overlap]) {
                    overlap++;
                }
                if (!relativeLabel[overlap] || relativeLabel[overlap] === formatting.separator) {
                    relativeLabel = relativeLabel.substring(1 + overlap);
                }
                else if (overlap === folderLabel.length && folder.uri.path === posix.sep) {
                    relativeLabel = relativeLabel.substring(overlap);
                }
                // always show root basename if there are multiple folders
                const hasMultipleRoots = this.contextService.getWorkspace().folders.length > 1;
                if (hasMultipleRoots && !options.noPrefix) {
                    const rootName = folder?.name ?? basenameOrAuthority(folder.uri);
                    relativeLabel = relativeLabel ? `${rootName} • ${relativeLabel}` : rootName;
                }
                return relativeLabel;
            }
        }
        // Absolute label
        return this.formatUri(resource, formatting, options.noPrefix);
    }
    getUriBasenameLabel(resource) {
        const formatting = this.findFormatting(resource);
        const label = this.doGetUriLabel(resource, formatting);
        let pathLib;
        if (formatting?.separator === win32.sep) {
            pathLib = win32;
        }
        else if (formatting?.separator === posix.sep) {
            pathLib = posix;
        }
        else {
            pathLib = (this.os === 1 /* OperatingSystem.Windows */) ? win32 : posix;
        }
        return pathLib.basename(label);
    }
    getWorkspaceLabel(workspace, options) {
        if (isWorkspace(workspace)) {
            const identifier = toWorkspaceIdentifier(workspace);
            if (isSingleFolderWorkspaceIdentifier(identifier) || isWorkspaceIdentifier(identifier)) {
                return this.getWorkspaceLabel(identifier, options);
            }
            return '';
        }
        // Workspace: Single Folder (as URI)
        if (URI.isUri(workspace)) {
            return this.doGetSingleFolderWorkspaceLabel(workspace, options);
        }
        // Workspace: Single Folder (as workspace identifier)
        if (isSingleFolderWorkspaceIdentifier(workspace)) {
            return this.doGetSingleFolderWorkspaceLabel(workspace.uri, options);
        }
        // Workspace: Multi Root
        if (isWorkspaceIdentifier(workspace)) {
            return this.doGetWorkspaceLabel(workspace.configPath, options);
        }
        return '';
    }
    doGetWorkspaceLabel(workspaceUri, options) {
        // Workspace: Untitled
        if (isUntitledWorkspace(workspaceUri, this.environmentService)) {
            return localize('untitledWorkspace', "Untitled (Workspace)");
        }
        // Workspace: Temporary
        if (isTemporaryWorkspace(workspaceUri)) {
            return localize('temporaryWorkspace', "Workspace");
        }
        // Workspace: Saved
        let filename = basename(workspaceUri);
        if (filename.endsWith(WORKSPACE_EXTENSION)) {
            filename = filename.substr(0, filename.length - WORKSPACE_EXTENSION.length - 1);
        }
        let label;
        switch (options?.verbose) {
            case 0 /* Verbosity.SHORT */:
                label = filename; // skip suffix for short label
                break;
            case 2 /* Verbosity.LONG */:
                label = localize('workspaceNameVerbose', "{0} (Workspace)", this.getUriLabel(joinPath(dirname(workspaceUri), filename)));
                break;
            case 1 /* Verbosity.MEDIUM */:
            default:
                label = localize('workspaceName', "{0} (Workspace)", filename);
                break;
        }
        if (options?.verbose === 0 /* Verbosity.SHORT */) {
            return label; // skip suffix for short label
        }
        return this.appendWorkspaceSuffix(label, workspaceUri);
    }
    doGetSingleFolderWorkspaceLabel(folderUri, options) {
        let label;
        switch (options?.verbose) {
            case 2 /* Verbosity.LONG */:
                label = this.getUriLabel(folderUri);
                break;
            case 0 /* Verbosity.SHORT */:
            case 1 /* Verbosity.MEDIUM */:
            default:
                label = basename(folderUri) || posix.sep;
                break;
        }
        if (options?.verbose === 0 /* Verbosity.SHORT */) {
            return label; // skip suffix for short label
        }
        return this.appendWorkspaceSuffix(label, folderUri);
    }
    getSeparator(scheme, authority) {
        const formatter = this.findFormatting(URI.from({ scheme, authority }));
        return formatter?.separator || posix.sep;
    }
    getHostLabel(scheme, authority) {
        const formatter = this.findFormatting(URI.from({ scheme, authority }));
        return formatter?.workspaceSuffix || authority || '';
    }
    getHostTooltip(scheme, authority) {
        const formatter = this.findFormatting(URI.from({ scheme, authority }));
        return formatter?.workspaceTooltip;
    }
    registerCachedFormatter(formatter) {
        const list = this.storedFormatters.formatters ??= [];
        let replace = list.findIndex(f => f.scheme === formatter.scheme && f.authority === formatter.authority);
        if (replace === -1 && list.length >= FORMATTER_CACHE_SIZE) {
            replace = FORMATTER_CACHE_SIZE - 1; // at max capacity, replace the last element
        }
        if (replace === -1) {
            list.unshift(formatter);
        }
        else {
            for (let i = replace; i > 0; i--) {
                list[i] = list[i - 1];
            }
            list[0] = formatter;
        }
        this.storedFormattersMemento.saveMemento();
        return this.registerFormatter(formatter);
    }
    registerFormatter(formatter) {
        this.formatters.push(formatter);
        this._onDidChangeFormatters.fire({ scheme: formatter.scheme });
        return {
            dispose: () => {
                this.formatters = this.formatters.filter(f => f !== formatter);
                this._onDidChangeFormatters.fire({ scheme: formatter.scheme });
            }
        };
    }
    formatUri(resource, formatting, forceNoTildify) {
        let label = formatting.label.replace(labelMatchingRegexp, (match, token, qsToken, qsValue) => {
            switch (token) {
                case 'scheme': return resource.scheme;
                case 'authority': return resource.authority;
                case 'authoritySuffix': {
                    const i = resource.authority.indexOf('+');
                    return i === -1 ? resource.authority : resource.authority.slice(i + 1);
                }
                case 'path':
                    return formatting.stripPathStartingSeparator
                        ? resource.path.slice(resource.path[0] === formatting.separator ? 1 : 0)
                        : resource.path;
                default: {
                    if (qsToken === 'query') {
                        const { query } = resource;
                        if (query && query[0] === '{' && query[query.length - 1] === '}') {
                            try {
                                return JSON.parse(query)[qsValue] || '';
                            }
                            catch { }
                        }
                    }
                    return '';
                }
            }
        });
        // convert \c:\something => C:\something
        if (formatting.normalizeDriveLetter && hasDriveLetterIgnorePlatform(label)) {
            label = label.charAt(1).toUpperCase() + label.substr(2);
        }
        if (formatting.tildify && !forceNoTildify) {
            if (this.userHome) {
                label = tildify(label, this.userHome.fsPath, this.os);
            }
        }
        if (formatting.authorityPrefix && resource.authority) {
            label = formatting.authorityPrefix + label;
        }
        return label.replace(sepRegexp, formatting.separator);
    }
    appendWorkspaceSuffix(label, uri) {
        const formatting = this.findFormatting(uri);
        const suffix = formatting && (typeof formatting.workspaceSuffix === 'string') ? formatting.workspaceSuffix : undefined;
        return suffix ? `${label} [${suffix}]` : label;
    }
};
LabelService = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, IWorkspaceContextService),
    __param(2, IPathService),
    __param(3, IRemoteAgentService),
    __param(4, IStorageService),
    __param(5, ILifecycleService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], LabelService);
export { LabelService };
registerSingleton(ILabelService, LabelService, 1 /* InstantiationType.Delayed */);
