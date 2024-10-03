import { Disposable } from '../common/lifecycle.js';
export declare class DelayedDragHandler extends Disposable {
    private timeout;
    constructor(container: HTMLElement, callback: () => void);
    private clearDragTimeout;
    dispose(): void;
}
export declare const DataTransfers: {
    RESOURCES: string;
    DOWNLOAD_URL: string;
    FILES: string;
    TEXT: "text/plain";
    INTERNAL_URI_LIST: string;
};
export declare function applyDragImage(event: DragEvent, label: string | null, clazz: string, backgroundColor?: string | null, foregroundColor?: string | null): void;
export interface IDragAndDropData {
    update(dataTransfer: DataTransfer): void;
    getData(): unknown;
}
