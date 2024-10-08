/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../instantiation/common/instantiation.js';
export const IEncryptionService = createDecorator('encryptionService');
export const IEncryptionMainService = createDecorator('encryptionMainService');
export function isKwallet(backend) {
    return backend === "kwallet" /* KnownStorageProvider.kwallet */
        || backend === "kwallet5" /* KnownStorageProvider.kwallet5 */
        || backend === "kwallet6" /* KnownStorageProvider.kwallet6 */;
}
export function isGnome(backend) {
    return backend === "gnome_any" /* KnownStorageProvider.gnomeAny */
        || backend === "gnome_libsecret" /* KnownStorageProvider.gnomeLibsecret */
        || backend === "gnome_keyring" /* KnownStorageProvider.gnomeKeyring */;
}
