import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfirmation, IConfirmationResult, IDialogService, IInput, IInputResult, IPrompt, IPromptResult, IPromptResultWithCancel, IPromptWithCustomCancel, IPromptWithDefaultCancel } from '../../../../platform/dialogs/common/dialogs.js';
import { DialogsModel } from '../../../common/dialogs.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class DialogService extends Disposable implements IDialogService {
    private readonly environmentService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    readonly model: DialogsModel;
    readonly onWillShowDialog: import("../../../workbench.web.main.internal.js").Event<void>;
    readonly onDidShowDialog: import("../../../workbench.web.main.internal.js").Event<void>;
    constructor(environmentService: IWorkbenchEnvironmentService, logService: ILogService);
    private skipDialogs;
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    prompt<T>(prompt: IPromptWithCustomCancel<T>): Promise<IPromptResultWithCancel<T>>;
    prompt<T>(prompt: IPromptWithDefaultCancel<T>): Promise<IPromptResult<T>>;
    prompt<T>(prompt: IPrompt<T>): Promise<IPromptResult<T>>;
    input(input: IInput): Promise<IInputResult>;
    info(message: string, detail?: string): Promise<void>;
    warn(message: string, detail?: string): Promise<void>;
    error(message: string, detail?: string): Promise<void>;
    about(): Promise<void>;
}
