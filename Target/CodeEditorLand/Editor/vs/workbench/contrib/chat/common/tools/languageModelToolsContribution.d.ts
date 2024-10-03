import { ILogService } from '../../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { ILanguageModelToolsService } from '../languageModelToolsService.js';
export declare class LanguageModelToolsExtensionPointHandler implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.toolsExtensionPointHandler";
    private _registrationDisposables;
    constructor(languageModelToolsService: ILanguageModelToolsService, logService: ILogService);
}
