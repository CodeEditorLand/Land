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
var ResourceGlobMatcher_1;
import { URI } from '../../base/common/uri.js';
import { equals } from '../../base/common/objects.js';
import { isAbsolute } from '../../base/common/path.js';
import { Emitter } from '../../base/common/event.js';
import { relativePath } from '../../base/common/resources.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { parse } from '../../base/common/glob.js';
import { IWorkspaceContextService } from '../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { Schemas } from '../../base/common/network.js';
import { ResourceSet } from '../../base/common/map.js';
import { getDriveLetter } from '../../base/common/extpath.js';
let ResourceGlobMatcher = class ResourceGlobMatcher extends Disposable {
    static { ResourceGlobMatcher_1 = this; }
    static { this.NO_FOLDER = null; }
    constructor(getExpression, shouldUpdate, contextService, configurationService) {
        super();
        this.getExpression = getExpression;
        this.shouldUpdate = shouldUpdate;
        this.contextService = contextService;
        this.configurationService = configurationService;
        this._onExpressionChange = this._register(new Emitter());
        this.onExpressionChange = this._onExpressionChange.event;
        this.mapFolderToParsedExpression = new Map();
        this.mapFolderToConfiguredExpression = new Map();
        this.updateExpressions(false);
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (this.shouldUpdate(e)) {
                this.updateExpressions(true);
            }
        }));
        this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.updateExpressions(true)));
    }
    updateExpressions(fromEvent) {
        let changed = false;
        // Add expressions per workspaces that got added
        for (const folder of this.contextService.getWorkspace().folders) {
            const folderUriStr = folder.uri.toString();
            const newExpression = this.doGetExpression(folder.uri);
            const currentExpression = this.mapFolderToConfiguredExpression.get(folderUriStr);
            if (newExpression) {
                if (!currentExpression || !equals(currentExpression.expression, newExpression.expression)) {
                    changed = true;
                    this.mapFolderToParsedExpression.set(folderUriStr, parse(newExpression.expression));
                    this.mapFolderToConfiguredExpression.set(folderUriStr, newExpression);
                }
            }
            else {
                if (currentExpression) {
                    changed = true;
                    this.mapFolderToParsedExpression.delete(folderUriStr);
                    this.mapFolderToConfiguredExpression.delete(folderUriStr);
                }
            }
        }
        // Remove expressions per workspace no longer present
        const foldersMap = new ResourceSet(this.contextService.getWorkspace().folders.map(folder => folder.uri));
        for (const [folder] of this.mapFolderToConfiguredExpression) {
            if (folder === ResourceGlobMatcher_1.NO_FOLDER) {
                continue; // always keep this one
            }
            if (!foldersMap.has(URI.parse(folder))) {
                this.mapFolderToParsedExpression.delete(folder);
                this.mapFolderToConfiguredExpression.delete(folder);
                changed = true;
            }
        }
        // Always set for resources outside workspace as well
        const globalNewExpression = this.doGetExpression(undefined);
        const globalCurrentExpression = this.mapFolderToConfiguredExpression.get(ResourceGlobMatcher_1.NO_FOLDER);
        if (globalNewExpression) {
            if (!globalCurrentExpression || !equals(globalCurrentExpression.expression, globalNewExpression.expression)) {
                changed = true;
                this.mapFolderToParsedExpression.set(ResourceGlobMatcher_1.NO_FOLDER, parse(globalNewExpression.expression));
                this.mapFolderToConfiguredExpression.set(ResourceGlobMatcher_1.NO_FOLDER, globalNewExpression);
            }
        }
        else {
            if (globalCurrentExpression) {
                changed = true;
                this.mapFolderToParsedExpression.delete(ResourceGlobMatcher_1.NO_FOLDER);
                this.mapFolderToConfiguredExpression.delete(ResourceGlobMatcher_1.NO_FOLDER);
            }
        }
        if (fromEvent && changed) {
            this._onExpressionChange.fire();
        }
    }
    doGetExpression(resource) {
        const expression = this.getExpression(resource);
        if (!expression) {
            return undefined;
        }
        const keys = Object.keys(expression);
        if (keys.length === 0) {
            return undefined;
        }
        let hasAbsolutePath = false;
        // Check the expression for absolute paths/globs
        // and specifically for Windows, make sure the
        // drive letter is lowercased, because we later
        // check with `URI.fsPath` which is always putting
        // the drive letter lowercased.
        const massagedExpression = Object.create(null);
        for (const key of keys) {
            if (!hasAbsolutePath) {
                hasAbsolutePath = isAbsolute(key);
            }
            let massagedKey = key;
            const driveLetter = getDriveLetter(massagedKey, true /* probe for windows */);
            if (driveLetter) {
                const driveLetterLower = driveLetter.toLowerCase();
                if (driveLetter !== driveLetter.toLowerCase()) {
                    massagedKey = `${driveLetterLower}${massagedKey.substring(1)}`;
                }
            }
            massagedExpression[massagedKey] = expression[key];
        }
        return {
            expression: massagedExpression,
            hasAbsolutePath
        };
    }
    matches(resource, hasSibling) {
        if (this.mapFolderToParsedExpression.size === 0) {
            return false; // return early: no expression for this matcher
        }
        const folder = this.contextService.getWorkspaceFolder(resource);
        let expressionForFolder;
        let expressionConfigForFolder;
        if (folder && this.mapFolderToParsedExpression.has(folder.uri.toString())) {
            expressionForFolder = this.mapFolderToParsedExpression.get(folder.uri.toString());
            expressionConfigForFolder = this.mapFolderToConfiguredExpression.get(folder.uri.toString());
        }
        else {
            expressionForFolder = this.mapFolderToParsedExpression.get(ResourceGlobMatcher_1.NO_FOLDER);
            expressionConfigForFolder = this.mapFolderToConfiguredExpression.get(ResourceGlobMatcher_1.NO_FOLDER);
        }
        if (!expressionForFolder) {
            return false; // return early: no expression for this resource
        }
        // If the resource if from a workspace, convert its absolute path to a relative
        // path so that glob patterns have a higher probability to match. For example
        // a glob pattern of "src/**" will not match on an absolute path "/folder/src/file.txt"
        // but can match on "src/file.txt"
        let resourcePathToMatch;
        if (folder) {
            resourcePathToMatch = relativePath(folder.uri, resource);
        }
        else {
            resourcePathToMatch = this.uriToPath(resource);
        }
        if (typeof resourcePathToMatch === 'string' && !!expressionForFolder(resourcePathToMatch, undefined, hasSibling)) {
            return true;
        }
        // If the configured expression has an absolute path, we also check for absolute paths
        // to match, otherwise we potentially miss out on matches. We only do that if we previously
        // matched on the relative path.
        if (resourcePathToMatch !== this.uriToPath(resource) && expressionConfigForFolder?.hasAbsolutePath) {
            return !!expressionForFolder(this.uriToPath(resource), undefined, hasSibling);
        }
        return false;
    }
    uriToPath(uri) {
        if (uri.scheme === Schemas.file) {
            return uri.fsPath;
        }
        return uri.path;
    }
};
ResourceGlobMatcher = ResourceGlobMatcher_1 = __decorate([
    __param(2, IWorkspaceContextService),
    __param(3, IConfigurationService),
    __metadata("design:paramtypes", [Function, Function, Object, Object])
], ResourceGlobMatcher);
export { ResourceGlobMatcher };
