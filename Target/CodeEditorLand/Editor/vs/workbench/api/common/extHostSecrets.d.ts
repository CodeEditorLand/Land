import type * as vscode from 'vscode';
import { ExtHostSecretState } from './extHostSecretState.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { Event } from '../../../base/common/event.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
export declare class ExtensionSecrets implements vscode.SecretStorage {
    #private;
    protected readonly _id: string;
    readonly onDidChange: Event<vscode.SecretStorageChangeEvent>;
    readonly disposables: DisposableStore;
    constructor(extensionDescription: IExtensionDescription, secretState: ExtHostSecretState);
    dispose(): void;
    get(key: string): Promise<string | undefined>;
    store(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
