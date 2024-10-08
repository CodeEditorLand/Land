import { IListAccessibilityProvider } from '../../../../base/browser/ui/list/listWidget.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
import { CellViewModel, NotebookViewModel } from './viewModel/notebookViewModelImpl.js';
import { INotebookExecutionStateService } from '../common/notebookExecutionStateService.js';
export declare class NotebookAccessibilityProvider extends Disposable implements IListAccessibilityProvider<CellViewModel> {
    private readonly notebookExecutionStateService;
    private readonly viewModel;
    private readonly keybindingService;
    private readonly configurationService;
    private readonly isReplHistory;
    private readonly _onDidAriaLabelChange;
    private readonly onDidAriaLabelChange;
    constructor(notebookExecutionStateService: INotebookExecutionStateService, viewModel: () => NotebookViewModel | undefined, keybindingService: IKeybindingService, configurationService: IConfigurationService, isReplHistory: boolean);
    get verbositySettingId(): AccessibilityVerbositySettingId;
    getAriaLabel(element: CellViewModel): import("../../../../base/common/observable.js").IObservable<string, unknown>;
    private createItemLabel;
    private getLabel;
    private get widgetAriaLabelName();
    getWidgetAriaLabel(): string;
    private mergeEvents;
}
