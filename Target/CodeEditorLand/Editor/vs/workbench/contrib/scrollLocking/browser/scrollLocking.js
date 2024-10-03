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
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { SideBySideEditor } from '../../../browser/parts/editor/sideBySideEditor.js';
import { isEditorPaneWithScrolling } from '../../../common/editor.js';
import { ReentrancyBarrier } from '../../../../base/common/controlFlow.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
let SyncScroll = class SyncScroll extends Disposable {
    static { this.ID = 'workbench.contrib.syncScrolling'; }
    constructor(editorService, statusbarService) {
        super();
        this.editorService = editorService;
        this.statusbarService = statusbarService;
        this.paneInitialScrollTop = new Map();
        this.syncScrollDispoasbles = this._register(new DisposableStore());
        this.paneDisposables = new DisposableStore();
        this.statusBarEntry = this._register(new MutableDisposable());
        this.isActive = false;
        this._reentrancyBarrier = new ReentrancyBarrier();
        this.registerActions();
    }
    registerActiveListeners() {
        this.syncScrollDispoasbles.add(this.editorService.onDidVisibleEditorsChange(() => this.trackVisiblePanes()));
    }
    activate() {
        this.registerActiveListeners();
        this.trackVisiblePanes();
    }
    toggle() {
        if (this.isActive) {
            this.deactivate();
        }
        else {
            this.activate();
        }
        this.isActive = !this.isActive;
        this.toggleStatusbarItem(this.isActive);
    }
    trackVisiblePanes() {
        this.paneDisposables.clear();
        this.paneInitialScrollTop.clear();
        for (const pane of this.getAllVisiblePanes()) {
            if (!isEditorPaneWithScrolling(pane)) {
                continue;
            }
            this.paneInitialScrollTop.set(pane, pane.getScrollPosition());
            this.paneDisposables.add(pane.onDidChangeScroll(() => this._reentrancyBarrier.runExclusivelyOrSkip(() => {
                this.onDidEditorPaneScroll(pane);
            })));
        }
    }
    onDidEditorPaneScroll(scrolledPane) {
        const scrolledPaneInitialOffset = this.paneInitialScrollTop.get(scrolledPane);
        if (scrolledPaneInitialOffset === undefined) {
            throw new Error('Scrolled pane not tracked');
        }
        if (!isEditorPaneWithScrolling(scrolledPane)) {
            throw new Error('Scrolled pane does not support scrolling');
        }
        const scrolledPaneCurrentPosition = scrolledPane.getScrollPosition();
        const scrolledFromInitial = {
            scrollTop: scrolledPaneCurrentPosition.scrollTop - scrolledPaneInitialOffset.scrollTop,
            scrollLeft: scrolledPaneCurrentPosition.scrollLeft !== undefined && scrolledPaneInitialOffset.scrollLeft !== undefined ? scrolledPaneCurrentPosition.scrollLeft - scrolledPaneInitialOffset.scrollLeft : undefined,
        };
        for (const pane of this.getAllVisiblePanes()) {
            if (pane === scrolledPane) {
                continue;
            }
            if (!isEditorPaneWithScrolling(pane)) {
                continue;
            }
            const initialOffset = this.paneInitialScrollTop.get(pane);
            if (initialOffset === undefined) {
                throw new Error('Could not find initial offset for pane');
            }
            const currentPanePosition = pane.getScrollPosition();
            const newPaneScrollPosition = {
                scrollTop: initialOffset.scrollTop + scrolledFromInitial.scrollTop,
                scrollLeft: initialOffset.scrollLeft !== undefined && scrolledFromInitial.scrollLeft !== undefined ? initialOffset.scrollLeft + scrolledFromInitial.scrollLeft : undefined,
            };
            if (currentPanePosition.scrollTop === newPaneScrollPosition.scrollTop && currentPanePosition.scrollLeft === newPaneScrollPosition.scrollLeft) {
                continue;
            }
            pane.setScrollPosition(newPaneScrollPosition);
        }
    }
    getAllVisiblePanes() {
        const panes = [];
        for (const pane of this.editorService.visibleEditorPanes) {
            if (pane instanceof SideBySideEditor) {
                const primaryPane = pane.getPrimaryEditorPane();
                const secondaryPane = pane.getSecondaryEditorPane();
                if (primaryPane) {
                    panes.push(primaryPane);
                }
                if (secondaryPane) {
                    panes.push(secondaryPane);
                }
                continue;
            }
            panes.push(pane);
        }
        return panes;
    }
    deactivate() {
        this.paneDisposables.clear();
        this.syncScrollDispoasbles.clear();
        this.paneInitialScrollTop.clear();
    }
    toggleStatusbarItem(active) {
        if (active) {
            if (!this.statusBarEntry.value) {
                const text = localize('mouseScrolllingLocked', 'Scrolling Locked');
                const tooltip = localize('mouseLockScrollingEnabled', 'Lock Scrolling Enabled');
                this.statusBarEntry.value = this.statusbarService.addEntry({
                    name: text,
                    text,
                    tooltip,
                    ariaLabel: text,
                    command: {
                        id: 'workbench.action.toggleLockedScrolling',
                        title: ''
                    },
                    kind: 'prominent',
                    showInAllWindows: true
                }, 'status.scrollLockingEnabled', 1, 102);
            }
        }
        else {
            this.statusBarEntry.clear();
        }
    }
    registerActions() {
        const $this = this;
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.toggleLockedScrolling',
                    title: {
                        ...localize2('toggleLockedScrolling', "Toggle Locked Scrolling Across Editors"),
                        mnemonicTitle: localize({ key: 'miToggleLockedScrolling', comment: ['&& denotes a mnemonic'] }, "Locked Scrolling"),
                    },
                    category: Categories.View,
                    f1: true,
                    metadata: {
                        description: localize('synchronizeScrolling', "Synchronize Scrolling Editors"),
                    }
                });
            }
            run() {
                $this.toggle();
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.holdLockedScrolling',
                    title: {
                        ...localize2('holdLockedScrolling', "Hold Locked Scrolling Across Editors"),
                        mnemonicTitle: localize({ key: 'miHoldLockedScrolling', comment: ['&& denotes a mnemonic'] }, "Locked Scrolling"),
                    },
                    category: Categories.View,
                });
            }
            run(accessor) {
                const keybindingService = accessor.get(IKeybindingService);
                $this.toggle();
                const holdMode = keybindingService.enableKeybindingHoldMode('workbench.action.holdLockedScrolling');
                if (!holdMode) {
                    return;
                }
                holdMode.finally(() => {
                    $this.toggle();
                });
            }
        }));
    }
    dispose() {
        this.deactivate();
        super.dispose();
    }
};
SyncScroll = __decorate([
    __param(0, IEditorService),
    __param(1, IStatusbarService),
    __metadata("design:paramtypes", [Object, Object])
], SyncScroll);
export { SyncScroll };
