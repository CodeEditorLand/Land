import { Emitter } from '../../../base/common/event.js';
import { MainContext } from './extHost.protocol.js';
import { ExtHostNotebookEditor } from './extHostNotebookEditor.js';
export class ExtHostNotebookRenderers {
    constructor(mainContext, _extHostNotebook) {
        this._extHostNotebook = _extHostNotebook;
        this._rendererMessageEmitters = new Map();
        this.proxy = mainContext.getProxy(MainContext.MainThreadNotebookRenderers);
    }
    $postRendererMessage(editorId, rendererId, message) {
        const editor = this._extHostNotebook.getEditorById(editorId);
        this._rendererMessageEmitters.get(rendererId)?.fire({ editor: editor.apiEditor, message });
    }
    createRendererMessaging(manifest, rendererId) {
        if (!manifest.contributes?.notebookRenderer?.some(r => r.id === rendererId)) {
            throw new Error(`Extensions may only call createRendererMessaging() for renderers they contribute (got ${rendererId})`);
        }
        const messaging = {
            onDidReceiveMessage: (listener, thisArg, disposables) => {
                return this.getOrCreateEmitterFor(rendererId).event(listener, thisArg, disposables);
            },
            postMessage: (message, editorOrAlias) => {
                if (ExtHostNotebookEditor.apiEditorsToExtHost.has(message)) {
                    [message, editorOrAlias] = [editorOrAlias, message];
                }
                const extHostEditor = editorOrAlias && ExtHostNotebookEditor.apiEditorsToExtHost.get(editorOrAlias);
                return this.proxy.$postMessage(extHostEditor?.id, rendererId, message);
            },
        };
        return messaging;
    }
    getOrCreateEmitterFor(rendererId) {
        let emitter = this._rendererMessageEmitters.get(rendererId);
        if (emitter) {
            return emitter;
        }
        emitter = new Emitter({
            onDidRemoveLastListener: () => {
                emitter?.dispose();
                this._rendererMessageEmitters.delete(rendererId);
            }
        });
        this._rendererMessageEmitters.set(rendererId, emitter);
        return emitter;
    }
}
