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
var NavigableContainerManager_1;
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../platform/contextkey/common/contextkey.js';
import { KeybindingsRegistry } from '../../../platform/keybinding/common/keybindingsRegistry.js';
import { WorkbenchListFocusContextKey, WorkbenchListScrollAtBottomContextKey, WorkbenchListScrollAtTopContextKey } from '../../../platform/list/browser/listService.js';
import { combinedDisposable, toDisposable, Disposable } from '../../../base/common/lifecycle.js';
import { registerWorkbenchContribution2 } from '../../common/contributions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
function handleFocusEventsGroup(group, handler, onPartFocusChange) {
    const focusedIndices = new Set();
    return combinedDisposable(...group.map((events, index) => combinedDisposable(events.onDidFocus(() => {
        onPartFocusChange?.(index, 'focus');
        if (!focusedIndices.size) {
            handler(true);
        }
        focusedIndices.add(index);
    }), events.onDidBlur(() => {
        onPartFocusChange?.(index, 'blur');
        focusedIndices.delete(index);
        if (!focusedIndices.size) {
            handler(false);
        }
    }))));
}
const NavigableContainerFocusedContextKey = new RawContextKey('navigableContainerFocused', false);
let NavigableContainerManager = class NavigableContainerManager {
    static { NavigableContainerManager_1 = this; }
    static { this.ID = 'workbench.contrib.navigableContainerManager'; }
    constructor(contextKeyService, logService, configurationService) {
        this.logService = logService;
        this.configurationService = configurationService;
        this.containers = new Set();
        this.focused = NavigableContainerFocusedContextKey.bindTo(contextKeyService);
        NavigableContainerManager_1.INSTANCE = this;
    }
    dispose() {
        this.containers.clear();
        this.focused.reset();
        NavigableContainerManager_1.INSTANCE = undefined;
    }
    get debugEnabled() {
        return this.configurationService.getValue('workbench.navigibleContainer.enableDebug');
    }
    log(msg, ...args) {
        if (this.debugEnabled) {
            this.logService.debug(msg, ...args);
        }
    }
    static register(container) {
        const instance = this.INSTANCE;
        if (!instance) {
            return Disposable.None;
        }
        instance.containers.add(container);
        instance.log('NavigableContainerManager.register', container.name);
        return combinedDisposable(handleFocusEventsGroup(container.focusNotifiers, (isFocus) => {
            if (isFocus) {
                instance.log('NavigableContainerManager.focus', container.name);
                instance.focused.set(true);
                instance.lastContainer = container;
            }
            else {
                instance.log('NavigableContainerManager.blur', container.name, instance.lastContainer?.name);
                if (instance.lastContainer === container) {
                    instance.focused.set(false);
                    instance.lastContainer = undefined;
                }
            }
        }, (index, event) => {
            instance.log('NavigableContainerManager.partFocusChange', container.name, index, event);
        }), toDisposable(() => {
            instance.containers.delete(container);
            instance.log('NavigableContainerManager.unregister', container.name, instance.lastContainer?.name);
            if (instance.lastContainer === container) {
                instance.focused.set(false);
                instance.lastContainer = undefined;
            }
        }));
    }
    static getActive() {
        return this.INSTANCE?.lastContainer;
    }
};
NavigableContainerManager = NavigableContainerManager_1 = __decorate([
    __param(0, IContextKeyService),
    __param(1, ILogService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NavigableContainerManager);
export function registerNavigableContainer(container) {
    return NavigableContainerManager.register(container);
}
registerWorkbenchContribution2(NavigableContainerManager.ID, NavigableContainerManager, 1);
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'widgetNavigation.focusPrevious',
    weight: 200,
    when: ContextKeyExpr.and(NavigableContainerFocusedContextKey, ContextKeyExpr.or(WorkbenchListFocusContextKey?.negate(), WorkbenchListScrollAtTopContextKey)),
    primary: 2048 | 16,
    handler: () => {
        const activeContainer = NavigableContainerManager.getActive();
        activeContainer?.focusPreviousWidget();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'widgetNavigation.focusNext',
    weight: 200,
    when: ContextKeyExpr.and(NavigableContainerFocusedContextKey, ContextKeyExpr.or(WorkbenchListFocusContextKey?.negate(), WorkbenchListScrollAtBottomContextKey)),
    primary: 2048 | 18,
    handler: () => {
        const activeContainer = NavigableContainerManager.getActive();
        activeContainer?.focusNextWidget();
    }
});
