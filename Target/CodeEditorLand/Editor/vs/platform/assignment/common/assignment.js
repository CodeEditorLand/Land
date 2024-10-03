import * as platform from '../../../base/common/platform.js';
export const ASSIGNMENT_STORAGE_KEY = 'VSCode.ABExp.FeatureData';
export const ASSIGNMENT_REFETCH_INTERVAL = 0;
export var TargetPopulation;
(function (TargetPopulation) {
    TargetPopulation["Insiders"] = "insider";
    TargetPopulation["Public"] = "public";
    TargetPopulation["Exploration"] = "exploration";
})(TargetPopulation || (TargetPopulation = {}));
export var Filters;
(function (Filters) {
    Filters["Market"] = "X-MSEdge-Market";
    Filters["CorpNet"] = "X-FD-Corpnet";
    Filters["ApplicationVersion"] = "X-VSCode-AppVersion";
    Filters["Build"] = "X-VSCode-Build";
    Filters["ClientId"] = "X-MSEdge-ClientId";
    Filters["ExtensionName"] = "X-VSCode-ExtensionName";
    Filters["ExtensionVersion"] = "X-VSCode-ExtensionVersion";
    Filters["Language"] = "X-VSCode-Language";
    Filters["TargetPopulation"] = "X-VSCode-TargetPopulation";
})(Filters || (Filters = {}));
export class AssignmentFilterProvider {
    constructor(version, appName, machineId, targetPopulation) {
        this.version = version;
        this.appName = appName;
        this.machineId = machineId;
        this.targetPopulation = targetPopulation;
    }
    static trimVersionSuffix(version) {
        const regex = /\-[a-zA-Z0-9]+$/;
        const result = version.split(regex);
        return result[0];
    }
    getFilterValue(filter) {
        switch (filter) {
            case Filters.ApplicationVersion:
                return AssignmentFilterProvider.trimVersionSuffix(this.version);
            case Filters.Build:
                return this.appName;
            case Filters.ClientId:
                return this.machineId;
            case Filters.Language:
                return platform.language;
            case Filters.ExtensionName:
                return 'vscode-core';
            case Filters.ExtensionVersion:
                return '999999.0';
            case Filters.TargetPopulation:
                return this.targetPopulation;
            default:
                return '';
        }
    }
    getFilters() {
        const filters = new Map();
        const filterValues = Object.values(Filters);
        for (const value of filterValues) {
            filters.set(value, this.getFilterValue(value));
        }
        return filters;
    }
}
