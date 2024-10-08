/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { safeStorage as safeStorageElectron, app } from 'electron';
import { isMacintosh, isWindows } from '../../../base/common/platform.js';
import { ILogService } from '../../log/common/log.js';
const safeStorage = safeStorageElectron;
let EncryptionMainService = class EncryptionMainService {
    constructor(logService) {
        this.logService = logService;
        // if this commandLine switch is set, the user has opted in to using basic text encryption
        if (app.commandLine.getSwitchValue('password-store') === "basic" /* PasswordStoreCLIOption.basic */) {
            this.logService.trace('[EncryptionMainService] setting usePlainTextEncryption to true...');
            safeStorage.setUsePlainTextEncryption?.(true);
            this.logService.trace('[EncryptionMainService] set usePlainTextEncryption to true');
        }
    }
    async encrypt(value) {
        this.logService.trace('[EncryptionMainService] Encrypting value...');
        try {
            const result = JSON.stringify(safeStorage.encryptString(value));
            this.logService.trace('[EncryptionMainService] Encrypted value.');
            return result;
        }
        catch (e) {
            this.logService.error(e);
            throw e;
        }
    }
    async decrypt(value) {
        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
            if (!parsedValue.data) {
                throw new Error(`[EncryptionMainService] Invalid encrypted value: ${value}`);
            }
            const bufferToDecrypt = Buffer.from(parsedValue.data);
            this.logService.trace('[EncryptionMainService] Decrypting value...');
            const result = safeStorage.decryptString(bufferToDecrypt);
            this.logService.trace('[EncryptionMainService] Decrypted value.');
            return result;
        }
        catch (e) {
            this.logService.error(e);
            throw e;
        }
    }
    isEncryptionAvailable() {
        this.logService.trace('[EncryptionMainService] Checking if encryption is available...');
        const result = safeStorage.isEncryptionAvailable();
        this.logService.trace('[EncryptionMainService] Encryption is available: ', result);
        return Promise.resolve(result);
    }
    getKeyStorageProvider() {
        if (isWindows) {
            return Promise.resolve("dpapi" /* KnownStorageProvider.dplib */);
        }
        if (isMacintosh) {
            return Promise.resolve("keychain_access" /* KnownStorageProvider.keychainAccess */);
        }
        if (safeStorage.getSelectedStorageBackend) {
            try {
                this.logService.trace('[EncryptionMainService] Getting selected storage backend...');
                const result = safeStorage.getSelectedStorageBackend();
                this.logService.trace('[EncryptionMainService] Selected storage backend: ', result);
                return Promise.resolve(result);
            }
            catch (e) {
                this.logService.error(e);
            }
        }
        return Promise.resolve("unknown" /* KnownStorageProvider.unknown */);
    }
    async setUsePlainTextEncryption() {
        if (isWindows) {
            throw new Error('Setting plain text encryption is not supported on Windows.');
        }
        if (isMacintosh) {
            throw new Error('Setting plain text encryption is not supported on macOS.');
        }
        if (!safeStorage.setUsePlainTextEncryption) {
            throw new Error('Setting plain text encryption is not supported.');
        }
        this.logService.trace('[EncryptionMainService] Setting usePlainTextEncryption to true...');
        safeStorage.setUsePlainTextEncryption(true);
        this.logService.trace('[EncryptionMainService] Set usePlainTextEncryption to true');
    }
};
EncryptionMainService = __decorate([
    __param(0, ILogService),
    __metadata("design:paramtypes", [Object])
], EncryptionMainService);
export { EncryptionMainService };
