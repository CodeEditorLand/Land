import { Event } from '../../../../base/common/event.js';
import { RemoteTunnel, TunnelProtocol } from '../../../../platform/tunnel/common/tunnel.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IEditableData } from '../../../common/views.js';
import { TunnelInformation, TunnelPrivacy } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { URI } from '../../../../base/common/uri.js';
import { Attributes, CandidatePort, TunnelCloseReason, TunnelModel, TunnelProperties, TunnelSource } from './tunnelModel.js';
import { IExtensionPointUser } from '../../extensions/common/extensionsRegistry.js';
import { IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
export declare const IRemoteExplorerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRemoteExplorerService>;
export declare const REMOTE_EXPLORER_TYPE_KEY: string;
export declare const TUNNEL_VIEW_ID = "~remote.forwardedPorts";
export declare const TUNNEL_VIEW_CONTAINER_ID = "~remote.forwardedPortsContainer";
export declare const PORT_AUTO_FORWARD_SETTING = "remote.autoForwardPorts";
export declare const PORT_AUTO_SOURCE_SETTING = "remote.autoForwardPortsSource";
export declare const PORT_AUTO_FALLBACK_SETTING = "remote.autoForwardPortsFallback";
export declare const PORT_AUTO_SOURCE_SETTING_PROCESS = "process";
export declare const PORT_AUTO_SOURCE_SETTING_OUTPUT = "output";
export declare const PORT_AUTO_SOURCE_SETTING_HYBRID = "hybrid";
export declare enum TunnelType {
    Candidate = "Candidate",
    Detected = "Detected",
    Forwarded = "Forwarded",
    Add = "Add"
}
export interface ITunnelItem {
    tunnelType: TunnelType;
    remoteHost: string;
    remotePort: number;
    localAddress?: string;
    protocol: TunnelProtocol;
    localUri?: URI;
    localPort?: number;
    name?: string;
    closeable?: boolean;
    source: {
        source: TunnelSource;
        description: string;
    };
    privacy: TunnelPrivacy;
    processDescription?: string;
    readonly label: string;
}
export declare enum TunnelEditId {
    None = 0,
    New = 1,
    Label = 2,
    LocalPort = 3
}
export interface HelpInformation {
    extensionDescription: IExtensionDescription;
    getStarted?: string | {
        id: string;
    };
    documentation?: string;
    issues?: string;
    reportIssue?: string;
    remoteName?: string[] | string;
    virtualWorkspace?: string;
}
export declare enum PortsEnablement {
    Disabled = 0,
    ViewOnly = 1,
    AdditionalFeatures = 2
}
export interface IRemoteExplorerService {
    readonly _serviceBrand: undefined;
    onDidChangeTargetType: Event<string[]>;
    targetType: string[];
    onDidChangeHelpInformation: Event<readonly IExtensionPointUser<HelpInformation>[]>;
    helpInformation: IExtensionPointUser<HelpInformation>[];
    readonly tunnelModel: TunnelModel;
    onDidChangeEditable: Event<{
        tunnel: ITunnelItem;
        editId: TunnelEditId;
    } | undefined>;
    setEditable(tunnelItem: ITunnelItem | undefined, editId: TunnelEditId, data: IEditableData | null): void;
    getEditableData(tunnelItem: ITunnelItem | undefined, editId?: TunnelEditId): IEditableData | undefined;
    forward(tunnelProperties: TunnelProperties, attributes?: Attributes | null): Promise<RemoteTunnel | string | undefined>;
    close(remote: {
        host: string;
        port: number;
    }, reason: TunnelCloseReason): Promise<void>;
    setTunnelInformation(tunnelInformation: TunnelInformation | undefined): void;
    setCandidateFilter(filter: ((candidates: CandidatePort[]) => Promise<CandidatePort[]>) | undefined): IDisposable;
    onFoundNewCandidates(candidates: CandidatePort[]): void;
    restore(): Promise<void>;
    enablePortsFeatures(viewOnly: boolean): void;
    onEnabledPortsFeatures: Event<void>;
    portsFeaturesEnabled: PortsEnablement;
    readonly namedProcesses: Map<number, string>;
}
