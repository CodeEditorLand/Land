import { Disposable } from '../../../../base/common/lifecycle.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IChatAgentService } from '../common/chatAgents.js';
import { IChatEditingService } from '../common/chatEditingService.js';
export declare class ChatEditorSaving extends Disposable implements IWorkbenchContribution {
    private readonly _dialogService;
    private readonly _storageService;
    private readonly _fileConfigService;
    static readonly ID: string;
    private readonly _sessionStore;
    constructor(chatEditingService: IChatEditingService, chatAgentService: IChatAgentService, textFileService: ITextFileService, labelService: ILabelService, _dialogService: IDialogService, _storageService: IStorageService, _fileConfigService: IFilesConfigurationService);
    private _handleNewEditingSession;
}
