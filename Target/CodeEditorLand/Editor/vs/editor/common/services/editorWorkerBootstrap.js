import { SimpleWorkerServer } from '../../../base/common/worker/simpleWorker.js';
import { EditorSimpleWorker } from './editorSimpleWorker.js';
import { EditorWorkerHost } from './editorWorkerHost.js';
let initialized = false;
export function initialize(factory) {
    if (initialized) {
        return;
    }
    initialized = true;
    const simpleWorker = new SimpleWorkerServer((msg) => {
        globalThis.postMessage(msg);
    }, (workerServer) => new EditorSimpleWorker(EditorWorkerHost.getChannel(workerServer), null));
    globalThis.onmessage = (e) => {
        simpleWorker.onmessage(e.data);
    };
}
globalThis.onmessage = (e) => {
    if (!initialized) {
        initialize(null);
    }
};
export function bootstrapSimpleEditorWorker(createFn) {
    globalThis.onmessage = () => {
        initialize((ctx, createData) => {
            return createFn.call(self, ctx, createData);
        });
    };
}
