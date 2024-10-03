import { URI } from '../../../base/common/uri.js';
import { MainThreadDiaglogsShape, MainThreadDialogOpenOptions, MainThreadDialogSaveOptions } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IFileDialogService } from '../../../platform/dialogs/common/dialogs.js';
export declare class MainThreadDialogs implements MainThreadDiaglogsShape {
    private readonly _fileDialogService;
    constructor(context: IExtHostContext, _fileDialogService: IFileDialogService);
    dispose(): void;
    $showOpenDialog(options?: MainThreadDialogOpenOptions): Promise<URI[] | undefined>;
    $showSaveDialog(options?: MainThreadDialogSaveOptions): Promise<URI | undefined>;
    private static _convertOpenOptions;
    private static _convertSaveOptions;
}
