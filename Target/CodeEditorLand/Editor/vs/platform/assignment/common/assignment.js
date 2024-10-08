/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as platform from '../../../base/common/platform.js';
export const ASSIGNMENT_STORAGE_KEY = 'VSCode.ABExp.FeatureData';
export const ASSIGNMENT_REFETCH_INTERVAL = 0; // no polling
export var TargetPopulation;
(function (TargetPopulation) {
    TargetPopulation["Insiders"] = "insider";
    TargetPopulation["Public"] = "public";
    TargetPopulation["Exploration"] = "exploration";
})(TargetPopulation || (TargetPopulation = {}));
/*
Based upon the official VSCode currently existing filters in the
ExP backend for the VSCode cluster.
https://experimentation.visualstudio.com/Analysis%20and%20Experimentation/_git/AnE.ExP.TAS.TachyonHost.Configuration?path=%2FConfigurations%2Fvscode%2Fvscode.json&version=GBmaster
"X-MSEdge-Market": "detection.market",
"X-FD-Corpnet": "detection.corpnet",
"X-VSCode-AppVersion": "appversion",
"X-VSCode-Build": "build",
"X-MSEdge-ClientId": "clientid",
"X-VSCode-ExtensionName": "extensionname",
"X-VSCode-ExtensionVersion": "extensionversion",
"X-VSCode-TargetPopulation": "targetpopulation",
"X-VSCode-Language": "language"
*/
export var Filters;
(function (Filters) {
    /**
     * The market in which the extension is distributed.
     */
    Filters["Market"] = "X-MSEdge-Market";
    /**
     * The corporation network.
     */
    Filters["CorpNet"] = "X-FD-Corpnet";
    /**
     * Version of the application which uses experimentation service.
     */
    Filters["ApplicationVersion"] = "X-VSCode-AppVersion";
    /**
     * Insiders vs Stable.
     */
    Filters["Build"] = "X-VSCode-Build";
    /**
     * Client Id which is used as primary unit for the experimentation.
     */
    Filters["ClientId"] = "X-MSEdge-ClientId";
    /**
     * Extension header.
     */
    Filters["ExtensionName"] = "X-VSCode-ExtensionName";
    /**
     * The version of the extension.
     */
    Filters["ExtensionVersion"] = "X-VSCode-ExtensionVersion";
    /**
     * The language in use by VS Code
     */
    Filters["Language"] = "X-VSCode-Language";
    /**
     * The target population.
     * This is used to separate internal, early preview, GA, etc.
     */
    Filters["TargetPopulation"] = "X-VSCode-TargetPopulation";
})(Filters || (Filters = {}));
export class AssignmentFilterProvider {
    constructor(version, appName, machineId, targetPopulation) {
        this.version = version;
        this.appName = appName;
        this.machineId = machineId;
        this.targetPopulation = targetPopulation;
    }
    /**
     * Returns a version string that can be parsed by the TAS client.
     * The tas client cannot handle suffixes lke "-insider"
     * Ref: https://github.com/microsoft/tas-client/blob/30340d5e1da37c2789049fcf45928b954680606f/vscode-tas-client/src/vscode-tas-client/VSCodeFilterProvider.ts#L35
     *
     * @param version Version string to be trimmed.
    */
    static trimVersionSuffix(version) {
        const regex = /\-[a-zA-Z0-9]+$/;
        const result = version.split(regex);
        return result[0];
    }
    getFilterValue(filter) {
        switch (filter) {
            case Filters.ApplicationVersion:
                return AssignmentFilterProvider.trimVersionSuffix(this.version); // productService.version
            case Filters.Build:
                return this.appName; // productService.nameLong
            case Filters.ClientId:
                return this.machineId;
            case Filters.Language:
                return platform.language;
            case Filters.ExtensionName:
                return 'vscode-core'; // always return vscode-core for exp service
            case Filters.ExtensionVersion:
                return '999999.0'; // always return a very large number for cross-extension experimentation
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
