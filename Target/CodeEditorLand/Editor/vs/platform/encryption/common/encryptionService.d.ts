export declare const IEncryptionService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IEncryptionService>;
export interface IEncryptionService extends ICommonEncryptionService {
    setUsePlainTextEncryption(): Promise<void>;
    getKeyStorageProvider(): Promise<KnownStorageProvider>;
}
export declare const IEncryptionMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IEncryptionMainService>;
export interface IEncryptionMainService extends IEncryptionService {
}
export interface ICommonEncryptionService {
    readonly _serviceBrand: undefined;
    encrypt(value: string): Promise<string>;
    decrypt(value: string): Promise<string>;
    isEncryptionAvailable(): Promise<boolean>;
}
export declare const enum PasswordStoreCLIOption {
    kwallet = "kwallet",
    kwallet5 = "kwallet5",
    gnomeLibsecret = "gnome-libsecret",
    basic = "basic"
}
export declare const enum KnownStorageProvider {
    unknown = "unknown",
    basicText = "basic_text",
    gnomeAny = "gnome_any",
    gnomeLibsecret = "gnome_libsecret",
    gnomeKeyring = "gnome_keyring",
    kwallet = "kwallet",
    kwallet5 = "kwallet5",
    kwallet6 = "kwallet6",
    dplib = "dpapi",
    keychainAccess = "keychain_access"
}
export declare function isKwallet(backend: string): boolean;
export declare function isGnome(backend: string): boolean;
