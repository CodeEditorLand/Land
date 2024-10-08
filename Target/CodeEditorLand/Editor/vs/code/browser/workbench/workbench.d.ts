import { ISecretStorageProvider } from '../../../platform/secrets/common/secrets.js';
interface ISecretStorageCrypto {
    seal(data: string): Promise<string>;
    unseal(data: string): Promise<string>;
}
export declare class LocalStorageSecretStorageProvider implements ISecretStorageProvider {
    private readonly crypto;
    private readonly _storageKey;
    private _secretsPromise;
    type: 'in-memory' | 'persisted' | 'unknown';
    constructor(crypto: ISecretStorageCrypto);
    private load;
    private loadAuthSessionFromElement;
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    private save;
}
export {};
