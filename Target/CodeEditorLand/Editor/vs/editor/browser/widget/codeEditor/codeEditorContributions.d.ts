import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../editorBrowser.js';
import { IEditorContributionDescription } from '../../editorExtensions.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class CodeEditorContributions extends Disposable {
    private _editor;
    private _instantiationService;
    private readonly _instances;
    private readonly _pending;
    private readonly _finishedInstantiation;
    constructor();
    initialize(editor: ICodeEditor, contributions: IEditorContributionDescription[], instantiationService: IInstantiationService): void;
    saveViewState(): {
        [key: string]: any;
    };
    restoreViewState(contributionsState: {
        [key: string]: any;
    }): void;
    get(id: string): IEditorContribution | null;
    set(id: string, value: IEditorContribution): void;
    onBeforeInteractionEvent(): void;
    onAfterModelAttached(): IDisposable;
    private _instantiateSome;
    private _findPendingContributionsByInstantiation;
    private _instantiateById;
}
