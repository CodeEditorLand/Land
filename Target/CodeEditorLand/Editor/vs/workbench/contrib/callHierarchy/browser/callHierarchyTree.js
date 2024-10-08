/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CallHierarchyModel, } from '../common/callHierarchy.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { createMatches } from '../../../../base/common/filters.js';
import { IconLabel } from '../../../../base/browser/ui/iconLabel/iconLabel.js';
import { SymbolKinds } from '../../../../editor/common/languages.js';
import { compare } from '../../../../base/common/strings.js';
import { Range } from '../../../../editor/common/core/range.js';
import { localize } from '../../../../nls.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
export class Call {
    constructor(item, locations, model, parent) {
        this.item = item;
        this.locations = locations;
        this.model = model;
        this.parent = parent;
    }
    static compare(a, b) {
        let res = compare(a.item.uri.toString(), b.item.uri.toString());
        if (res === 0) {
            res = Range.compareRangesUsingStarts(a.item.range, b.item.range);
        }
        return res;
    }
}
export class DataSource {
    constructor(getDirection) {
        this.getDirection = getDirection;
    }
    hasChildren() {
        return true;
    }
    async getChildren(element) {
        if (element instanceof CallHierarchyModel) {
            return element.roots.map(root => new Call(root, undefined, element, undefined));
        }
        const { model, item } = element;
        if (this.getDirection() === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */) {
            return (await model.resolveOutgoingCalls(item, CancellationToken.None)).map(call => {
                return new Call(call.to, call.fromRanges.map(range => ({ range, uri: item.uri })), model, element);
            });
        }
        else {
            return (await model.resolveIncomingCalls(item, CancellationToken.None)).map(call => {
                return new Call(call.from, call.fromRanges.map(range => ({ range, uri: call.from.uri })), model, element);
            });
        }
    }
}
export class Sorter {
    compare(element, otherElement) {
        return Call.compare(element, otherElement);
    }
}
export class IdentityProvider {
    constructor(getDirection) {
        this.getDirection = getDirection;
    }
    getId(element) {
        let res = this.getDirection() + JSON.stringify(element.item.uri) + JSON.stringify(element.item.range);
        if (element.parent) {
            res += this.getId(element.parent);
        }
        return res;
    }
}
class CallRenderingTemplate {
    constructor(icon, label) {
        this.icon = icon;
        this.label = label;
    }
}
export class CallRenderer {
    constructor() {
        this.templateId = CallRenderer.id;
    }
    static { this.id = 'CallRenderer'; }
    renderTemplate(container) {
        container.classList.add('callhierarchy-element');
        const icon = document.createElement('div');
        container.appendChild(icon);
        const label = new IconLabel(container, { supportHighlights: true });
        return new CallRenderingTemplate(icon, label);
    }
    renderElement(node, _index, template) {
        const { element, filterData } = node;
        const deprecated = element.item.tags?.includes(1 /* SymbolTag.Deprecated */);
        template.icon.className = '';
        template.icon.classList.add('inline', ...ThemeIcon.asClassNameArray(SymbolKinds.toIcon(element.item.kind)));
        template.label.setLabel(element.item.name, element.item.detail, { labelEscapeNewLines: true, matches: createMatches(filterData), strikethrough: deprecated });
    }
    disposeTemplate(template) {
        template.label.dispose();
    }
}
export class VirtualDelegate {
    getHeight(_element) {
        return 22;
    }
    getTemplateId(_element) {
        return CallRenderer.id;
    }
}
export class AccessibilityProvider {
    constructor(getDirection) {
        this.getDirection = getDirection;
    }
    getWidgetAriaLabel() {
        return localize('tree.aria', "Call Hierarchy");
    }
    getAriaLabel(element) {
        if (this.getDirection() === "outgoingCalls" /* CallHierarchyDirection.CallsFrom */) {
            return localize('from', "calls from {0}", element.item.name);
        }
        else {
            return localize('to', "callers of {0}", element.item.name);
        }
    }
}
