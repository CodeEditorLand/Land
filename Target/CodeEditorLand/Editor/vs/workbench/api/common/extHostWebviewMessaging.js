import { VSBuffer } from '../../../base/common/buffer.js';
class ArrayBufferSet {
    constructor() {
        this.buffers = [];
    }
    add(buffer) {
        let index = this.buffers.indexOf(buffer);
        if (index < 0) {
            index = this.buffers.length;
            this.buffers.push(buffer);
        }
        return index;
    }
}
export function serializeWebviewMessage(message, options) {
    if (options.serializeBuffersForPostMessage) {
        const arrayBuffers = new ArrayBufferSet();
        const replacer = (_key, value) => {
            if (value instanceof ArrayBuffer) {
                const index = arrayBuffers.add(value);
                return {
                    $$vscode_array_buffer_reference$$: true,
                    index,
                };
            }
            else if (ArrayBuffer.isView(value)) {
                const type = getTypedArrayType(value);
                if (type) {
                    const index = arrayBuffers.add(value.buffer);
                    return {
                        $$vscode_array_buffer_reference$$: true,
                        index,
                        view: {
                            type: type,
                            byteLength: value.byteLength,
                            byteOffset: value.byteOffset,
                        }
                    };
                }
            }
            return value;
        };
        const serializedMessage = JSON.stringify(message, replacer);
        const buffers = arrayBuffers.buffers.map(arrayBuffer => {
            const bytes = new Uint8Array(arrayBuffer);
            return VSBuffer.wrap(bytes);
        });
        return { message: serializedMessage, buffers };
    }
    else {
        return { message: JSON.stringify(message), buffers: [] };
    }
}
function getTypedArrayType(value) {
    switch (value.constructor.name) {
        case 'Int8Array': return 1;
        case 'Uint8Array': return 2;
        case 'Uint8ClampedArray': return 3;
        case 'Int16Array': return 4;
        case 'Uint16Array': return 5;
        case 'Int32Array': return 6;
        case 'Uint32Array': return 7;
        case 'Float32Array': return 8;
        case 'Float64Array': return 9;
        case 'BigInt64Array': return 10;
        case 'BigUint64Array': return 11;
    }
    return undefined;
}
export function deserializeWebviewMessage(jsonMessage, buffers) {
    const arrayBuffers = buffers.map(buffer => {
        const arrayBuffer = new ArrayBuffer(buffer.byteLength);
        const uint8Array = new Uint8Array(arrayBuffer);
        uint8Array.set(buffer.buffer);
        return arrayBuffer;
    });
    const reviver = !buffers.length ? undefined : (_key, value) => {
        if (value && typeof value === 'object' && value.$$vscode_array_buffer_reference$$) {
            const ref = value;
            const { index } = ref;
            const arrayBuffer = arrayBuffers[index];
            if (ref.view) {
                switch (ref.view.type) {
                    case 1: return new Int8Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int8Array.BYTES_PER_ELEMENT);
                    case 2: return new Uint8Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint8Array.BYTES_PER_ELEMENT);
                    case 3: return new Uint8ClampedArray(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint8ClampedArray.BYTES_PER_ELEMENT);
                    case 4: return new Int16Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int16Array.BYTES_PER_ELEMENT);
                    case 5: return new Uint16Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint16Array.BYTES_PER_ELEMENT);
                    case 6: return new Int32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int32Array.BYTES_PER_ELEMENT);
                    case 7: return new Uint32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint32Array.BYTES_PER_ELEMENT);
                    case 8: return new Float32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Float32Array.BYTES_PER_ELEMENT);
                    case 9: return new Float64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Float64Array.BYTES_PER_ELEMENT);
                    case 10: return new BigInt64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / BigInt64Array.BYTES_PER_ELEMENT);
                    case 11: return new BigUint64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / BigUint64Array.BYTES_PER_ELEMENT);
                    default: throw new Error('Unknown array buffer view type');
                }
            }
            return arrayBuffer;
        }
        return value;
    };
    const message = JSON.parse(jsonMessage, reviver);
    return { message, arrayBuffers };
}
