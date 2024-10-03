var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { groupBy } from '../../../../../base/common/arrays.js';
import { createCancelablePromise } from '../../../../../base/common/async.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Event } from '../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { uppercaseFirstLetter } from '../../../../../base/common/strings.js';
import { localize } from '../../../../../nls.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { IExtensionsWorkbenchService } from '../../../extensions/common/extensions.js';
import { JUPYTER_EXTENSION_ID, KERNEL_RECOMMENDATIONS } from '../notebookBrowser.js';
import { executingStateIcon, selectKernelIcon } from '../notebookIcons.js';
import { INotebookKernelHistoryService, INotebookKernelService } from '../../common/notebookKernelService.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { URI } from '../../../../../base/common/uri.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { SELECT_KERNEL_ID } from '../controller/coreActions.js';
function isKernelPick(item) {
    return 'kernel' in item;
}
function isGroupedKernelsPick(item) {
    return 'kernels' in item;
}
function isSourcePick(item) {
    return 'action' in item;
}
function isInstallExtensionPick(item) {
    return item.id === 'installSuggested' && 'extensionIds' in item;
}
function isSearchMarketplacePick(item) {
    return item.id === 'install';
}
function isKernelSourceQuickPickItem(item) {
    return 'command' in item;
}
function supportAutoRun(item) {
    return 'autoRun' in item && !!item.autoRun;
}
const KERNEL_PICKER_UPDATE_DEBOUNCE = 200;
function toKernelQuickPick(kernel, selected) {
    const res = {
        kernel,
        picked: kernel.id === selected?.id,
        label: kernel.label,
        description: kernel.description,
        detail: kernel.detail
    };
    if (kernel.id === selected?.id) {
        if (!res.description) {
            res.description = localize('current1', "Currently Selected");
        }
        else {
            res.description = localize('current2', "{0} - Currently Selected", res.description);
        }
    }
    return res;
}
class KernelPickerStrategyBase {
    constructor(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _extensionWorkbenchService, _extensionService, _commandService) {
        this._notebookKernelService = _notebookKernelService;
        this._productService = _productService;
        this._quickInputService = _quickInputService;
        this._labelService = _labelService;
        this._logService = _logService;
        this._extensionWorkbenchService = _extensionWorkbenchService;
        this._extensionService = _extensionService;
        this._commandService = _commandService;
    }
    async showQuickPick(editor, wantedId, skipAutoRun) {
        const notebook = editor.textModel;
        const scopedContextKeyService = editor.scopedContextKeyService;
        const matchResult = this._getMatchingResult(notebook);
        const { selected, all } = matchResult;
        let newKernel;
        if (wantedId) {
            for (const candidate of all) {
                if (candidate.id === wantedId) {
                    newKernel = candidate;
                    break;
                }
            }
            if (!newKernel) {
                this._logService.warn(`wanted kernel DOES NOT EXIST, wanted: ${wantedId}, all: ${all.map(k => k.id)}`);
                return false;
            }
        }
        if (newKernel) {
            this._selecteKernel(notebook, newKernel);
            return true;
        }
        const localDisposableStore = new DisposableStore();
        const quickPick = localDisposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
        const quickPickItems = this._getKernelPickerQuickPickItems(notebook, matchResult, this._notebookKernelService, scopedContextKeyService);
        if (quickPickItems.length === 1 && supportAutoRun(quickPickItems[0]) && !skipAutoRun) {
            const picked = await this._handleQuickPick(editor, quickPickItems[0], quickPickItems);
            localDisposableStore.dispose();
            return picked;
        }
        quickPick.items = quickPickItems;
        quickPick.canSelectMany = false;
        quickPick.placeholder = selected
            ? localize('prompt.placeholder.change', "Change kernel for '{0}'", this._labelService.getUriLabel(notebook.uri, { relative: true }))
            : localize('prompt.placeholder.select', "Select kernel for '{0}'", this._labelService.getUriLabel(notebook.uri, { relative: true }));
        quickPick.busy = this._notebookKernelService.getKernelDetectionTasks(notebook).length > 0;
        const kernelDetectionTaskListener = this._notebookKernelService.onDidChangeKernelDetectionTasks(() => {
            quickPick.busy = this._notebookKernelService.getKernelDetectionTasks(notebook).length > 0;
        });
        const extensionRecommendataionPromise = quickPickItems.length === 0
            ? createCancelablePromise(token => this._showInstallKernelExtensionRecommendation(notebook, quickPick, this._extensionWorkbenchService, token))
            : undefined;
        const kernelChangeEventListener = Event.debounce(Event.any(this._notebookKernelService.onDidChangeSourceActions, this._notebookKernelService.onDidAddKernel, this._notebookKernelService.onDidRemoveKernel, this._notebookKernelService.onDidChangeNotebookAffinity), (last, _current) => last, KERNEL_PICKER_UPDATE_DEBOUNCE)(async () => {
            quickPick.busy = false;
            extensionRecommendataionPromise?.cancel();
            const currentActiveItems = quickPick.activeItems;
            const matchResult = this._getMatchingResult(notebook);
            const quickPickItems = this._getKernelPickerQuickPickItems(notebook, matchResult, this._notebookKernelService, scopedContextKeyService);
            quickPick.keepScrollPosition = true;
            const activeItems = [];
            for (const item of currentActiveItems) {
                if (isKernelPick(item)) {
                    const kernelId = item.kernel.id;
                    const sameItem = quickPickItems.find(pi => isKernelPick(pi) && pi.kernel.id === kernelId);
                    if (sameItem) {
                        activeItems.push(sameItem);
                    }
                }
                else if (isSourcePick(item)) {
                    const sameItem = quickPickItems.find(pi => isSourcePick(pi) && pi.action.action.id === item.action.action.id);
                    if (sameItem) {
                        activeItems.push(sameItem);
                    }
                }
            }
            quickPick.items = quickPickItems;
            quickPick.activeItems = activeItems;
        }, this);
        const pick = await new Promise((resolve, reject) => {
            localDisposableStore.add(quickPick.onDidAccept(() => {
                const item = quickPick.selectedItems[0];
                if (item) {
                    resolve({ selected: item, items: quickPick.items });
                }
                else {
                    resolve({ selected: undefined, items: quickPick.items });
                }
                quickPick.hide();
            }));
            localDisposableStore.add(quickPick.onDidHide(() => {
                kernelDetectionTaskListener.dispose();
                kernelChangeEventListener.dispose();
                quickPick.dispose();
                resolve({ selected: undefined, items: quickPick.items });
            }));
            quickPick.show();
        });
        localDisposableStore.dispose();
        if (pick.selected) {
            return await this._handleQuickPick(editor, pick.selected, pick.items);
        }
        return false;
    }
    _getMatchingResult(notebook) {
        return this._notebookKernelService.getMatchingKernel(notebook);
    }
    async _handleQuickPick(editor, pick, quickPickItems) {
        if (isKernelPick(pick)) {
            const newKernel = pick.kernel;
            this._selecteKernel(editor.textModel, newKernel);
            return true;
        }
        if (isSearchMarketplacePick(pick)) {
            await this._showKernelExtension(this._extensionWorkbenchService, this._extensionService, editor.textModel.viewType, []);
        }
        else if (isInstallExtensionPick(pick)) {
            await this._showKernelExtension(this._extensionWorkbenchService, this._extensionService, editor.textModel.viewType, pick.extensionIds, this._productService.quality !== 'stable');
        }
        else if (isSourcePick(pick)) {
            pick.action.runAction();
        }
        return true;
    }
    _selecteKernel(notebook, kernel) {
        this._notebookKernelService.selectKernelForNotebook(kernel, notebook);
    }
    async _showKernelExtension(extensionWorkbenchService, extensionService, viewType, extIds, isInsiders) {
        const extensionsToInstall = [];
        const extensionsToEnable = [];
        for (const extId of extIds) {
            const extension = (await extensionWorkbenchService.getExtensions([{ id: extId }], CancellationToken.None))[0];
            if (extension.enablementState === 7 || extension.enablementState === 8 || extension.enablementState === 2) {
                extensionsToEnable.push(extension);
            }
            else {
                const canInstall = await extensionWorkbenchService.canInstall(extension);
                if (canInstall) {
                    extensionsToInstall.push(extension);
                }
            }
        }
        if (extensionsToInstall.length || extensionsToEnable.length) {
            await Promise.all([...extensionsToInstall.map(async (extension) => {
                    await extensionWorkbenchService.install(extension, {
                        installPreReleaseVersion: isInsiders ?? false,
                        context: { skipWalkthrough: true }
                    }, 15);
                }), ...extensionsToEnable.map(async (extension) => {
                    switch (extension.enablementState) {
                        case 8:
                            await extensionWorkbenchService.setEnablement([extension], 10);
                            return;
                        case 7:
                            await extensionWorkbenchService.setEnablement([extension], 9);
                            return;
                        case 2:
                            await extensionWorkbenchService.setEnablement([extension], 3);
                            return;
                        default:
                            break;
                    }
                })]);
            await extensionService.activateByEvent(`onNotebook:${viewType}`);
            return;
        }
        const pascalCased = viewType.split(/[^a-z0-9]/ig).map(uppercaseFirstLetter).join('');
        await extensionWorkbenchService.openSearch(`@tag:notebookKernel${pascalCased}`);
    }
    async _showInstallKernelExtensionRecommendation(notebookTextModel, quickPick, extensionWorkbenchService, token) {
        quickPick.busy = true;
        const newQuickPickItems = await this._getKernelRecommendationsQuickPickItems(notebookTextModel, extensionWorkbenchService);
        quickPick.busy = false;
        if (token.isCancellationRequested) {
            return;
        }
        if (newQuickPickItems && quickPick.items.length === 0) {
            quickPick.items = newQuickPickItems;
        }
    }
    async _getKernelRecommendationsQuickPickItems(notebookTextModel, extensionWorkbenchService) {
        const quickPickItems = [];
        const language = this.getSuggestedLanguage(notebookTextModel);
        const suggestedExtension = language ? this.getSuggestedKernelFromLanguage(notebookTextModel.viewType, language) : undefined;
        if (suggestedExtension) {
            await extensionWorkbenchService.queryLocal();
            const extensions = extensionWorkbenchService.installed.filter(e => (e.enablementState === 3 || e.enablementState === 9 || e.enablementState === 10)
                && suggestedExtension.extensionIds.includes(e.identifier.id));
            if (extensions.length === suggestedExtension.extensionIds.length) {
                return undefined;
            }
            quickPickItems.push({
                id: 'installSuggested',
                description: suggestedExtension.displayName ?? suggestedExtension.extensionIds.join(', '),
                label: `$(${Codicon.lightbulb.id}) ` + localize('installSuggestedKernel', 'Install/Enable suggested extensions'),
                extensionIds: suggestedExtension.extensionIds
            });
        }
        quickPickItems.push({
            id: 'install',
            label: localize('searchForKernels', "Browse marketplace for kernel extensions"),
        });
        return quickPickItems;
    }
    getSuggestedLanguage(notebookTextModel) {
        const metaData = notebookTextModel.metadata;
        let suggestedKernelLanguage = metaData?.metadata?.language_info?.name;
        if (!suggestedKernelLanguage) {
            const cellLanguages = notebookTextModel.cells.map(cell => cell.language).filter(language => language !== 'markdown');
            if (cellLanguages.length > 1) {
                const firstLanguage = cellLanguages[0];
                if (cellLanguages.every(language => language === firstLanguage)) {
                    suggestedKernelLanguage = firstLanguage;
                }
            }
        }
        return suggestedKernelLanguage;
    }
    getSuggestedKernelFromLanguage(viewType, language) {
        const recommendation = KERNEL_RECOMMENDATIONS.get(viewType)?.get(language);
        return recommendation;
    }
}
let KernelPickerMRUStrategy = class KernelPickerMRUStrategy extends KernelPickerStrategyBase {
    constructor(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _extensionWorkbenchService, _extensionService, _commandService, _notebookKernelHistoryService, _openerService) {
        super(_notebookKernelService, _productService, _quickInputService, _labelService, _logService, _extensionWorkbenchService, _extensionService, _commandService);
        this._notebookKernelHistoryService = _notebookKernelHistoryService;
        this._openerService = _openerService;
    }
    _getKernelPickerQuickPickItems(notebookTextModel, matchResult, notebookKernelService, scopedContextKeyService) {
        const quickPickItems = [];
        if (matchResult.selected) {
            const kernelItem = toKernelQuickPick(matchResult.selected, matchResult.selected);
            quickPickItems.push(kernelItem);
        }
        matchResult.suggestions.filter(kernel => kernel.id !== matchResult.selected?.id).map(kernel => toKernelQuickPick(kernel, matchResult.selected))
            .forEach(kernel => {
            quickPickItems.push(kernel);
        });
        const shouldAutoRun = quickPickItems.length === 0;
        if (quickPickItems.length > 0) {
            quickPickItems.push({
                type: 'separator'
            });
        }
        quickPickItems.push({
            id: 'selectAnother',
            label: localize('selectAnotherKernel.more', "Select Another Kernel..."),
            autoRun: shouldAutoRun
        });
        return quickPickItems;
    }
    _selecteKernel(notebook, kernel) {
        const currentInfo = this._notebookKernelService.getMatchingKernel(notebook);
        if (currentInfo.selected) {
            this._notebookKernelHistoryService.addMostRecentKernel(currentInfo.selected);
        }
        super._selecteKernel(notebook, kernel);
        this._notebookKernelHistoryService.addMostRecentKernel(kernel);
    }
    _getMatchingResult(notebook) {
        const { selected, all } = this._notebookKernelHistoryService.getKernels(notebook);
        const matchingResult = this._notebookKernelService.getMatchingKernel(notebook);
        return {
            selected: selected,
            all: matchingResult.all,
            suggestions: all,
            hidden: []
        };
    }
    async _handleQuickPick(editor, pick, items) {
        if (pick.id === 'selectAnother') {
            return this.displaySelectAnotherQuickPick(editor, items.length === 1 && items[0] === pick);
        }
        return super._handleQuickPick(editor, pick, items);
    }
    async displaySelectAnotherQuickPick(editor, kernelListEmpty) {
        const notebook = editor.textModel;
        const disposables = new DisposableStore();
        const quickPick = disposables.add(this._quickInputService.createQuickPick({ useSeparators: true }));
        const quickPickItem = await new Promise(resolve => {
            quickPick.title = kernelListEmpty ? localize('select', "Select Kernel") : localize('selectAnotherKernel', "Select Another Kernel");
            quickPick.placeholder = localize('selectKernel.placeholder', "Type to choose a kernel source");
            quickPick.busy = true;
            quickPick.buttons = [this._quickInputService.backButton];
            quickPick.show();
            disposables.add(quickPick.onDidTriggerButton(button => {
                if (button === this._quickInputService.backButton) {
                    resolve(button);
                }
            }));
            disposables.add(quickPick.onDidTriggerItemButton(async (e) => {
                if (isKernelSourceQuickPickItem(e.item) && e.item.documentation !== undefined) {
                    const uri = URI.isUri(e.item.documentation) ? URI.parse(e.item.documentation) : await this._commandService.executeCommand(e.item.documentation);
                    void this._openerService.open(uri, { openExternal: true });
                }
            }));
            disposables.add(quickPick.onDidAccept(async () => {
                resolve(quickPick.selectedItems[0]);
            }));
            disposables.add(quickPick.onDidHide(() => {
                resolve(undefined);
            }));
            this._calculdateKernelSources(editor).then(quickPickItems => {
                quickPick.items = quickPickItems;
                if (quickPick.items.length > 0) {
                    quickPick.busy = false;
                }
            });
            disposables.add(Event.debounce(Event.any(this._notebookKernelService.onDidChangeSourceActions, this._notebookKernelService.onDidAddKernel, this._notebookKernelService.onDidRemoveKernel), (last, _current) => last, KERNEL_PICKER_UPDATE_DEBOUNCE)(async () => {
                quickPick.busy = true;
                const quickPickItems = await this._calculdateKernelSources(editor);
                quickPick.items = quickPickItems;
                quickPick.busy = false;
            }));
        });
        quickPick.hide();
        disposables.dispose();
        if (quickPickItem === this._quickInputService.backButton) {
            return this.showQuickPick(editor, undefined, true);
        }
        if (quickPickItem) {
            const selectedKernelPickItem = quickPickItem;
            if (isKernelSourceQuickPickItem(selectedKernelPickItem)) {
                try {
                    const selectedKernelId = await this._executeCommand(notebook, selectedKernelPickItem.command);
                    if (selectedKernelId) {
                        const { all } = await this._getMatchingResult(notebook);
                        const kernel = all.find(kernel => kernel.id === `ms-toolsai.jupyter/${selectedKernelId}`);
                        if (kernel) {
                            await this._selecteKernel(notebook, kernel);
                            return true;
                        }
                        return true;
                    }
                    else {
                        return this.displaySelectAnotherQuickPick(editor, false);
                    }
                }
                catch (ex) {
                    return false;
                }
            }
            else if (isKernelPick(selectedKernelPickItem)) {
                await this._selecteKernel(notebook, selectedKernelPickItem.kernel);
                return true;
            }
            else if (isGroupedKernelsPick(selectedKernelPickItem)) {
                await this._selectOneKernel(notebook, selectedKernelPickItem.label, selectedKernelPickItem.kernels);
                return true;
            }
            else if (isSourcePick(selectedKernelPickItem)) {
                try {
                    await selectedKernelPickItem.action.runAction();
                    return true;
                }
                catch (ex) {
                    return false;
                }
            }
            else if (isSearchMarketplacePick(selectedKernelPickItem)) {
                await this._showKernelExtension(this._extensionWorkbenchService, this._extensionService, editor.textModel.viewType, []);
                return true;
            }
            else if (isInstallExtensionPick(selectedKernelPickItem)) {
                await this._showKernelExtension(this._extensionWorkbenchService, this._extensionService, editor.textModel.viewType, selectedKernelPickItem.extensionIds, this._productService.quality !== 'stable');
                return this.displaySelectAnotherQuickPick(editor, false);
            }
        }
        return false;
    }
    async _calculdateKernelSources(editor) {
        const notebook = editor.textModel;
        const sourceActionCommands = this._notebookKernelService.getSourceActions(notebook, editor.scopedContextKeyService);
        const actions = await this._notebookKernelService.getKernelSourceActions2(notebook);
        const matchResult = this._getMatchingResult(notebook);
        if (sourceActionCommands.length === 0 && matchResult.all.length === 0 && actions.length === 0) {
            return await this._getKernelRecommendationsQuickPickItems(notebook, this._extensionWorkbenchService) ?? [];
        }
        const others = matchResult.all.filter(item => item.extension.value !== JUPYTER_EXTENSION_ID);
        const quickPickItems = [];
        for (const group of groupBy(others, (a, b) => a.extension.value === b.extension.value ? 0 : 1)) {
            const extension = this._extensionService.extensions.find(extension => extension.identifier.value === group[0].extension.value);
            const source = extension?.displayName ?? extension?.description ?? group[0].extension.value;
            if (group.length > 1) {
                quickPickItems.push({
                    label: source,
                    kernels: group
                });
            }
            else {
                quickPickItems.push({
                    label: group[0].label,
                    kernel: group[0]
                });
            }
        }
        const validActions = actions.filter(action => action.command);
        quickPickItems.push(...validActions.map(action => {
            const buttons = action.documentation ? [{
                    iconClass: ThemeIcon.asClassName(Codicon.info),
                    tooltip: localize('learnMoreTooltip', 'Learn More'),
                }] : [];
            return {
                id: typeof action.command === 'string' ? action.command : action.command.id,
                label: action.label,
                description: action.description,
                command: action.command,
                documentation: action.documentation,
                buttons
            };
        }));
        for (const sourceAction of sourceActionCommands) {
            const res = {
                action: sourceAction,
                picked: false,
                label: sourceAction.action.label,
                tooltip: sourceAction.action.tooltip
            };
            quickPickItems.push(res);
        }
        return quickPickItems;
    }
    async _selectOneKernel(notebook, source, kernels) {
        const quickPickItems = kernels.map(kernel => toKernelQuickPick(kernel, undefined));
        const localDisposableStore = new DisposableStore();
        const quickPick = localDisposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
        quickPick.items = quickPickItems;
        quickPick.canSelectMany = false;
        quickPick.title = localize('selectKernelFromExtension', "Select Kernel from {0}", source);
        localDisposableStore.add(quickPick.onDidAccept(async () => {
            if (quickPick.selectedItems && quickPick.selectedItems.length > 0 && isKernelPick(quickPick.selectedItems[0])) {
                await this._selecteKernel(notebook, quickPick.selectedItems[0].kernel);
            }
            quickPick.hide();
            quickPick.dispose();
        }));
        localDisposableStore.add(quickPick.onDidHide(() => {
            localDisposableStore.dispose();
        }));
        quickPick.show();
    }
    async _executeCommand(notebook, command) {
        const id = typeof command === 'string' ? command : command.id;
        const args = typeof command === 'string' ? [] : command.arguments ?? [];
        if (typeof command === 'string' || !command.arguments || !Array.isArray(command.arguments) || command.arguments.length === 0) {
            args.unshift({
                uri: notebook.uri,
                $mid: 14
            });
        }
        if (typeof command === 'string') {
            return this._commandService.executeCommand(id);
        }
        else {
            return this._commandService.executeCommand(id, ...args);
        }
    }
    static updateKernelStatusAction(notebook, action, notebookKernelService, notebookKernelHistoryService) {
        const detectionTasks = notebookKernelService.getKernelDetectionTasks(notebook);
        if (detectionTasks.length) {
            const info = notebookKernelService.getMatchingKernel(notebook);
            action.enabled = true;
            action.class = ThemeIcon.asClassName(ThemeIcon.modify(executingStateIcon, 'spin'));
            if (info.selected) {
                action.label = info.selected.label;
                const kernelInfo = info.selected.description ?? info.selected.detail;
                action.tooltip = kernelInfo
                    ? localize('kernels.selectedKernelAndKernelDetectionRunning', "Selected Kernel: {0} (Kernel Detection Tasks Running)", kernelInfo)
                    : localize('kernels.detecting', "Detecting Kernels");
            }
            else {
                action.label = localize('kernels.detecting', "Detecting Kernels");
            }
            return;
        }
        const runningActions = notebookKernelService.getRunningSourceActions(notebook);
        const updateActionFromSourceAction = (sourceAction, running) => {
            const sAction = sourceAction.action;
            action.class = running ? ThemeIcon.asClassName(ThemeIcon.modify(executingStateIcon, 'spin')) : ThemeIcon.asClassName(selectKernelIcon);
            action.label = sAction.label;
            action.enabled = true;
        };
        if (runningActions.length) {
            return updateActionFromSourceAction(runningActions[0], true);
        }
        const { selected } = notebookKernelHistoryService.getKernels(notebook);
        if (selected) {
            action.label = selected.label;
            action.class = ThemeIcon.asClassName(selectKernelIcon);
            action.tooltip = selected.description ?? selected.detail ?? '';
        }
        else {
            action.label = localize('select', "Select Kernel");
            action.class = ThemeIcon.asClassName(selectKernelIcon);
            action.tooltip = '';
        }
    }
    static async resolveKernel(notebook, notebookKernelService, notebookKernelHistoryService, commandService) {
        const alreadySelected = notebookKernelHistoryService.getKernels(notebook);
        if (alreadySelected.selected) {
            return alreadySelected.selected;
        }
        await commandService.executeCommand(SELECT_KERNEL_ID);
        const { selected } = notebookKernelHistoryService.getKernels(notebook);
        return selected;
    }
};
KernelPickerMRUStrategy = __decorate([
    __param(0, INotebookKernelService),
    __param(1, IProductService),
    __param(2, IQuickInputService),
    __param(3, ILabelService),
    __param(4, ILogService),
    __param(5, IExtensionsWorkbenchService),
    __param(6, IExtensionService),
    __param(7, ICommandService),
    __param(8, INotebookKernelHistoryService),
    __param(9, IOpenerService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], KernelPickerMRUStrategy);
export { KernelPickerMRUStrategy };
