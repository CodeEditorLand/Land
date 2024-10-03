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
import { Emitter } from '../../../../../base/common/event.js';
import { localize } from '../../../../../nls.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { listInvalidItemForeground, listDeemphasizedForeground } from '../../../../../platform/theme/common/colorRegistry.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { explorerRootErrorEmitter } from './explorerViewer.js';
import { IExplorerService } from '../files.js';
import { toErrorMessage } from '../../../../../base/common/errorMessage.js';
export function provideDecorations(fileStat) {
    if (fileStat.isRoot && fileStat.error) {
        return {
            tooltip: localize('canNotResolve', "Unable to resolve workspace folder ({0})", toErrorMessage(fileStat.error)),
            letter: '!',
            color: listInvalidItemForeground,
        };
    }
    if (fileStat.isSymbolicLink) {
        return {
            tooltip: localize('symbolicLlink', "Symbolic Link"),
            letter: '\u2937'
        };
    }
    if (fileStat.isUnknown) {
        return {
            tooltip: localize('unknown', "Unknown File Type"),
            letter: '?'
        };
    }
    if (fileStat.isExcluded) {
        return {
            color: listDeemphasizedForeground,
        };
    }
    return undefined;
}
let ExplorerDecorationsProvider = class ExplorerDecorationsProvider {
    constructor(explorerService, contextService) {
        this.explorerService = explorerService;
        this.label = localize('label', "Explorer");
        this._onDidChange = new Emitter();
        this.toDispose = new DisposableStore();
        this.toDispose.add(this._onDidChange);
        this.toDispose.add(contextService.onDidChangeWorkspaceFolders(e => {
            this._onDidChange.fire(e.changed.concat(e.added).map(wf => wf.uri));
        }));
        this.toDispose.add(explorerRootErrorEmitter.event((resource => {
            this._onDidChange.fire([resource]);
        })));
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    async provideDecorations(resource) {
        const fileStat = this.explorerService.findClosest(resource);
        if (!fileStat) {
            throw new Error('ExplorerItem not found');
        }
        return provideDecorations(fileStat);
    }
    dispose() {
        this.toDispose.dispose();
    }
};
ExplorerDecorationsProvider = __decorate([
    __param(0, IExplorerService),
    __param(1, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object])
], ExplorerDecorationsProvider);
export { ExplorerDecorationsProvider };
