import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { type IWorkbenchContribution } from '../../../../common/contributions.js';
import { ITerminalInstanceService } from '../../../terminal/browser/terminal.js';
export declare class TerminalAutoRepliesContribution extends Disposable implements IWorkbenchContribution {
    private readonly _configurationService;
    static ID: string;
    constructor(_configurationService: IConfigurationService, terminalInstanceService: ITerminalInstanceService);
    private _installListenersOnBackend;
}
