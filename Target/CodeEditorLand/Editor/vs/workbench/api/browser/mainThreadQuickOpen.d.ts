import { IPickOptions, IQuickInputService } from '../../../platform/quickinput/common/quickInput.js';
import { MainThreadQuickOpenShape, TransferQuickPickItem, TransferQuickInput, IInputBoxOptions, TransferQuickPickItemOrSeparator } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
export declare class MainThreadQuickOpen implements MainThreadQuickOpenShape {
    private readonly _proxy;
    private readonly _quickInputService;
    private readonly _items;
    constructor(extHostContext: IExtHostContext, quickInputService: IQuickInputService);
    dispose(): void;
    $show(instance: number, options: IPickOptions<TransferQuickPickItem>, token: CancellationToken): Promise<number | number[] | undefined>;
    $setItems(instance: number, items: TransferQuickPickItemOrSeparator[]): Promise<void>;
    $setError(instance: number, error: Error): Promise<void>;
    $input(options: IInputBoxOptions | undefined, validateInput: boolean, token: CancellationToken): Promise<string | undefined>;
    private sessions;
    $createOrUpdate(params: TransferQuickInput): Promise<void>;
    $dispose(sessionId: number): Promise<void>;
}
