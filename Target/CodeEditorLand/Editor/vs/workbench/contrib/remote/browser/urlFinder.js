import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { removeAnsiEscapeCodes } from '../../../../base/common/strings.js';
export class UrlFinder extends Disposable {
    static { this.localUrlRegex = /\b\w{0,20}(?::\/\/)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0|:\d{2,5})[\w\-\.\~:\/\?\#[\]\@!\$&\(\)\*\+\,\;\=]*/gim; }
    static { this.extractPortRegex = /(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d{1,5})/; }
    static { this.localPythonServerRegex = /HTTP\son\s(127\.0\.0\.1|0\.0\.0\.0)\sport\s(\d+)/; }
    static { this.excludeTerminals = ['Dev Containers']; }
    constructor(terminalService, debugService) {
        super();
        this._onDidMatchLocalUrl = new Emitter();
        this.onDidMatchLocalUrl = this._onDidMatchLocalUrl.event;
        this.listeners = new Map();
        this.replPositions = new Map();
        terminalService.instances.forEach(instance => {
            this.registerTerminalInstance(instance);
        });
        this._register(terminalService.onDidCreateInstance(instance => {
            this.registerTerminalInstance(instance);
        }));
        this._register(terminalService.onDidDisposeInstance(instance => {
            this.listeners.get(instance)?.dispose();
            this.listeners.delete(instance);
        }));
        this._register(debugService.onDidNewSession(session => {
            if (!session.parentSession || (session.parentSession && session.hasSeparateRepl())) {
                this.listeners.set(session.getId(), session.onDidChangeReplElements(() => {
                    this.processNewReplElements(session);
                }));
            }
        }));
        this._register(debugService.onDidEndSession(({ session }) => {
            if (this.listeners.has(session.getId())) {
                this.listeners.get(session.getId())?.dispose();
                this.listeners.delete(session.getId());
            }
        }));
    }
    registerTerminalInstance(instance) {
        if (!UrlFinder.excludeTerminals.includes(instance.title)) {
            this.listeners.set(instance, instance.onData(data => {
                this.processData(data);
            }));
        }
    }
    processNewReplElements(session) {
        const oldReplPosition = this.replPositions.get(session.getId());
        const replElements = session.getReplElements();
        this.replPositions.set(session.getId(), { position: replElements.length - 1, tail: replElements[replElements.length - 1] });
        if (!oldReplPosition && replElements.length > 0) {
            replElements.forEach(element => this.processData(element.toString()));
        }
        else if (oldReplPosition && (replElements.length - 1 !== oldReplPosition.position)) {
            for (let i = replElements.length - 1; i >= 0; i--) {
                const element = replElements[i];
                if (element === oldReplPosition.tail) {
                    break;
                }
                else {
                    this.processData(element.toString());
                }
            }
        }
    }
    dispose() {
        super.dispose();
        const listeners = this.listeners.values();
        for (const listener of listeners) {
            listener.dispose();
        }
    }
    processData(data) {
        data = removeAnsiEscapeCodes(data);
        const urlMatches = data.match(UrlFinder.localUrlRegex) || [];
        if (urlMatches && urlMatches.length > 0) {
            urlMatches.forEach((match) => {
                let serverUrl;
                try {
                    serverUrl = new URL(match);
                }
                catch (e) {
                }
                if (serverUrl) {
                    const portMatch = match.match(UrlFinder.extractPortRegex);
                    const port = parseFloat(serverUrl.port ? serverUrl.port : (portMatch ? portMatch[2] : 'NaN'));
                    if (!isNaN(port) && Number.isInteger(port) && port > 0 && port <= 65535) {
                        let host = serverUrl.hostname;
                        if (host !== '0.0.0.0' && host !== '127.0.0.1') {
                            host = 'localhost';
                        }
                        if (port !== 9229 && data.startsWith('Debugger listening on')) {
                            return;
                        }
                        this._onDidMatchLocalUrl.fire({ port, host });
                    }
                }
            });
        }
        else {
            const pythonMatch = data.match(UrlFinder.localPythonServerRegex);
            if (pythonMatch && pythonMatch.length === 3) {
                this._onDidMatchLocalUrl.fire({ host: pythonMatch[1], port: Number(pythonMatch[2]) });
            }
        }
    }
}
