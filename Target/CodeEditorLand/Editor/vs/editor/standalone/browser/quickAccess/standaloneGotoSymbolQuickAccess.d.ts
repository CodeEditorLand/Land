import '../../../../base/browser/ui/codicons/codiconStyles.js';
import '../../../contrib/symbolIcons/browser/symbolIcons.js';
import { AbstractGotoSymbolQuickAccessProvider } from '../../../contrib/quickAccess/browser/gotoSymbolQuickAccess.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { Event } from '../../../../base/common/event.js';
import { EditorAction } from '../../../browser/editorExtensions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IOutlineModelService } from '../../../contrib/documentSymbols/browser/outlineModel.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
export declare class StandaloneGotoSymbolQuickAccessProvider extends AbstractGotoSymbolQuickAccessProvider {
    private readonly editorService;
    protected readonly onDidActiveTextEditorControlChange: Event<any>;
    constructor(editorService: ICodeEditorService, languageFeaturesService: ILanguageFeaturesService, outlineModelService: IOutlineModelService);
    protected get activeTextEditorControl(): import("../../../browser/editorBrowser.js").ICodeEditor | undefined;
}
export declare class GotoSymbolAction extends EditorAction {
    static readonly ID = "editor.action.quickOutline";
    constructor();
    run(accessor: ServicesAccessor): void;
}
