import { URI } from '../../../base/common/uri.js';
export declare const IClipboardService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IClipboardService>;
export interface IClipboardService {
    readonly _serviceBrand: undefined;
    /**
     * Writes text to the system clipboard.
     */
    writeText(text: string, type?: string): Promise<void>;
    /**
     * Reads the content of the clipboard in plain text
     */
    readText(type?: string): Promise<string>;
    /**
     * Reads text from the system find pasteboard.
     */
    readFindText(): Promise<string>;
    /**
     * Writes text to the system find pasteboard.
     */
    writeFindText(text: string): Promise<void>;
    /**
     * Writes resources to the system clipboard.
     */
    writeResources(resources: URI[]): Promise<void>;
    /**
     * Reads resources from the system clipboard.
     */
    readResources(): Promise<URI[]>;
    /**
     * Find out if resources are copied to the clipboard.
     */
    hasResources(): Promise<boolean>;
    /**
     * Resets the internal state of the clipboard (if any) without touching the real clipboard.
     *
     * Used for implementations such as web which do not always support using the real clipboard.
     */
    clearInternalState?(): void;
    /**
     * Reads resources from the system clipboard as an image. If the clipboard does not contain an
     * image, an empty buffer is returned.
     */
    readImage(): Promise<Uint8Array>;
}
