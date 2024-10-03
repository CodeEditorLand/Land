import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { DisposableStore, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { FastAndSlowPicks, IPickerQuickAccessItem, PickerQuickAccessProvider, Picks } from '../../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { DefaultQuickAccessFilterValue, IQuickAccessProviderRunOptions } from '../../../../../platform/quickinput/common/quickAccess.js';
import { IQuickPick, IQuickPickItem } from '../../../../../platform/quickinput/common/quickInput.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { Match } from '../searchModel.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
export declare const TEXT_SEARCH_QUICK_ACCESS_PREFIX = "%";
interface ITextSearchQuickAccessItem extends IPickerQuickAccessItem {
    match?: Match;
}
export declare class TextSearchQuickAccess extends PickerQuickAccessProvider<ITextSearchQuickAccessItem> {
    private readonly _instantiationService;
    private readonly _contextService;
    private readonly _editorService;
    private readonly _labelService;
    private readonly _viewsService;
    private readonly _configurationService;
    private editorSequencer;
    private queryBuilder;
    private searchModel;
    private currentAsyncSearch;
    private readonly editorViewState;
    private _getTextQueryBuilderOptions;
    constructor(_instantiationService: IInstantiationService, _contextService: IWorkspaceContextService, _editorService: IEditorService, _labelService: ILabelService, _viewsService: IViewsService, _configurationService: IConfigurationService);
    dispose(): void;
    provide(picker: IQuickPick<ITextSearchQuickAccessItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    private get configuration();
    get defaultFilterValue(): DefaultQuickAccessFilterValue | undefined;
    private doSearch;
    private moveToSearchViewlet;
    private _getPicksFromMatches;
    private handleAccept;
    protected _getPicks(contentPattern: string, disposables: DisposableStore, token: CancellationToken): Picks<IQuickPickItem> | Promise<Picks<IQuickPickItem> | FastAndSlowPicks<IQuickPickItem>> | FastAndSlowPicks<IQuickPickItem> | null;
}
export {};
