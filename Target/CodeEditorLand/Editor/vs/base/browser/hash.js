import { VSBuffer } from '../common/buffer.js';
import { StringSHA1, toHexString } from '../common/hash.js';
export async function sha1Hex(str) {
    if (globalThis?.crypto?.subtle) {
        const buffer = VSBuffer.fromString(str, { dontUseNodeBuffer: true }).buffer;
        const hash = await globalThis.crypto.subtle.digest({ name: 'sha-1' }, buffer);
        return toHexString(hash);
    }
    else {
        const computer = new StringSHA1();
        computer.update(str);
        return computer.digest();
    }
}
