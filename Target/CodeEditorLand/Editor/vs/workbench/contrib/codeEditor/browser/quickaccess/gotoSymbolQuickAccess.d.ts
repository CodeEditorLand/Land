import { IKeyMods, IQuickPickSeparator, IQuickPick } from '../../../../../platform/quickinput/common/quickInput.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IRange } from '../../../../../editor/common/core/range.js';
import { AbstractGotoSymbolQuickAccessProvider, IGotoSymbolQuickPickItem } from '../../../../../editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { DisposableStore, IDisposable } from '../../../../../base/common/lifecycle.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { IQuickAccessTextEditorContext } from '../../../../../editor/contrib/quickAccess/browser/editorNavigationQuickAccess.js';
import { IOutlineService } from '../../../../services/outline/browser/outline.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IOutlineModelService } from '../../../../../editor/contrib/documentSymbols/browser/outlineModel.js';
import { ILanguageFeaturesService } from '../../../../../editor/common/services/languageFeatures.js';
export declare class GotoSymbolQuickAccessProvider extends AbstractGotoSymbolQuickAccessProvider {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly configurationService;
    private readonly outlineService;
    protected readonly onDidActiveTextEditorControlChange: import("../../../../workbench.web.main.internal.js").Event<void>;
    constructor(editorService: IEditorService, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService, languageFeaturesService: ILanguageFeaturesService, outlineService: IOutlineService, outlineModelService: IOutlineModelService);
    private get configuration();
    protected get activeTextEditorControl(): import("../../../../../editor/common/editorCommon.js").IEditor | undefined;
    protected gotoLocation(context: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
    private static readonly SYMBOL_PICKS_TIMEOUT;
    getSymbolPicks(model: ITextModel, filter: string, options: {
        extraContainerLabel?: string;
    }, disposables: DisposableStore, token: CancellationToken): Promise<Array<IGotoSymbolQuickPickItem | IQuickPickSeparator>>;
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoSymbolQuickPickItem, {
        useSeparators: true;
    }>): IDisposable;
    private canPickWithOutlineService;
    private doGetOutlinePicks;
}
