import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ITerminalInstanceService } from '../browser/terminal.js';
export declare class LocalTerminalBackendContribution implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.localTerminalBackend";
    constructor(instantiationService: IInstantiationService, terminalInstanceService: ITerminalInstanceService);
}
