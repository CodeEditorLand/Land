import { MainThreadClipboardShape } from '../common/extHost.protocol.js';
import { IClipboardService } from '../../../platform/clipboard/common/clipboardService.js';
export declare class MainThreadClipboard implements MainThreadClipboardShape {
    private readonly _clipboardService;
    constructor(_context: any, _clipboardService: IClipboardService);
    dispose(): void;
    $readText(): Promise<string>;
    $writeText(value: string): Promise<void>;
}
