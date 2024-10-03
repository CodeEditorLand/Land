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
    Market = "X-MSEdge-Market",
    CorpNet = "X-FD-Corpnet",
    ApplicationVersion = "X-VSCode-AppVersion",
    Build = "X-VSCode-Build",
    ClientId = "X-MSEdge-ClientId",
    ExtensionName = "X-VSCode-ExtensionName",
    ExtensionVersion = "X-VSCode-ExtensionVersion",
    Language = "X-VSCode-Language",
    TargetPopulation = "X-VSCode-TargetPopulation"
}
export declare class AssignmentFilterProvider implements IExperimentationFilterProvider {
    private version;
    private appName;
    private machineId;
    private targetPopulation;
    constructor(version: string, appName: string, machineId: string, targetPopulation: TargetPopulation);
    private static trimVersionSuffix;
    getFilterValue(filter: string): string | null;
    getFilters(): Map<string, any>;
}
