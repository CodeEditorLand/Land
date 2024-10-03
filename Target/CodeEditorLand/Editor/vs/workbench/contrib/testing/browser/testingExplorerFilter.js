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
import * as dom from '../../../../base/browser/dom.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { BaseActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { DropdownMenuActionViewItem } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { Action, Separator } from '../../../../base/common/actions.js';
import { Delayer } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { localize } from '../../../../nls.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { ContextScopedSuggestEnabledInputWithHistory } from '../../codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js';
import { testingFilterIcon } from './icons.js';
import { StoredValue } from '../common/storedValue.js';
import { ITestExplorerFilterState } from '../common/testExplorerFilterState.js';
import { ITestService } from '../common/testService.js';
import { denamespaceTestTag } from '../common/testTypes.js';
const testFilterDescriptions = {
    ["@failed"]: localize('testing.filters.showOnlyFailed', "Show Only Failed Tests"),
    ["@executed"]: localize('testing.filters.showOnlyExecuted', "Show Only Executed Tests"),
    ["@doc"]: localize('testing.filters.currentFile', "Show in Active File Only"),
    ["@openedFiles"]: localize('testing.filters.openedFiles', "Show in Opened Files Only"),
    ["@hidden"]: localize('testing.filters.showExcludedTests', "Show Hidden Tests"),
};
let TestingExplorerFilter = class TestingExplorerFilter extends BaseActionViewItem {
    constructor(action, options, state, instantiationService, testService) {
        super(null, action, options);
        this.state = state;
        this.instantiationService = instantiationService;
        this.testService = testService;
        this.focusEmitter = this._register(new Emitter());
        this.onDidFocus = this.focusEmitter.event;
        this.history = this._register(this.instantiationService.createInstance(StoredValue, {
            key: 'testing.filterHistory2',
            scope: 1,
            target: 1
        }));
        this.filtersAction = new Action('markersFiltersAction', localize('testing.filters.menu', "More Filters..."), 'testing-filter-button ' + ThemeIcon.asClassName(testingFilterIcon));
        this.updateFilterActiveState();
        this._register(testService.excluded.onTestExclusionsChanged(this.updateFilterActiveState, this));
    }
    render(container) {
        container.classList.add('testing-filter-action-item');
        const updateDelayer = this._register(new Delayer(400));
        const wrapper = this.wrapper = dom.$('.testing-filter-wrapper');
        container.appendChild(wrapper);
        let history = this.history.get({ lastValue: '', values: [] });
        if (history instanceof Array) {
            history = { lastValue: '', values: history };
        }
        if (history.lastValue) {
            this.state.setText(history.lastValue);
        }
        const input = this.input = this._register(this.instantiationService.createInstance(ContextScopedSuggestEnabledInputWithHistory, {
            id: 'testing.explorer.filter',
            ariaLabel: localize('testExplorerFilterLabel', "Filter text for tests in the explorer"),
            parent: wrapper,
            suggestionProvider: {
                triggerCharacters: ['@'],
                provideResults: () => [
                    ...Object.entries(testFilterDescriptions).map(([label, detail]) => ({ label, detail })),
                    ...Iterable.map(this.testService.collection.tags.values(), tag => {
                        const { ctrlId, tagId } = denamespaceTestTag(tag.id);
                        const insertText = `@${ctrlId}:${tagId}`;
                        return ({
                            label: `@${ctrlId}:${tagId}`,
                            detail: this.testService.collection.getNodeById(ctrlId)?.item.label,
                            insertText: tagId.includes(' ') ? `@${ctrlId}:"${tagId.replace(/(["\\])/g, '\\$1')}"` : insertText,
                        });
                    }),
                ].filter(r => !this.state.text.value.includes(r.label)),
            },
            resourceHandle: 'testing:filter',
            suggestOptions: {
                value: this.state.text.value,
                placeholderText: localize('testExplorerFilter', "Filter (e.g. text, !exclude, @tag)"),
            },
            history: history.values
        }));
        this._register(this.state.text.onDidChange(newValue => {
            if (input.getValue() !== newValue) {
                input.setValue(newValue);
            }
        }));
        this._register(this.state.onDidRequestInputFocus(() => {
            input.focus();
        }));
        this._register(input.onDidFocus(() => {
            this.focusEmitter.fire();
        }));
        this._register(input.onInputDidChange(() => updateDelayer.trigger(() => {
            input.addToHistory();
            this.state.setText(input.getValue());
        })));
        const actionbar = this._register(new ActionBar(container, {
            actionViewItemProvider: (action, options) => {
                if (action.id === this.filtersAction.id) {
                    return this.instantiationService.createInstance(FiltersDropdownMenuActionViewItem, action, options, this.state, this.actionRunner);
                }
                return undefined;
            },
        }));
        actionbar.push(this.filtersAction, { icon: true, label: false });
        this.layout(this.wrapper.clientWidth);
    }
    layout(width) {
        this.input.layout(new dom.Dimension(width - 24 - 8 - 22, 20));
    }
    focus() {
        this.input.focus();
    }
    saveState() {
        this.history.store({ lastValue: this.input.getValue(), values: this.input.getHistory() });
    }
    dispose() {
        this.saveState();
        super.dispose();
    }
    updateFilterActiveState() {
        this.filtersAction.checked = this.testService.excluded.hasAny;
    }
};
TestingExplorerFilter = __decorate([
    __param(2, ITestExplorerFilterState),
    __param(3, IInstantiationService),
    __param(4, ITestService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TestingExplorerFilter);
export { TestingExplorerFilter };
let FiltersDropdownMenuActionViewItem = class FiltersDropdownMenuActionViewItem extends DropdownMenuActionViewItem {
    constructor(action, options, filters, actionRunner, contextMenuService, testService) {
        super(action, { getActions: () => this.getActions() }, contextMenuService, {
            actionRunner,
            classNames: action.class,
            anchorAlignmentProvider: () => 1,
            menuAsChild: true
        });
        this.filters = filters;
        this.testService = testService;
    }
    render(container) {
        super.render(container);
        this.updateChecked();
    }
    getActions() {
        return [
            ...["@failed", "@executed", "@doc", "@openedFiles"].map(term => ({
                checked: this.filters.isFilteringFor(term),
                class: undefined,
                enabled: true,
                id: term,
                label: testFilterDescriptions[term],
                run: () => this.filters.toggleFilteringFor(term),
                tooltip: '',
                dispose: () => null
            })),
            new Separator(),
            {
                checked: this.filters.fuzzy.value,
                class: undefined,
                enabled: true,
                id: 'fuzzy',
                label: localize('testing.filters.fuzzyMatch', "Fuzzy Match"),
                run: () => this.filters.fuzzy.value = !this.filters.fuzzy.value,
                tooltip: ''
            },
            new Separator(),
            {
                checked: this.filters.isFilteringFor("@hidden"),
                class: undefined,
                enabled: this.testService.excluded.hasAny,
                id: 'showExcluded',
                label: localize('testing.filters.showExcludedTests', "Show Hidden Tests"),
                run: () => this.filters.toggleFilteringFor("@hidden"),
                tooltip: ''
            },
            {
                class: undefined,
                enabled: this.testService.excluded.hasAny,
                id: 'removeExcluded',
                label: localize('testing.filters.removeTestExclusions', "Unhide All Tests"),
                run: async () => this.testService.excluded.clear(),
                tooltip: ''
            }
        ];
    }
    updateChecked() {
        this.element.classList.toggle('checked', this._action.checked);
    }
};
FiltersDropdownMenuActionViewItem = __decorate([
    __param(4, IContextMenuService),
    __param(5, ITestService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], FiltersDropdownMenuActionViewItem);
