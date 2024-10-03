import { addDisposableListener, getWindow } from './dom.js';
import { Disposable } from '../common/lifecycle.js';
import { Mimes } from '../common/mime.js';
export class DelayedDragHandler extends Disposable {
    constructor(container, callback) {
        super();
        this._register(addDisposableListener(container, 'dragover', e => {
            e.preventDefault();
            if (!this.timeout) {
                this.timeout = setTimeout(() => {
                    callback();
                    this.timeout = null;
                }, 800);
            }
        }));
        ['dragleave', 'drop', 'dragend'].forEach(type => {
            this._register(addDisposableListener(container, type, () => {
                this.clearDragTimeout();
            }));
        });
    }
    clearDragTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
    dispose() {
        super.dispose();
        this.clearDragTimeout();
    }
}
export const DataTransfers = {
    RESOURCES: 'ResourceURLs',
    DOWNLOAD_URL: 'DownloadURL',
    FILES: 'Files',
    TEXT: Mimes.text,
    INTERNAL_URI_LIST: 'application/vnd.code.uri-list',
};
export function applyDragImage(event, label, clazz, backgroundColor, foregroundColor) {
    const dragImage = document.createElement('div');
    dragImage.className = clazz;
    dragImage.textContent = label;
    if (foregroundColor) {
        dragImage.style.color = foregroundColor;
    }
    if (backgroundColor) {
        dragImage.style.background = backgroundColor;
    }
    if (event.dataTransfer) {
        const ownerDocument = getWindow(event).document;
        ownerDocument.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, -10, -10);
        setTimeout(() => dragImage.remove(), 0);
    }
}
