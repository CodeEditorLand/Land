import { IClipboardService } from '../../../../../../platform/clipboard/common/clipboardService.js';
import { ILogService } from '../../../../../../platform/log/common/log.js';
import { ICellOutputViewModel } from '../../notebookBrowser.js';
export declare function copyCellOutput(mimeType: string | undefined, outputViewModel: ICellOutputViewModel, clipboardService: IClipboardService, logService: ILogService): Promise<void>;
export declare const TEXT_BASED_MIMETYPES: string[];
