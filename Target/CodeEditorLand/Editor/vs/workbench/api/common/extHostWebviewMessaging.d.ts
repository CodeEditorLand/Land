import { VSBuffer } from '../../../base/common/buffer.js';
export declare function serializeWebviewMessage(message: any, options: {
    serializeBuffersForPostMessage?: boolean;
}): {
    message: string;
    buffers: VSBuffer[];
};
export declare function deserializeWebviewMessage(jsonMessage: string, buffers: VSBuffer[]): {
    message: any;
    arrayBuffers: ArrayBuffer[];
};
