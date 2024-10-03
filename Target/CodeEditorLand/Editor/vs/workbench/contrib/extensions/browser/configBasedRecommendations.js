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
import { IExtensionTipsService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionRecommendations } from './extensionRecommendations.js';
import { localize } from '../../../../nls.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { Emitter } from '../../../../base/common/event.js';
let ConfigBasedRecommendations = class ConfigBasedRecommendations extends ExtensionRecommendations {
    get otherRecommendations() { return this._otherRecommendations; }
    get importantRecommendations() { return this._importantRecommendations; }
    get recommendations() { return [...this.importantRecommendations, ...this.otherRecommendations]; }
    constructor(extensionTipsService, workspaceContextService) {
        super();
        this.extensionTipsService = extensionTipsService;
        this.workspaceContextService = workspaceContextService;
        this.importantTips = [];
        this.otherTips = [];
        this._onDidChangeRecommendations = this._register(new Emitter());
        this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
        this._otherRecommendations = [];
        this._importantRecommendations = [];
    }
    async doActivate() {
        await this.fetch();
        this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(e => this.onWorkspaceFoldersChanged(e)));
    }
    async fetch() {
        const workspace = this.workspaceContextService.getWorkspace();
        const importantTips = new Map();
        const otherTips = new Map();
        for (const folder of workspace.folders) {
            const configBasedTips = await this.extensionTipsService.getConfigBasedTips(folder.uri);
            for (const tip of configBasedTips) {
                if (tip.important) {
                    importantTips.set(tip.extensionId, tip);
                }
                else {
                    otherTips.set(tip.extensionId, tip);
                }
            }
        }
        this.importantTips = [...importantTips.values()];
        this.otherTips = [...otherTips.values()].filter(tip => !importantTips.has(tip.extensionId));
        this._otherRecommendations = this.otherTips.map(tip => this.toExtensionRecommendation(tip));
        this._importantRecommendations = this.importantTips.map(tip => this.toExtensionRecommendation(tip));
    }
    async onWorkspaceFoldersChanged(event) {
        if (event.added.length) {
            const oldImportantRecommended = this.importantTips;
            await this.fetch();
            if (this.importantTips.some(current => oldImportantRecommended.every(old => current.extensionId !== old.extensionId))) {
                this._onDidChangeRecommendations.fire();
            }
        }
    }
    toExtensionRecommendation(tip) {
        return {
            extension: tip.extensionId,
            reason: {
                reasonId: 3,
                reasonText: localize('exeBasedRecommendation', "This extension is recommended because of the current workspace configuration")
            },
            whenNotInstalled: tip.whenNotInstalled
        };
    }
};
ConfigBasedRecommendations = __decorate([
    __param(0, IExtensionTipsService),
    __param(1, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object])
], ConfigBasedRecommendations);
export { ConfigBasedRecommendations };
