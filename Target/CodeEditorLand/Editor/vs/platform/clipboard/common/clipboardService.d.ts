import { URI } from '../../../base/common/uri.js';
export declare const IClipboardService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IClipboardService>;
export interface IClipboardService {
    readonly _serviceBrand: undefined;
    writeText(text: string, type?: string): Promise<void>;
    readText(type?: string): Promise<string>;
    readFindText(): Promise<string>;
    writeFindText(text: string): Promise<void>;
    writeResources(resources: URI[]): Promise<void>;
    readResources(): Promise<URI[]>;
    hasResources(): Promise<boolean>;
    clearInternalState?(): void;
    readImage(): Promise<Uint8Array>;
}
