import type { IExperimentationFilterProvider } from 'tas-client-umd';
export declare const ASSIGNMENT_STORAGE_KEY = "VSCode.ABExp.FeatureData";
export declare const ASSIGNMENT_REFETCH_INTERVAL = 0;
export interface IAssignmentService {
    readonly _serviceBrand: undefined;
    getTreatment<T extends string | number | boolean>(name: string): Promise<T | undefined>;
}
export declare enum TargetPopulation {
    Insiders = "insider",
    Public = "public",
    Exploration = "exploration"
}
export declare enum Filters {
    /**
     * The market in which the extension is distributed.
     */
    Market = "X-MSEdge-Market",
    /**
     * The corporation network.
     */
    CorpNet = "X-FD-Corpnet",
    /**
     * Version of the application which uses experimentation service.
     */
    ApplicationVersion = "X-VSCode-AppVersion",
    /**
     * Insiders vs Stable.
     */
    Build = "X-VSCode-Build",
    /**
     * Client Id which is used as primary unit for the experimentation.
     */
    ClientId = "X-MSEdge-ClientId",
    /**
     * Extension header.
     */
    ExtensionName = "X-VSCode-ExtensionName",
    /**
     * The version of the extension.
     */
    ExtensionVersion = "X-VSCode-ExtensionVersion",
    /**
     * The language in use by VS Code
     */
    Language = "X-VSCode-Language",
    /**
     * The target population.
     * This is used to separate internal, early preview, GA, etc.
     */
    TargetPopulation = "X-VSCode-TargetPopulation"
}
export declare class AssignmentFilterProvider implements IExperimentationFilterProvider {
    private version;
    private appName;
    private machineId;
    private targetPopulation;
    constructor(version: string, appName: string, machineId: string, targetPopulation: TargetPopulation);
    /**
     * Returns a version string that can be parsed by the TAS client.
     * The tas client cannot handle suffixes lke "-insider"
     * Ref: https://github.com/microsoft/tas-client/blob/30340d5e1da37c2789049fcf45928b954680606f/vscode-tas-client/src/vscode-tas-client/VSCodeFilterProvider.ts#L35
     *
     * @param version Version string to be trimmed.
    */
    private static trimVersionSuffix;
    getFilterValue(filter: string): string | null;
    getFilters(): Map<string, any>;
}
