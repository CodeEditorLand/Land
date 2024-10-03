import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { URI } from '../../../../base/common/uri.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
export declare class NativeClipboardService implements IClipboardService {
    private readonly nativeHostService;
    private static readonly FILE_FORMAT;
    readonly _serviceBrand: undefined;
    constructor(nativeHostService: INativeHostService);
    readImage(): Promise<Uint8Array>;
    writeText(text: string, type?: 'selection' | 'clipboard'): Promise<void>;
    readText(type?: 'selection' | 'clipboard'): Promise<string>;
    readFindText(): Promise<string>;
    writeFindText(text: string): Promise<void>;
    writeResources(resources: URI[]): Promise<void>;
    readResources(): Promise<URI[]>;
    hasResources(): Promise<boolean>;
    private resourcesToBuffer;
    private bufferToResources;
}
