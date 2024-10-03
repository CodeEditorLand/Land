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
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { DisposableStore, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { Schemas, matchesSomeScheme } from '../../../../base/common/network.js';
import { dirname, isEqual } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { FileKind } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { BreadcrumbsConfig } from './breadcrumbs.js';
import { IOutlineService } from '../../../services/outline/browser/outline.js';
export class FileElement {
    constructor(uri, kind) {
        this.uri = uri;
        this.kind = kind;
    }
}
export class OutlineElement2 {
    constructor(element, outline) {
        this.element = element;
        this.outline = outline;
    }
}
let BreadcrumbsModel = class BreadcrumbsModel {
    constructor(resource, editor, configurationService, _workspaceService, _outlineService) {
        this.resource = resource;
        this._workspaceService = _workspaceService;
        this._outlineService = _outlineService;
        this._disposables = new DisposableStore();
        this._currentOutline = new MutableDisposable();
        this._outlineDisposables = new DisposableStore();
        this._onDidUpdate = new Emitter();
        this.onDidUpdate = this._onDidUpdate.event;
        this._cfgFilePath = BreadcrumbsConfig.FilePath.bindTo(configurationService);
        this._cfgSymbolPath = BreadcrumbsConfig.SymbolPath.bindTo(configurationService);
        this._disposables.add(this._cfgFilePath.onDidChange(_ => this._onDidUpdate.fire(this)));
        this._disposables.add(this._cfgSymbolPath.onDidChange(_ => this._onDidUpdate.fire(this)));
        this._workspaceService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspaceFolders, this, this._disposables);
        this._fileInfo = this._initFilePathInfo(resource);
        if (editor) {
            this._bindToEditor(editor);
            this._disposables.add(_outlineService.onDidChange(() => this._bindToEditor(editor)));
            this._disposables.add(editor.onDidChangeControl(() => this._bindToEditor(editor)));
        }
        this._onDidUpdate.fire(this);
    }
    dispose() {
        this._disposables.dispose();
        this._cfgFilePath.dispose();
        this._cfgSymbolPath.dispose();
        this._currentOutline.dispose();
        this._outlineDisposables.dispose();
        this._onDidUpdate.dispose();
    }
    isRelative() {
        return Boolean(this._fileInfo.folder);
    }
    getElements() {
        let result = [];
        if (this._cfgFilePath.getValue() === 'on') {
            result = result.concat(this._fileInfo.path);
        }
        else if (this._cfgFilePath.getValue() === 'last' && this._fileInfo.path.length > 0) {
            result = result.concat(this._fileInfo.path.slice(-1));
        }
        if (this._cfgSymbolPath.getValue() === 'off') {
            return result;
        }
        if (!this._currentOutline.value) {
            return result;
        }
        const breadcrumbsElements = this._currentOutline.value.config.breadcrumbsDataSource.getBreadcrumbElements();
        for (let i = this._cfgSymbolPath.getValue() === 'last' && breadcrumbsElements.length > 0 ? breadcrumbsElements.length - 1 : 0; i < breadcrumbsElements.length; i++) {
            result.push(new OutlineElement2(breadcrumbsElements[i], this._currentOutline.value));
        }
        if (breadcrumbsElements.length === 0 && !this._currentOutline.value.isEmpty) {
            result.push(new OutlineElement2(this._currentOutline.value, this._currentOutline.value));
        }
        return result;
    }
    _initFilePathInfo(uri) {
        if (matchesSomeScheme(uri, Schemas.untitled, Schemas.data)) {
            return {
                folder: undefined,
                path: []
            };
        }
        const info = {
            folder: this._workspaceService.getWorkspaceFolder(uri) ?? undefined,
            path: []
        };
        let uriPrefix = uri;
        while (uriPrefix && uriPrefix.path !== '/') {
            if (info.folder && isEqual(info.folder.uri, uriPrefix)) {
                break;
            }
            info.path.unshift(new FileElement(uriPrefix, info.path.length === 0 ? FileKind.FILE : FileKind.FOLDER));
            const prevPathLength = uriPrefix.path.length;
            uriPrefix = dirname(uriPrefix);
            if (uriPrefix.path.length === prevPathLength) {
                break;
            }
        }
        if (info.folder && this._workspaceService.getWorkbenchState() === 3) {
            info.path.unshift(new FileElement(info.folder.uri, FileKind.ROOT_FOLDER));
        }
        return info;
    }
    _onDidChangeWorkspaceFolders() {
        this._fileInfo = this._initFilePathInfo(this.resource);
        this._onDidUpdate.fire(this);
    }
    _bindToEditor(editor) {
        const newCts = new CancellationTokenSource();
        this._currentOutline.clear();
        this._outlineDisposables.clear();
        this._outlineDisposables.add(toDisposable(() => newCts.dispose(true)));
        this._outlineService.createOutline(editor, 2, newCts.token).then(outline => {
            if (newCts.token.isCancellationRequested) {
                outline?.dispose();
                outline = undefined;
            }
            this._currentOutline.value = outline;
            this._onDidUpdate.fire(this);
            if (outline) {
                this._outlineDisposables.add(outline.onDidChange(() => this._onDidUpdate.fire(this)));
            }
        }).catch(err => {
            this._onDidUpdate.fire(this);
            onUnexpectedError(err);
        });
    }
};
BreadcrumbsModel = __decorate([
    __param(2, IConfigurationService),
    __param(3, IWorkspaceContextService),
    __param(4, IOutlineService),
    __metadata("design:paramtypes", [URI, Object, Object, Object, Object])
], BreadcrumbsModel);
export { BreadcrumbsModel };
