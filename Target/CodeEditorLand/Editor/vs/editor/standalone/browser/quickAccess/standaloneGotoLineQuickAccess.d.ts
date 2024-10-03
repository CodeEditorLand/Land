import { AbstractGotoLineQuickAccessProvider } from '../../../contrib/quickAccess/browser/gotoLineQuickAccess.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { Event } from '../../../../base/common/event.js';
import { EditorAction, ServicesAccessor } from '../../../browser/editorExtensions.js';
export declare class StandaloneGotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {
    private readonly editorService;
    protected readonly onDidActiveTextEditorControlChange: Event<any>;
    constructor(editorService: ICodeEditorService);
    protected get activeTextEditorControl(): import("../../../browser/editorBrowser.js").ICodeEditor | undefined;
}
export declare class GotoLineAction extends EditorAction {
    static readonly ID = "editor.action.gotoLine";
    constructor();
    run(accessor: ServicesAccessor): void;
}
