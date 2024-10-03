import { IExtensionTipsService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionRecommendations, ExtensionRecommendation } from './extensionRecommendations.js';
export declare class ExeBasedRecommendations extends ExtensionRecommendations {
    private readonly extensionTipsService;
    private _otherTips;
    private _importantTips;
    get otherRecommendations(): ReadonlyArray<ExtensionRecommendation>;
    get importantRecommendations(): ReadonlyArray<ExtensionRecommendation>;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(extensionTipsService: IExtensionTipsService);
    getRecommendations(exe: string): {
        important: ExtensionRecommendation[];
        others: ExtensionRecommendation[];
    };
    protected doActivate(): Promise<void>;
    private _importantExeBasedRecommendations;
    private fetchImportantExeBasedRecommendations;
    private doFetchImportantExeBasedRecommendations;
    private toExtensionRecommendation;
}
