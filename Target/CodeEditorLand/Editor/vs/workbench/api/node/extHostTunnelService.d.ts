import { ILogService } from '../../../platform/log/common/log.js';
import { ISignService } from '../../../platform/sign/common/sign.js';
import { IExtHostInitDataService } from '../common/extHostInitDataService.js';
import { IExtHostRpcService } from '../common/extHostRpcService.js';
import { ExtHostTunnelService } from '../common/extHostTunnelService.js';
import { CandidatePort } from '../../services/remote/common/tunnelModel.js';
import * as vscode from 'vscode';
export declare function getSockets(stdout: string): Record<string, {
    pid: number;
    socket: number;
}>;
export declare function loadListeningPorts(...stdouts: string[]): {
    socket: number;
    ip: string;
    port: number;
}[];
export declare function parseIpAddress(hex: string): string;
export declare function loadConnectionTable(stdout: string): Record<string, string>[];
export declare function getRootProcesses(stdout: string): {
    pid: number;
    cmd: string;
    ppid: number;
}[];
export declare function findPorts(connections: {
    socket: number;
    ip: string;
    port: number;
}[], socketMap: Record<string, {
    pid: number;
    socket: number;
}>, processes: {
    pid: number;
    cwd: string;
    cmd: string;
}[]): Promise<CandidatePort[]>;
export declare function tryFindRootPorts(connections: {
    socket: number;
    ip: string;
    port: number;
}[], rootProcessesStdout: string, previousPorts: Map<number, CandidatePort & {
    ppid: number;
}>): Map<number, CandidatePort & {
    ppid: number;
}>;
export declare class NodeExtHostTunnelService extends ExtHostTunnelService {
    private readonly initData;
    private readonly signService;
    private _initialCandidates;
    private _foundRootPorts;
    private _candidateFindingEnabled;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, logService: ILogService, signService: ISignService);
    $registerCandidateFinder(enable: boolean): Promise<void>;
    private calculateDelay;
    private setInitialCandidates;
    private findCandidatePorts;
    protected makeManagedTunnelFactory(authority: vscode.ManagedResolvedAuthority): vscode.RemoteAuthorityResolver['tunnelFactory'];
}
