import { Disposable } from '../common/lifecycle.js';
/**
 * A helper that will execute a provided function when the provided HTMLElement receives
 *  dragover event for 800ms. If the drag is aborted before, the callback will not be triggered.
 */
export declare class DelayedDragHandler extends Disposable {
    private timeout;
    constructor(container: HTMLElement, callback: () => void);
    private clearDragTimeout;
    dispose(): void;
}
export declare const DataTransfers: {
    /**
     * Application specific resource transfer type
     */
    RESOURCES: string;
    /**
     * Browser specific transfer type to download
     */
    DOWNLOAD_URL: string;
    /**
     * Browser specific transfer type for files
     */
    FILES: string;
    /**
     * Typically transfer type for copy/paste transfers.
     */
    TEXT: "text/plain";
    /**
     * Internal type used to pass around text/uri-list data.
     *
     * This is needed to work around https://bugs.chromium.org/p/chromium/issues/detail?id=239745.
     */
    INTERNAL_URI_LIST: string;
};
export declare function applyDragImage(event: DragEvent, label: string | null, clazz: string, backgroundColor?: string | null, foregroundColor?: string | null): void;
export interface IDragAndDropData {
    update(dataTransfer: DataTransfer): void;
    getData(): unknown;
}
