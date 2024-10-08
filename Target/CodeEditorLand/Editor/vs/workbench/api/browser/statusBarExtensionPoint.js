/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { localize } from '../../../nls.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { isProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { ExtensionsRegistry } from '../../services/extensions/common/extensionsRegistry.js';
import { IStatusbarService } from '../../services/statusbar/browser/statusbar.js';
import { isAccessibilityInformation } from '../../../platform/accessibility/common/accessibility.js';
import { getCodiconAriaLabel } from '../../../base/common/iconLabels.js';
import { hash } from '../../../base/common/hash.js';
import { Emitter } from '../../../base/common/event.js';
import { registerSingleton } from '../../../platform/instantiation/common/extensions.js';
import { Iterable } from '../../../base/common/iterator.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import { asStatusBarItemIdentifier } from '../common/extHostTypes.js';
import { STATUS_BAR_ERROR_ITEM_BACKGROUND, STATUS_BAR_WARNING_ITEM_BACKGROUND } from '../../common/theme.js';
// --- service
export const IExtensionStatusBarItemService = createDecorator('IExtensionStatusBarItemService');
let ExtensionStatusBarItemService = class ExtensionStatusBarItemService {
    constructor(_statusbarService) {
        this._statusbarService = _statusbarService;
        this._entries = new Map();
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
    }
    dispose() {
        this._entries.forEach(entry => entry.accessor.dispose());
        this._entries.clear();
        this._onDidChange.dispose();
    }
    setOrUpdateEntry(entryId, id, extensionId, name, text, tooltip, command, color, backgroundColor, alignLeft, priority, accessibilityInformation) {
        // if there are icons in the text use the tooltip for the aria label
        let ariaLabel;
        let role = undefined;
        if (accessibilityInformation) {
            ariaLabel = accessibilityInformation.label;
            role = accessibilityInformation.role;
        }
        else {
            ariaLabel = getCodiconAriaLabel(text);
            if (tooltip) {
                const tooltipString = typeof tooltip === 'string' ? tooltip : tooltip.value;
                ariaLabel += `, ${tooltipString}`;
            }
        }
        let kind = undefined;
        switch (backgroundColor?.id) {
            case STATUS_BAR_ERROR_ITEM_BACKGROUND:
            case STATUS_BAR_WARNING_ITEM_BACKGROUND:
                // override well known colors that map to status entry kinds to support associated themable hover colors
                kind = backgroundColor.id === STATUS_BAR_ERROR_ITEM_BACKGROUND ? 'error' : 'warning';
                color = undefined;
                backgroundColor = undefined;
        }
        const entry = { name, text, tooltip, command, color, backgroundColor, ariaLabel, role, kind };
        if (typeof priority === 'undefined') {
            priority = 0;
        }
        let alignment = alignLeft ? 0 /* StatusbarAlignment.LEFT */ : 1 /* StatusbarAlignment.RIGHT */;
        // alignment and priority can only be set once (at creation time)
        const existingEntry = this._entries.get(entryId);
        if (existingEntry) {
            alignment = existingEntry.alignment;
            priority = existingEntry.priority;
        }
        // Create new entry if not existing
        if (!existingEntry) {
            let entryPriority;
            if (typeof extensionId === 'string') {
                // We cannot enforce unique priorities across all extensions, so we
                // use the extension identifier as a secondary sort key to reduce
                // the likelyhood of collisions.
                // See https://github.com/microsoft/vscode/issues/177835
                // See https://github.com/microsoft/vscode/issues/123827
                entryPriority = { primary: priority, secondary: hash(extensionId) };
            }
            else {
                entryPriority = priority;
            }
            const accessor = this._statusbarService.addEntry(entry, id, alignment, entryPriority);
            this._entries.set(entryId, {
                accessor,
                entry,
                alignment,
                priority,
                disposable: toDisposable(() => {
                    accessor.dispose();
                    this._entries.delete(entryId);
                    this._onDidChange.fire({ removed: entryId });
                })
            });
            this._onDidChange.fire({ added: [entryId, { entry, alignment, priority }] });
            return 0 /* StatusBarUpdateKind.DidDefine */;
        }
        else {
            // Otherwise update
            existingEntry.accessor.update(entry);
            existingEntry.entry = entry;
            return 1 /* StatusBarUpdateKind.DidUpdate */;
        }
    }
    unsetEntry(entryId) {
        this._entries.get(entryId)?.disposable.dispose();
        this._entries.delete(entryId);
    }
    getEntries() {
        return this._entries.entries();
    }
};
ExtensionStatusBarItemService = __decorate([
    __param(0, IStatusbarService),
    __metadata("design:paramtypes", [Object])
], ExtensionStatusBarItemService);
registerSingleton(IExtensionStatusBarItemService, ExtensionStatusBarItemService, 1 /* InstantiationType.Delayed */);
function isUserFriendlyStatusItemEntry(candidate) {
    const obj = candidate;
    return (typeof obj.id === 'string' && obj.id.length > 0)
        && typeof obj.name === 'string'
        && typeof obj.text === 'string'
        && (obj.alignment === 'left' || obj.alignment === 'right')
        && (obj.command === undefined || typeof obj.command === 'string')
        && (obj.tooltip === undefined || typeof obj.tooltip === 'string')
        && (obj.priority === undefined || typeof obj.priority === 'number')
        && (obj.accessibilityInformation === undefined || isAccessibilityInformation(obj.accessibilityInformation));
}
const statusBarItemSchema = {
    type: 'object',
    required: ['id', 'text', 'alignment', 'name'],
    properties: {
        id: {
            type: 'string',
            markdownDescription: localize('id', 'The identifier of the status bar entry. Must be unique within the extension. The same value must be used when calling the `vscode.window.createStatusBarItem(id, ...)`-API')
        },
        name: {
            type: 'string',
            description: localize('name', 'The name of the entry, like \'Python Language Indicator\', \'Git Status\' etc. Try to keep the length of the name short, yet descriptive enough that users can understand what the status bar item is about.')
        },
        text: {
            type: 'string',
            description: localize('text', 'The text to show for the entry. You can embed icons in the text by leveraging the `$(<name>)`-syntax, like \'Hello $(globe)!\'')
        },
        tooltip: {
            type: 'string',
            description: localize('tooltip', 'The tooltip text for the entry.')
        },
        command: {
            type: 'string',
            description: localize('command', 'The command to execute when the status bar entry is clicked.')
        },
        alignment: {
            type: 'string',
            enum: ['left', 'right'],
            description: localize('alignment', 'The alignment of the status bar entry.')
        },
        priority: {
            type: 'number',
            description: localize('priority', 'The priority of the status bar entry. Higher value means the item should be shown more to the left.')
        },
        accessibilityInformation: {
            type: 'object',
            description: localize('accessibilityInformation', 'Defines the role and aria label to be used when the status bar entry is focused.'),
            properties: {
                role: {
                    type: 'string',
                    description: localize('accessibilityInformation.role', 'The role of the status bar entry which defines how a screen reader interacts with it. More about aria roles can be found here https://w3c.github.io/aria/#widget_roles')
                },
                label: {
                    type: 'string',
                    description: localize('accessibilityInformation.label', 'The aria label of the status bar entry. Defaults to the entry\'s text.')
                }
            }
        }
    }
};
const statusBarItemsSchema = {
    description: localize('vscode.extension.contributes.statusBarItems', "Contributes items to the status bar."),
    oneOf: [
        statusBarItemSchema,
        {
            type: 'array',
            items: statusBarItemSchema
        }
    ]
};
const statusBarItemsExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'statusBarItems',
    jsonSchema: statusBarItemsSchema,
});
let StatusBarItemsExtensionPoint = class StatusBarItemsExtensionPoint {
    constructor(statusBarItemsService) {
        const contributions = new DisposableStore();
        statusBarItemsExtensionPoint.setHandler((extensions) => {
            contributions.clear();
            for (const entry of extensions) {
                if (!isProposedApiEnabled(entry.description, 'contribStatusBarItems')) {
                    entry.collector.error(`The ${statusBarItemsExtensionPoint.name} is proposed API`);
                    continue;
                }
                const { value, collector } = entry;
                for (const candidate of Iterable.wrap(value)) {
                    if (!isUserFriendlyStatusItemEntry(candidate)) {
                        collector.error(localize('invalid', "Invalid status bar item contribution."));
                        continue;
                    }
                    const fullItemId = asStatusBarItemIdentifier(entry.description.identifier, candidate.id);
                    const kind = statusBarItemsService.setOrUpdateEntry(fullItemId, fullItemId, ExtensionIdentifier.toKey(entry.description.identifier), candidate.name ?? entry.description.displayName ?? entry.description.name, candidate.text, candidate.tooltip, candidate.command ? { id: candidate.command, title: candidate.name } : undefined, undefined, undefined, candidate.alignment === 'left', candidate.priority, candidate.accessibilityInformation);
                    if (kind === 0 /* StatusBarUpdateKind.DidDefine */) {
                        contributions.add(toDisposable(() => statusBarItemsService.unsetEntry(fullItemId)));
                    }
                }
            }
        });
    }
};
StatusBarItemsExtensionPoint = __decorate([
    __param(0, IExtensionStatusBarItemService),
    __metadata("design:paramtypes", [Object])
], StatusBarItemsExtensionPoint);
export { StatusBarItemsExtensionPoint };
