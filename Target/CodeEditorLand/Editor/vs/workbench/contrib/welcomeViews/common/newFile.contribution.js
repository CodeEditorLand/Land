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
var NewFileTemplatesManager_1;
import { promiseWithResolvers } from '../../../../base/common/async.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, IMenuService, MenuId, registerAction2, MenuRegistry, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
const builtInSource = localize('Built-In', "Built-In");
const category = localize2('Create', 'Create');
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'welcome.showNewFileEntries',
            title: localize2('welcome.newFile', 'New File...'),
            category,
            f1: true,
            keybinding: {
                primary: 512 + 2048 + 256 + 44,
                weight: 200,
            },
            menu: {
                id: MenuId.MenubarFileMenu,
                group: '1_new',
                order: 2
            }
        });
    }
    async run(accessor) {
        return assertIsDefined(NewFileTemplatesManager.Instance).run();
    }
});
let NewFileTemplatesManager = class NewFileTemplatesManager extends Disposable {
    static { NewFileTemplatesManager_1 = this; }
    constructor(quickInputService, contextKeyService, commandService, keybindingService, menuService) {
        super();
        this.quickInputService = quickInputService;
        this.contextKeyService = contextKeyService;
        this.commandService = commandService;
        this.keybindingService = keybindingService;
        NewFileTemplatesManager_1.Instance = this;
        this._register({ dispose() { if (NewFileTemplatesManager_1.Instance === this) {
                NewFileTemplatesManager_1.Instance = undefined;
            } } });
        this.menu = menuService.createMenu(MenuId.NewFile, contextKeyService);
    }
    allEntries() {
        const items = [];
        for (const [groupName, group] of this.menu.getActions({ renderShortTitle: true })) {
            for (const action of group) {
                if (action instanceof MenuItemAction) {
                    items.push({ commandID: action.item.id, from: action.item.source?.title ?? builtInSource, title: action.label, group: groupName });
                }
            }
        }
        return items;
    }
    async run() {
        const entries = this.allEntries();
        if (entries.length === 0) {
            throw Error('Unexpected empty new items list');
        }
        else if (entries.length === 1) {
            this.commandService.executeCommand(entries[0].commandID);
            return true;
        }
        else {
            return this.selectNewEntry(entries);
        }
    }
    async selectNewEntry(entries) {
        const { promise: resultPromise, resolve: resolveResult } = promiseWithResolvers();
        const disposables = new DisposableStore();
        const qp = this.quickInputService.createQuickPick({ useSeparators: true });
        qp.title = localize('newFileTitle', "New File...");
        qp.placeholder = localize('newFilePlaceholder', "Select File Type or Enter File Name...");
        qp.sortByLabel = false;
        qp.matchOnDetail = true;
        qp.matchOnDescription = true;
        const sortCategories = (a, b) => {
            const categoryPriority = { 'file': 1, 'notebook': 2 };
            if (categoryPriority[a.group] && categoryPriority[b.group]) {
                if (categoryPriority[a.group] !== categoryPriority[b.group]) {
                    return categoryPriority[b.group] - categoryPriority[a.group];
                }
            }
            else if (categoryPriority[a.group]) {
                return 1;
            }
            else if (categoryPriority[b.group]) {
                return -1;
            }
            if (a.from === builtInSource) {
                return 1;
            }
            if (b.from === builtInSource) {
                return -1;
            }
            return a.from.localeCompare(b.from);
        };
        const displayCategory = {
            'file': localize('file', "File"),
            'notebook': localize('notebook', "Notebook"),
        };
        const refreshQp = (entries) => {
            const items = [];
            let lastSeparator;
            entries
                .sort((a, b) => -sortCategories(a, b))
                .forEach((entry) => {
                const command = entry.commandID;
                const keybinding = this.keybindingService.lookupKeybinding(command || '', this.contextKeyService);
                if (lastSeparator !== entry.group) {
                    items.push({
                        type: 'separator',
                        label: displayCategory[entry.group] ?? entry.group
                    });
                    lastSeparator = entry.group;
                }
                items.push({
                    ...entry,
                    label: entry.title,
                    type: 'item',
                    keybinding,
                    buttons: command ? [
                        {
                            iconClass: 'codicon codicon-gear',
                            tooltip: localize('change keybinding', "Configure Keybinding")
                        }
                    ] : [],
                    detail: '',
                    description: entry.from,
                });
            });
            qp.items = items;
        };
        refreshQp(entries);
        disposables.add(this.menu.onDidChange(() => refreshQp(this.allEntries())));
        disposables.add(qp.onDidChangeValue((val) => {
            if (val === '') {
                refreshQp(entries);
                return;
            }
            const currentTextEntry = {
                commandID: 'workbench.action.files.newFile',
                commandArgs: { languageId: undefined, viewType: undefined, fileName: val },
                title: localize('miNewFileWithName', "Create New File ({0})", val),
                group: 'file',
                from: builtInSource,
            };
            refreshQp([currentTextEntry, ...entries]);
        }));
        disposables.add(qp.onDidAccept(async (e) => {
            const selected = qp.selectedItems[0];
            resolveResult(!!selected);
            qp.hide();
            if (selected) {
                await this.commandService.executeCommand(selected.commandID, selected.commandArgs);
            }
        }));
        disposables.add(qp.onDidHide(() => {
            qp.dispose();
            disposables.dispose();
            resolveResult(false);
        }));
        disposables.add(qp.onDidTriggerItemButton(e => {
            qp.hide();
            this.commandService.executeCommand('workbench.action.openGlobalKeybindings', e.item.commandID);
            resolveResult(false);
        }));
        qp.show();
        return resultPromise;
    }
};
NewFileTemplatesManager = NewFileTemplatesManager_1 = __decorate([
    __param(0, IQuickInputService),
    __param(1, IContextKeyService),
    __param(2, ICommandService),
    __param(3, IKeybindingService),
    __param(4, IMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], NewFileTemplatesManager);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(NewFileTemplatesManager, 3);
MenuRegistry.appendMenuItem(MenuId.NewFile, {
    group: 'file',
    command: {
        id: 'workbench.action.files.newUntitledFile',
        title: localize('miNewFile2', "Text File")
    },
    order: 1
});
