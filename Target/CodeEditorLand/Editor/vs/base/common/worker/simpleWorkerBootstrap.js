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
        if (!initialized) {
            initialize(factory);
        }
    };
}
