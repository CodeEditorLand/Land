import { ViewEventHandler } from '../../common/viewEventHandler.js';
export class ViewPart extends ViewEventHandler {
    constructor(context) {
        super();
        this._context = context;
        this._context.addEventHandler(this);
    }
    dispose() {
        this._context.removeEventHandler(this);
        super.dispose();
    }
}
export class PartFingerprints {
    static write(target, partId) {
        target.setAttribute('data-mprt', String(partId));
    }
    static read(target) {
        const r = target.getAttribute('data-mprt');
        if (r === null) {
            return 0;
        }
        return parseInt(r, 10);
    }
    static collect(child, stopAt) {
        const result = [];
        let resultLen = 0;
        while (child && child !== child.ownerDocument.body) {
            if (child === stopAt) {
                break;
            }
            if (child.nodeType === child.ELEMENT_NODE) {
                result[resultLen++] = this.read(child);
            }
            child = child.parentElement;
        }
        const r = new Uint8Array(resultLen);
        for (let i = 0; i < resultLen; i++) {
            r[i] = result[resultLen - i - 1];
        }
        return r;
    }
}
