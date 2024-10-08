import { ExtHostSecretStateShape } from './extHost.protocol.js';
import { IExtHostRpcService } from './extHostRpcService.js';
export declare class ExtHostSecretState implements ExtHostSecretStateShape {
    private _proxy;
    private _onDidChangePassword;
    readonly onDidChangePassword: import("../../workbench.web.main.internal.js").Event<{
        extensionId: string;
        key: string;
    }>;
    constructor(mainContext: IExtHostRpcService);
    $onDidChangePassword(e: {
        extensionId: string;
        key: string;
    }): Promise<void>;
    get(extensionId: string, key: string): Promise<string | undefined>;
    store(extensionId: string, key: string, value: string): Promise<void>;
    delete(extensionId: string, key: string): Promise<void>;
}
export interface IExtHostSecretState extends ExtHostSecretState {
}
export declare const IExtHostSecretState: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostSecretState>;
