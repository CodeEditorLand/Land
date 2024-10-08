/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../instantiation/common/instantiation.js';
export const ID = 'diagnosticsService';
export const IDiagnosticsService = createDecorator(ID);
export function isRemoteDiagnosticError(x) {
    return !!x.hostName && !!x.errorMessage;
}
export class NullDiagnosticsService {
    async getPerformanceInfo(mainProcessInfo, remoteInfo) {
        return {};
    }
    async getSystemInfo(mainProcessInfo, remoteInfo) {
        return {
            processArgs: 'nullProcessArgs',
            gpuStatus: 'nullGpuStatus',
            screenReader: 'nullScreenReader',
            remoteData: [],
            os: 'nullOs',
            memory: 'nullMemory',
            vmHint: 'nullVmHint',
        };
    }
    async getDiagnostics(mainProcessInfo, remoteInfo) {
        return '';
    }
    async getWorkspaceFileExtensions(workspace) {
        return { extensions: [] };
    }
    async reportWorkspaceStats(workspace) { }
}
