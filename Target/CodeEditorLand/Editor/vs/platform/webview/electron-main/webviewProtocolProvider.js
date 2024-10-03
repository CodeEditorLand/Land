import { protocol } from 'electron';
import { Disposable } from '../../../base/common/lifecycle.js';
import { COI, FileAccess, Schemas } from '../../../base/common/network.js';
import { URI } from '../../../base/common/uri.js';
export class WebviewProtocolProvider extends Disposable {
    static { this.validWebviewFilePaths = new Map([
        ['/index.html', 'index.html'],
        ['/fake.html', 'fake.html'],
        ['/service-worker.js', 'service-worker.js'],
    ]); }
    constructor() {
        super();
        const webviewHandler = this.handleWebviewRequest.bind(this);
        protocol.registerFileProtocol(Schemas.vscodeWebview, webviewHandler);
    }
    handleWebviewRequest(request, callback) {
        try {
            const uri = URI.parse(request.url);
            const entry = WebviewProtocolProvider.validWebviewFilePaths.get(uri.path);
            if (typeof entry === 'string') {
                const relativeResourcePath = `vs/workbench/contrib/webview/browser/pre/${entry}`;
                const url = FileAccess.asFileUri(relativeResourcePath);
                return callback({
                    path: url.fsPath,
                    headers: {
                        ...COI.getHeadersFromQuery(request.url),
                        'Cross-Origin-Resource-Policy': 'cross-origin'
                    }
                });
            }
            else {
                return callback({ error: -10 });
            }
        }
        catch {
        }
        return callback({ error: -2 });
    }
}
