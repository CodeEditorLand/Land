import { createDecorator } from '../../instantiation/common/instantiation.js';
export const IEncryptionService = createDecorator('encryptionService');
export const IEncryptionMainService = createDecorator('encryptionMainService');
export function isKwallet(backend) {
    return backend === "kwallet"
        || backend === "kwallet5"
        || backend === "kwallet6";
}
export function isGnome(backend) {
    return backend === "gnome_any"
        || backend === "gnome_libsecret"
        || backend === "gnome_keyring";
}
