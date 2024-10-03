import { app } from 'electron';
import { disposableTimeout } from '../../../base/common/async.js';
import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { isWindows } from '../../../base/common/platform.js';
import { URI } from '../../../base/common/uri.js';
export class ElectronURLListener extends Disposable {
    constructor(initialProtocolUrls, urlService, windowsMainService, environmentMainService, productService, logService) {
        super();
        this.urlService = urlService;
        this.logService = logService;
        this.uris = [];
        this.retryCount = 0;
        if (initialProtocolUrls) {
            logService.trace('ElectronURLListener initialUrisToHandle:', initialProtocolUrls.map(url => url.originalUrl));
            this.uris = initialProtocolUrls;
        }
        if (isWindows) {
            const windowsParameters = environmentMainService.isBuilt ? [] : [`"${environmentMainService.appRoot}"`];
            windowsParameters.push('--open-url', '--');
            app.setAsDefaultProtocolClient(productService.urlProtocol, process.execPath, windowsParameters);
        }
        const onOpenElectronUrl = Event.map(Event.fromNodeEventEmitter(app, 'open-url', (event, url) => ({ event, url })), ({ event, url }) => {
            event.preventDefault();
            return url;
        });
        this._register(onOpenElectronUrl(url => {
            const uri = this.uriFromRawUrl(url);
            if (!uri) {
                return;
            }
            this.urlService.open(uri, { originalUrl: url });
        }));
        const isWindowReady = windowsMainService.getWindows()
            .filter(window => window.isReady)
            .length > 0;
        if (isWindowReady) {
            logService.trace('ElectronURLListener: window is ready to handle URLs');
            this.flush();
        }
        else {
            logService.trace('ElectronURLListener: waiting for window to be ready to handle URLs...');
            this._register(Event.once(windowsMainService.onDidSignalReadyWindow)(() => this.flush()));
        }
    }
    uriFromRawUrl(url) {
        try {
            return URI.parse(url);
        }
        catch (e) {
            return undefined;
        }
    }
    async flush() {
        if (this.retryCount++ > 10) {
            this.logService.trace('ElectronURLListener#flush(): giving up after 10 retries');
            return;
        }
        this.logService.trace('ElectronURLListener#flush(): flushing URLs');
        const uris = [];
        for (const obj of this.uris) {
            const handled = await this.urlService.open(obj.uri, { originalUrl: obj.originalUrl });
            if (handled) {
                this.logService.trace('ElectronURLListener#flush(): URL was handled', obj.originalUrl);
            }
            else {
                this.logService.trace('ElectronURLListener#flush(): URL was not yet handled', obj.originalUrl);
                uris.push(obj);
            }
        }
        if (uris.length === 0) {
            return;
        }
        this.uris = uris;
        disposableTimeout(() => this.flush(), 500, this._store);
    }
}
