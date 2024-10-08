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
var DocumentSymbolFilter_1;
import './documentSymbolsTree.css';
import '../../../../../editor/contrib/symbolIcons/browser/symbolIcons.js'; // The codicon symbol colors are defined here and must be loaded to get colors
import * as dom from '../../../../../base/browser/dom.js';
import { HighlightedLabel } from '../../../../../base/browser/ui/highlightedlabel/highlightedLabel.js';
import { createMatches } from '../../../../../base/common/filters.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { SymbolKinds, getAriaLabelForSymbol, symbolKindNames } from '../../../../../editor/common/languages.js';
import { OutlineElement, OutlineGroup, OutlineModel } from '../../../../../editor/contrib/documentSymbols/browser/outlineModel.js';
import { localize } from '../../../../../nls.js';
import { IconLabel } from '../../../../../base/browser/ui/iconLabel/iconLabel.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { MarkerSeverity } from '../../../../../platform/markers/common/markers.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { listErrorForeground, listWarningForeground } from '../../../../../platform/theme/common/colorRegistry.js';
import { ITextResourceConfigurationService } from '../../../../../editor/common/services/textResourceConfiguration.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { mainWindow } from '../../../../../base/browser/window.js';
export class DocumentSymbolNavigationLabelProvider {
    getKeyboardNavigationLabel(element) {
        if (element instanceof OutlineGroup) {
            return element.label;
        }
        else {
            return element.symbol.name;
        }
    }
}
export class DocumentSymbolAccessibilityProvider {
    constructor(_ariaLabel) {
        this._ariaLabel = _ariaLabel;
    }
    getWidgetAriaLabel() {
        return this._ariaLabel;
    }
    getAriaLabel(element) {
        if (element instanceof OutlineGroup) {
            return element.label;
        }
        else {
            return getAriaLabelForSymbol(element.symbol.name, element.symbol.kind);
        }
    }
}
export class DocumentSymbolIdentityProvider {
    getId(element) {
        return element.id;
    }
}
class DocumentSymbolGroupTemplate {
    static { this.id = 'DocumentSymbolGroupTemplate'; }
    constructor(labelContainer, label) {
        this.labelContainer = labelContainer;
        this.label = label;
    }
    dispose() {
        this.label.dispose();
    }
}
class DocumentSymbolTemplate {
    static { this.id = 'DocumentSymbolTemplate'; }
    constructor(container, iconLabel, iconClass, decoration) {
        this.container = container;
        this.iconLabel = iconLabel;
        this.iconClass = iconClass;
        this.decoration = decoration;
    }
}
export class DocumentSymbolVirtualDelegate {
    getHeight(_element) {
        return 22;
    }
    getTemplateId(element) {
        return element instanceof OutlineGroup
            ? DocumentSymbolGroupTemplate.id
            : DocumentSymbolTemplate.id;
    }
}
export class DocumentSymbolGroupRenderer {
    constructor() {
        this.templateId = DocumentSymbolGroupTemplate.id;
    }
    renderTemplate(container) {
        const labelContainer = dom.$('.outline-element-label');
        container.classList.add('outline-element');
        dom.append(container, labelContainer);
        return new DocumentSymbolGroupTemplate(labelContainer, new HighlightedLabel(labelContainer));
    }
    renderElement(node, _index, template) {
        template.label.set(node.element.label, createMatches(node.filterData));
    }
    disposeTemplate(_template) {
        _template.dispose();
    }
}
let DocumentSymbolRenderer = class DocumentSymbolRenderer {
    constructor(_renderMarker, target, _configurationService, _themeService) {
        this._renderMarker = _renderMarker;
        this._configurationService = _configurationService;
        this._themeService = _themeService;
        this.templateId = DocumentSymbolTemplate.id;
    }
    renderTemplate(container) {
        container.classList.add('outline-element');
        const iconLabel = new IconLabel(container, { supportHighlights: true });
        const iconClass = dom.$('.outline-element-icon');
        const decoration = dom.$('.outline-element-decoration');
        container.prepend(iconClass);
        container.appendChild(decoration);
        return new DocumentSymbolTemplate(container, iconLabel, iconClass, decoration);
    }
    renderElement(node, _index, template) {
        const { element } = node;
        const extraClasses = ['nowrap'];
        const options = {
            matches: createMatches(node.filterData),
            labelEscapeNewLines: true,
            extraClasses,
            title: localize('title.template', "{0} ({1})", element.symbol.name, symbolKindNames[element.symbol.kind])
        };
        if (this._configurationService.getValue("outline.icons" /* OutlineConfigKeys.icons */)) {
            // add styles for the icons
            template.iconClass.className = '';
            template.iconClass.classList.add('outline-element-icon', 'inline', ...ThemeIcon.asClassNameArray(SymbolKinds.toIcon(element.symbol.kind)));
        }
        if (element.symbol.tags.indexOf(1 /* SymbolTag.Deprecated */) >= 0) {
            extraClasses.push(`deprecated`);
            options.matches = [];
        }
        template.iconLabel.setLabel(element.symbol.name, element.symbol.detail, options);
        if (this._renderMarker) {
            this._renderMarkerInfo(element, template);
        }
    }
    _renderMarkerInfo(element, template) {
        if (!element.marker) {
            dom.hide(template.decoration);
            template.container.style.removeProperty('--outline-element-color');
            return;
        }
        const { count, topSev } = element.marker;
        const color = this._themeService.getColorTheme().getColor(topSev === MarkerSeverity.Error ? listErrorForeground : listWarningForeground);
        const cssColor = color ? color.toString() : 'inherit';
        // color of the label
        const problem = this._configurationService.getValue('problems.visibility');
        const configProblems = this._configurationService.getValue("outline.problems.colors" /* OutlineConfigKeys.problemsColors */);
        if (!problem || !configProblems) {
            template.container.style.removeProperty('--outline-element-color');
        }
        else {
            template.container.style.setProperty('--outline-element-color', cssColor);
        }
        // badge with color/rollup
        if (problem === undefined) {
            return;
        }
        const configBadges = this._configurationService.getValue("outline.problems.badges" /* OutlineConfigKeys.problemsBadges */);
        if (!configBadges || !problem) {
            dom.hide(template.decoration);
        }
        else if (count > 0) {
            dom.show(template.decoration);
            template.decoration.classList.remove('bubble');
            template.decoration.innerText = count < 10 ? count.toString() : '+9';
            template.decoration.title = count === 1 ? localize('1.problem', "1 problem in this element") : localize('N.problem', "{0} problems in this element", count);
            template.decoration.style.setProperty('--outline-element-color', cssColor);
        }
        else {
            dom.show(template.decoration);
            template.decoration.classList.add('bubble');
            template.decoration.innerText = '\uea71';
            template.decoration.title = localize('deep.problem', "Contains elements with problems");
            template.decoration.style.setProperty('--outline-element-color', cssColor);
        }
    }
    disposeTemplate(_template) {
        _template.iconLabel.dispose();
    }
};
DocumentSymbolRenderer = __decorate([
    __param(2, IConfigurationService),
    __param(3, IThemeService),
    __metadata("design:paramtypes", [Boolean, Number, Object, Object])
], DocumentSymbolRenderer);
export { DocumentSymbolRenderer };
let DocumentSymbolFilter = class DocumentSymbolFilter {
    static { DocumentSymbolFilter_1 = this; }
    static { this.kindToConfigName = Object.freeze({
        [0 /* SymbolKind.File */]: 'showFiles',
        [1 /* SymbolKind.Module */]: 'showModules',
        [2 /* SymbolKind.Namespace */]: 'showNamespaces',
        [3 /* SymbolKind.Package */]: 'showPackages',
        [4 /* SymbolKind.Class */]: 'showClasses',
        [5 /* SymbolKind.Method */]: 'showMethods',
        [6 /* SymbolKind.Property */]: 'showProperties',
        [7 /* SymbolKind.Field */]: 'showFields',
        [8 /* SymbolKind.Constructor */]: 'showConstructors',
        [9 /* SymbolKind.Enum */]: 'showEnums',
        [10 /* SymbolKind.Interface */]: 'showInterfaces',
        [11 /* SymbolKind.Function */]: 'showFunctions',
        [12 /* SymbolKind.Variable */]: 'showVariables',
        [13 /* SymbolKind.Constant */]: 'showConstants',
        [14 /* SymbolKind.String */]: 'showStrings',
        [15 /* SymbolKind.Number */]: 'showNumbers',
        [16 /* SymbolKind.Boolean */]: 'showBooleans',
        [17 /* SymbolKind.Array */]: 'showArrays',
        [18 /* SymbolKind.Object */]: 'showObjects',
        [19 /* SymbolKind.Key */]: 'showKeys',
        [20 /* SymbolKind.Null */]: 'showNull',
        [21 /* SymbolKind.EnumMember */]: 'showEnumMembers',
        [22 /* SymbolKind.Struct */]: 'showStructs',
        [23 /* SymbolKind.Event */]: 'showEvents',
        [24 /* SymbolKind.Operator */]: 'showOperators',
        [25 /* SymbolKind.TypeParameter */]: 'showTypeParameters',
    }); }
    constructor(_prefix, _textResourceConfigService) {
        this._prefix = _prefix;
        this._textResourceConfigService = _textResourceConfigService;
    }
    filter(element) {
        const outline = OutlineModel.get(element);
        if (!(element instanceof OutlineElement)) {
            return true;
        }
        const configName = DocumentSymbolFilter_1.kindToConfigName[element.symbol.kind];
        const configKey = `${this._prefix}.${configName}`;
        return this._textResourceConfigService.getValue(outline?.uri, configKey);
    }
};
DocumentSymbolFilter = DocumentSymbolFilter_1 = __decorate([
    __param(1, ITextResourceConfigurationService),
    __metadata("design:paramtypes", [String, Object])
], DocumentSymbolFilter);
export { DocumentSymbolFilter };
export class DocumentSymbolComparator {
    constructor() {
        this._collator = new dom.WindowIdleValue(mainWindow, () => new Intl.Collator(undefined, { numeric: true }));
    }
    compareByPosition(a, b) {
        if (a instanceof OutlineGroup && b instanceof OutlineGroup) {
            return a.order - b.order;
        }
        else if (a instanceof OutlineElement && b instanceof OutlineElement) {
            return Range.compareRangesUsingStarts(a.symbol.range, b.symbol.range) || this._collator.value.compare(a.symbol.name, b.symbol.name);
        }
        return 0;
    }
    compareByType(a, b) {
        if (a instanceof OutlineGroup && b instanceof OutlineGroup) {
            return a.order - b.order;
        }
        else if (a instanceof OutlineElement && b instanceof OutlineElement) {
            return a.symbol.kind - b.symbol.kind || this._collator.value.compare(a.symbol.name, b.symbol.name);
        }
        return 0;
    }
    compareByName(a, b) {
        if (a instanceof OutlineGroup && b instanceof OutlineGroup) {
            return a.order - b.order;
        }
        else if (a instanceof OutlineElement && b instanceof OutlineElement) {
            return this._collator.value.compare(a.symbol.name, b.symbol.name) || Range.compareRangesUsingStarts(a.symbol.range, b.symbol.range);
        }
        return 0;
    }
}
