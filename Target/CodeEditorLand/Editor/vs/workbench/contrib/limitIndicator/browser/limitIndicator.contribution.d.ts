import { Disposable } from '../../../../base/common/lifecycle.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ILanguageStatusService } from '../../../services/languageStatus/common/languageStatusService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Event } from '../../../../base/common/event.js';
/**
 * Uses that language status indicator to show information which language features have been limited for performance reasons.
 * Currently this is used for folding ranges and for color decorators.
 */
export declare class LimitIndicatorContribution extends Disposable implements IWorkbenchContribution {
    constructor(editorService: IEditorService, languageStatusService: ILanguageStatusService);
}
export interface LimitInfo {
    readonly onDidChange: Event<void>;
    readonly computed: number;
    readonly limited: number | false;
}
