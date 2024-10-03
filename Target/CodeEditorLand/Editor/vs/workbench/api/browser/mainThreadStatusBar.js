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
import { MainContext, ExtHostContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { IExtensionStatusBarItemService } from './statusBarExtensionPoint.js';
let MainThreadStatusBar = class MainThreadStatusBar {
    constructor(extHostContext, statusbarService) {
        this.statusbarService = statusbarService;
        this._store = new DisposableStore();
        const proxy = extHostContext.getProxy(ExtHostContext.ExtHostStatusBar);
        const entries = [];
        for (const [entryId, item] of statusbarService.getEntries()) {
            entries.push(asDto(entryId, item));
        }
        proxy.$acceptStaticEntries(entries);
        this._store.add(statusbarService.onDidChange(e => {
            if (e.added) {
                proxy.$acceptStaticEntries([asDto(e.added[0], e.added[1])]);
            }
        }));
        function asDto(entryId, item) {
            return {
                entryId,
                name: item.entry.name,
                text: item.entry.text,
                tooltip: item.entry.tooltip,
                command: typeof item.entry.command === 'string' ? item.entry.command : typeof item.entry.command === 'object' ? item.entry.command.id : undefined,
                priority: item.priority,
                alignLeft: item.alignment === 0,
                accessibilityInformation: item.entry.ariaLabel ? { label: item.entry.ariaLabel, role: item.entry.role } : undefined
            };
        }
    }
    dispose() {
        this._store.dispose();
    }
    $setEntry(entryId, id, extensionId, name, text, tooltip, command, color, backgroundColor, alignLeft, priority, accessibilityInformation) {
        const kind = this.statusbarService.setOrUpdateEntry(entryId, id, extensionId, name, text, tooltip, command, color, backgroundColor, alignLeft, priority, accessibilityInformation);
        if (kind === 0) {
            this._store.add(toDisposable(() => this.statusbarService.unsetEntry(entryId)));
        }
    }
    $disposeEntry(entryId) {
        this.statusbarService.unsetEntry(entryId);
    }
};
MainThreadStatusBar = __decorate([
    extHostNamedCustomer(MainContext.MainThreadStatusBar),
    __param(1, IExtensionStatusBarItemService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadStatusBar);
export { MainThreadStatusBar };
