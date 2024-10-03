class NotebookLogger {
    constructor() {
        this._frameId = 0;
        this._domFrameLog();
    }
    _domFrameLog() {
    }
    debug(...args) {
        const date = new Date();
        console.log(`${date.getSeconds()}:${date.getMilliseconds().toString().padStart(3, '0')}`, `frame #${this._frameId}: `, ...args);
    }
}
const instance = new NotebookLogger();
export function notebookDebug(...args) {
    instance.debug(...args);
}
