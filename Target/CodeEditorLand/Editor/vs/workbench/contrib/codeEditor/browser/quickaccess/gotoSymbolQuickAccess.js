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
var GotoSymbolQuickAccessProvider_1;
import { localize, localize2 } from '../../../../../nls.js';
import { IQuickInputService, ItemActivation } from '../../../../../platform/quickinput/common/quickInput.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { Extensions as QuickaccessExtensions } from '../../../../../platform/quickinput/common/quickAccess.js';
import { AbstractGotoSymbolQuickAccessProvider } from '../../../../../editor/contrib/quickAccess/browser/gotoSymbolQuickAccess.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { DisposableStore, toDisposable, Disposable, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { timeout } from '../../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { registerAction2, Action2, MenuId } from '../../../../../platform/actions/common/actions.js';
import { prepareQuery } from '../../../../../base/common/fuzzyScorer.js';
import { fuzzyScore } from '../../../../../base/common/filters.js';
import { onUnexpectedError } from '../../../../../base/common/errors.js';
import { IOutlineService } from '../../../../services/outline/browser/outline.js';
import { isCompositeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IOutlineModelService } from '../../../../../editor/contrib/documentSymbols/browser/outlineModel.js';
import { ILanguageFeaturesService } from '../../../../../editor/common/services/languageFeatures.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { accessibilityHelpIsShown, accessibleViewIsShown } from '../../../accessibility/browser/accessibilityConfiguration.js';
import { matchesFuzzyIconAware, parseLabelWithIcons } from '../../../../../base/common/iconLabels.js';
let GotoSymbolQuickAccessProvider = class GotoSymbolQuickAccessProvider extends AbstractGotoSymbolQuickAccessProvider {
    static { GotoSymbolQuickAccessProvider_1 = this; }
    constructor(editorService, editorGroupService, configurationService, languageFeaturesService, outlineService, outlineModelService) {
        super(languageFeaturesService, outlineModelService, {
            openSideBySideDirection: () => this.configuration.openSideBySideDirection
        });
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.configurationService = configurationService;
        this.outlineService = outlineService;
        this.onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;
    }
    get configuration() {
        const editorConfig = this.configurationService.getValue().workbench?.editor;
        return {
            openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
            openSideBySideDirection: editorConfig?.openSideBySideDirection
        };
    }
    get activeTextEditorControl() {
        if (isCompositeEditor(this.editorService.activeEditorPane?.getControl())) {
            return undefined;
        }
        return this.editorService.activeTextEditorControl;
    }
    gotoLocation(context, options) {
        if ((options.keyMods.alt || (this.configuration.openEditorPinned && options.keyMods.ctrlCmd) || options.forceSideBySide) && this.editorService.activeEditor) {
            context.restoreViewState?.();
            const editorOptions = {
                selection: options.range,
                pinned: options.keyMods.ctrlCmd || this.configuration.openEditorPinned,
                preserveFocus: options.preserveFocus
            };
            this.editorGroupService.sideGroup.openEditor(this.editorService.activeEditor, editorOptions);
        }
        else {
            super.gotoLocation(context, options);
        }
    }
    static { this.SYMBOL_PICKS_TIMEOUT = 8000; }
    async getSymbolPicks(model, filter, options, disposables, token) {
        const result = await Promise.race([
            this.waitForLanguageSymbolRegistry(model, disposables),
            timeout(GotoSymbolQuickAccessProvider_1.SYMBOL_PICKS_TIMEOUT)
        ]);
        if (!result || token.isCancellationRequested) {
            return [];
        }
        return this.doGetSymbolPicks(this.getDocumentSymbols(model, token), prepareQuery(filter), options, token, model);
    }
    provideWithoutTextEditor(picker) {
        if (this.canPickWithOutlineService()) {
            return this.doGetOutlinePicks(picker);
        }
        return super.provideWithoutTextEditor(picker);
    }
    canPickWithOutlineService() {
        return this.editorService.activeEditorPane ? this.outlineService.canCreateOutline(this.editorService.activeEditorPane) : false;
    }
    doGetOutlinePicks(picker) {
        const pane = this.editorService.activeEditorPane;
        if (!pane) {
            return Disposable.None;
        }
        const cts = new CancellationTokenSource();
        const disposables = new DisposableStore();
        disposables.add(toDisposable(() => cts.dispose(true)));
        picker.busy = true;
        this.outlineService.createOutline(pane, 4, cts.token).then(outline => {
            if (!outline) {
                return;
            }
            if (cts.token.isCancellationRequested) {
                outline.dispose();
                return;
            }
            disposables.add(outline);
            const viewState = outline.captureViewState();
            disposables.add(toDisposable(() => {
                if (picker.selectedItems.length === 0) {
                    viewState.dispose();
                }
            }));
            const entries = outline.config.quickPickDataSource.getQuickPickElements();
            const items = entries.map((entry, idx) => {
                return {
                    kind: 0,
                    index: idx,
                    score: 0,
                    label: entry.label,
                    description: entry.description,
                    ariaLabel: entry.ariaLabel,
                    iconClasses: entry.iconClasses
                };
            });
            disposables.add(picker.onDidAccept(() => {
                picker.hide();
                const [entry] = picker.selectedItems;
                if (entry && entries[entry.index]) {
                    outline.reveal(entries[entry.index].element, {}, false, false);
                }
            }));
            const updatePickerItems = () => {
                const filteredItems = items.filter(item => {
                    if (picker.value === '@') {
                        item.score = 0;
                        item.highlights = undefined;
                        return true;
                    }
                    const trimmedQuery = picker.value.substring(AbstractGotoSymbolQuickAccessProvider.PREFIX.length).trim();
                    const parsedLabel = parseLabelWithIcons(item.label);
                    const score = fuzzyScore(trimmedQuery, trimmedQuery.toLowerCase(), 0, parsedLabel.text, parsedLabel.text.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
                    if (!score) {
                        return false;
                    }
                    item.score = score[1];
                    item.highlights = { label: matchesFuzzyIconAware(trimmedQuery, parsedLabel) ?? undefined };
                    return true;
                });
                if (filteredItems.length === 0) {
                    const label = localize('empty', 'No matching entries');
                    picker.items = [{ label, index: -1, kind: 14 }];
                    picker.ariaLabel = label;
                }
                else {
                    picker.items = filteredItems;
                }
            };
            updatePickerItems();
            disposables.add(picker.onDidChangeValue(updatePickerItems));
            const previewDisposable = new MutableDisposable();
            disposables.add(previewDisposable);
            disposables.add(picker.onDidChangeActive(() => {
                const [entry] = picker.activeItems;
                if (entry && entries[entry.index]) {
                    previewDisposable.value = outline.preview(entries[entry.index].element);
                }
                else {
                    previewDisposable.clear();
                }
            }));
        }).catch(err => {
            onUnexpectedError(err);
            picker.hide();
        }).finally(() => {
            picker.busy = false;
        });
        return disposables;
    }
};
GotoSymbolQuickAccessProvider = GotoSymbolQuickAccessProvider_1 = __decorate([
    __param(0, IEditorService),
    __param(1, IEditorGroupsService),
    __param(2, IConfigurationService),
    __param(3, ILanguageFeaturesService),
    __param(4, IOutlineService),
    __param(5, IOutlineModelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], GotoSymbolQuickAccessProvider);
export { GotoSymbolQuickAccessProvider };
class GotoSymbolAction extends Action2 {
    static { this.ID = 'workbench.action.gotoSymbol'; }
    constructor() {
        super({
            id: GotoSymbolAction.ID,
            title: {
                ...localize2('gotoSymbol', "Go to Symbol in Editor..."),
                mnemonicTitle: localize({ key: 'miGotoSymbolInEditor', comment: ['&& denotes a mnemonic'] }, "Go to &&Symbol in Editor..."),
            },
            f1: true,
            keybinding: {
                when: ContextKeyExpr.and(accessibleViewIsShown.negate(), accessibilityHelpIsShown.negate()),
                weight: 200,
                primary: 2048 | 1024 | 45
            },
            menu: [{
                    id: MenuId.MenubarGoMenu,
                    group: '4_symbol_nav',
                    order: 1
                }]
        });
    }
    run(accessor) {
        accessor.get(IQuickInputService).quickAccess.show(GotoSymbolQuickAccessProvider.PREFIX, { itemActivation: ItemActivation.NONE });
    }
}
registerAction2(GotoSymbolAction);
Registry.as(QuickaccessExtensions.Quickaccess).registerQuickAccessProvider({
    ctor: GotoSymbolQuickAccessProvider,
    prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX,
    contextKey: 'inFileSymbolsPicker',
    placeholder: localize('gotoSymbolQuickAccessPlaceholder', "Type the name of a symbol to go to."),
    helpEntries: [
        {
            description: localize('gotoSymbolQuickAccess', "Go to Symbol in Editor"),
            prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX,
            commandId: GotoSymbolAction.ID,
            commandCenterOrder: 40
        },
        {
            description: localize('gotoSymbolByCategoryQuickAccess', "Go to Symbol in Editor by Category"),
            prefix: AbstractGotoSymbolQuickAccessProvider.PREFIX_BY_CATEGORY
        }
    ]
});
