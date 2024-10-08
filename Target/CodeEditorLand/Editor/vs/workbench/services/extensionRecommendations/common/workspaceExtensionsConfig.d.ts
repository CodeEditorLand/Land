import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IJSONEditingService } from '../../configuration/common/jsonEditing.js';
export declare const EXTENSIONS_CONFIG = ".vscode/extensions.json";
export interface IExtensionsConfigContent {
    recommendations?: string[];
    unwantedRecommendations?: string[];
}
export declare const IWorkspaceExtensionsConfigService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceExtensionsConfigService>;
export interface IWorkspaceExtensionsConfigService {
    readonly _serviceBrand: undefined;
    onDidChangeExtensionsConfigs: Event<void>;
    getExtensionsConfigs(): Promise<IExtensionsConfigContent[]>;
    getRecommendations(): Promise<string[]>;
    getUnwantedRecommendations(): Promise<string[]>;
    toggleRecommendation(extensionId: string): Promise<void>;
    toggleUnwantedRecommendation(extensionId: string): Promise<void>;
}
export declare class WorkspaceExtensionsConfigService extends Disposable implements IWorkspaceExtensionsConfigService {
    private readonly workspaceContextService;
    private readonly fileService;
    private readonly quickInputService;
    private readonly modelService;
    private readonly languageService;
    private readonly jsonEditingService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeExtensionsConfigs;
    readonly onDidChangeExtensionsConfigs: Event<void>;
    constructor(workspaceContextService: IWorkspaceContextService, fileService: IFileService, quickInputService: IQuickInputService, modelService: IModelService, languageService: ILanguageService, jsonEditingService: IJSONEditingService);
    getExtensionsConfigs(): Promise<IExtensionsConfigContent[]>;
    getRecommendations(): Promise<string[]>;
    getUnwantedRecommendations(): Promise<string[]>;
    toggleRecommendation(extensionId: string): Promise<void>;
    toggleUnwantedRecommendation(extensionId: string): Promise<void>;
    private addOrRemoveWorkspaceFolderRecommendation;
    private addOrRemoveWorkspaceRecommendation;
    private addOrRemoveWorkspaceFolderUnwantedRecommendation;
    private addOrRemoveWorkspaceUnwantedRecommendation;
    private pickWorkspaceOrFolders;
    private resolveWorkspaceExtensionConfig;
    private resolveWorkspaceFolderExtensionConfig;
    private parseExtensionConfig;
    private getEditToRemoveValueFromArray;
}
