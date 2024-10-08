import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ISpeechService } from '../common/speechService.js';
export declare class SpeechAccessibilitySignalContribution extends Disposable implements IWorkbenchContribution {
    private readonly _accessibilitySignalService;
    private readonly _speechService;
    static readonly ID = "workbench.contrib.speechAccessibilitySignal";
    constructor(_accessibilitySignalService: IAccessibilitySignalService, _speechService: ISpeechService);
}
