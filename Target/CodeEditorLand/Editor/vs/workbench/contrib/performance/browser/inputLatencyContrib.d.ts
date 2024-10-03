import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class InputLatencyContrib extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _telemetryService;
    private readonly _listener;
    private readonly _scheduler;
    constructor(_editorService: IEditorService, _telemetryService: ITelemetryService);
    private _setupListener;
    private _logSamples;
}
