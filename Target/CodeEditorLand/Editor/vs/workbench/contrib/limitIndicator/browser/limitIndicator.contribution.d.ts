import { Disposable } from '../../../../base/common/lifecycle.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ILanguageStatusService } from '../../../services/languageStatus/common/languageStatusService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Event } from '../../../../base/common/event.js';
export declare class LimitIndicatorContribution extends Disposable implements IWorkbenchContribution {
    constructor(editorService: IEditorService, languageStatusService: ILanguageStatusService);
}
export interface LimitInfo {
    readonly onDidChange: Event<void>;
    readonly computed: number;
    readonly limited: number | false;
}
