import { Emitter } from '../../../../../base/common/event.js';
export class TerminalLinkProviderService {
    constructor() {
        this._linkProviders = new Set();
        this._onDidAddLinkProvider = new Emitter();
        this._onDidRemoveLinkProvider = new Emitter();
    }
    get linkProviders() { return this._linkProviders; }
    get onDidAddLinkProvider() { return this._onDidAddLinkProvider.event; }
    get onDidRemoveLinkProvider() { return this._onDidRemoveLinkProvider.event; }
    registerLinkProvider(linkProvider) {
        const disposables = [];
        this._linkProviders.add(linkProvider);
        this._onDidAddLinkProvider.fire(linkProvider);
        return {
            dispose: () => {
                for (const disposable of disposables) {
                    disposable.dispose();
                }
                this._linkProviders.delete(linkProvider);
                this._onDidRemoveLinkProvider.fire(linkProvider);
            }
        };
    }
}
