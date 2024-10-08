/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { SimpleWorkerServer } from './simpleWorker.js';
let initialized = false;
function initialize(factory) {
    if (initialized) {
        return;
    }
    initialized = true;
    const simpleWorker = new SimpleWorkerServer(msg => globalThis.postMessage(msg), (workerServer) => factory(workerServer));
    globalThis.onmessage = (e) => {
        simpleWorker.onmessage(e.data);
    };
}
export function bootstrapSimpleWorker(factory) {
    globalThis.onmessage = (_e) => {
        // Ignore first message in this case and initialize if not yet initialized
        if (!initialized) {
            initialize(factory);
        }
    };
}
