import { IExtensionTipsService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionRecommendations, ExtensionRecommendation } from './extensionRecommendations.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
type ConfigBasedExtensionRecommendation = ExtensionRecommendation & {
    whenNotInstalled: string[] | undefined;
};
export declare class ConfigBasedRecommendations extends ExtensionRecommendations {
    private readonly extensionTipsService;
    private readonly workspaceContextService;
    private importantTips;
    private otherTips;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: import("../../../workbench.web.main.internal.js").Event<void>;
    private _otherRecommendations;
    get otherRecommendations(): ReadonlyArray<ConfigBasedExtensionRecommendation>;
    private _importantRecommendations;
    get importantRecommendations(): ReadonlyArray<ConfigBasedExtensionRecommendation>;
    get recommendations(): ReadonlyArray<ConfigBasedExtensionRecommendation>;
    constructor(extensionTipsService: IExtensionTipsService, workspaceContextService: IWorkspaceContextService);
    protected doActivate(): Promise<void>;
    private fetch;
    private onWorkspaceFoldersChanged;
    private toExtensionRecommendation;
}
export {};
