import { Disposable } from '../../../../base/common/lifecycle.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IDebugService } from '../../debug/common/debug.js';
export declare class DebugExtensionHostAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class DebugExtensionsContribution extends Disposable implements IWorkbenchContribution {
    private readonly _debugService;
    private readonly _instantiationService;
    constructor(_debugService: IDebugService, _instantiationService: IInstantiationService, _progressService: IProgressService);
}
