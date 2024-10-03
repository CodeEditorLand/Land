import { localize, localize2 } from '../../../../nls.js';
import { Extensions as ViewExtensions } from '../../../common/views.js';
import { OutlinePane } from './outlinePane.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { VIEW_CONTAINER } from '../../files/browser/explorerViewlet.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { IOutlinePane } from './outline.js';
import './outlineActions.js';
const outlineViewIcon = registerIcon('outline-view-icon', Codicon.symbolClass, localize('outlineViewIcon', 'View icon of the outline view.'));
Registry.as(ViewExtensions.ViewsRegistry).registerViews([{
        id: IOutlinePane.Id,
        name: localize2('name', "Outline"),
        containerIcon: outlineViewIcon,
        ctorDescriptor: new SyncDescriptor(OutlinePane),
        canToggleVisibility: true,
        canMoveView: true,
        hideByDefault: false,
        collapsed: true,
        order: 2,
        weight: 30,
        focusCommand: { id: 'outline.focus' }
    }], VIEW_CONTAINER);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    'id': 'outline',
    'order': 117,
    'title': localize('outlineConfigurationTitle', "Outline"),
    'type': 'object',
    'properties': {
        ["outline.icons"]: {
            'description': localize('outline.showIcons', "Render Outline elements with icons."),
            'type': 'boolean',
            'default': true
        },
        ["outline.collapseItems"]: {
            'description': localize('outline.initialState', "Controls whether Outline items are collapsed or expanded."),
            'type': 'string',
            scope: 5,
            'enum': [
                'alwaysCollapse',
                'alwaysExpand'
            ],
            'enumDescriptions': [
                localize('outline.initialState.collapsed', "Collapse all items."),
                localize('outline.initialState.expanded', "Expand all items.")
            ],
            'default': 'alwaysExpand'
        },
        ["outline.problems.enabled"]: {
            'markdownDescription': localize('outline.showProblem', "Show errors and warnings on Outline elements. Overwritten by {0} when it is off.", '`#problems.visibility#`'),
            'type': 'boolean',
            'default': true
        },
        ["outline.problems.colors"]: {
            'markdownDescription': localize('outline.problem.colors', "Use colors for errors and warnings on Outline elements. Overwritten by {0} when it is off.", '`#problems.visibility#`'),
            'type': 'boolean',
            'default': true
        },
        ["outline.problems.badges"]: {
            'markdownDescription': localize('outline.problems.badges', "Use badges for errors and warnings on Outline elements. Overwritten by {0} when it is off.", '`#problems.visibility#`'),
            'type': 'boolean',
            'default': true
        },
        'outline.showFiles': {
            type: 'boolean',
            scope: 5,
            default: true,
            markdownDescription: localize('filteredTypes.file', "When enabled, Outline shows `file`-symbols.")
        },
        'outline.showModules': {
            type: 'boolean',
            scope: 5,
            default: true,
            markdownDescription: localize('filteredTypes.module', "When enabled, Outline shows `module`-symbols.")
        },
        'outline.showNamespaces': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.namespace', "When enabled, Outline shows `namespace`-symbols.")
        },
        'outline.showPackages': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.package', "When enabled, Outline shows `package`-symbols.")
        },
        'outline.showClasses': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.class', "When enabled, Outline shows `class`-symbols.")
        },
        'outline.showMethods': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.method', "When enabled, Outline shows `method`-symbols.")
        },
        'outline.showProperties': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.property', "When enabled, Outline shows `property`-symbols.")
        },
        'outline.showFields': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.field', "When enabled, Outline shows `field`-symbols.")
        },
        'outline.showConstructors': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.constructor', "When enabled, Outline shows `constructor`-symbols.")
        },
        'outline.showEnums': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.enum', "When enabled, Outline shows `enum`-symbols.")
        },
        'outline.showInterfaces': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.interface', "When enabled, Outline shows `interface`-symbols.")
        },
        'outline.showFunctions': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.function', "When enabled, Outline shows `function`-symbols.")
        },
        'outline.showVariables': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.variable', "When enabled, Outline shows `variable`-symbols.")
        },
        'outline.showConstants': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.constant', "When enabled, Outline shows `constant`-symbols.")
        },
        'outline.showStrings': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.string', "When enabled, Outline shows `string`-symbols.")
        },
        'outline.showNumbers': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.number', "When enabled, Outline shows `number`-symbols.")
        },
        'outline.showBooleans': {
            type: 'boolean',
            scope: 5,
            default: true,
            markdownDescription: localize('filteredTypes.boolean', "When enabled, Outline shows `boolean`-symbols.")
        },
        'outline.showArrays': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.array', "When enabled, Outline shows `array`-symbols.")
        },
        'outline.showObjects': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.object', "When enabled, Outline shows `object`-symbols.")
        },
        'outline.showKeys': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.key', "When enabled, Outline shows `key`-symbols.")
        },
        'outline.showNull': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.null', "When enabled, Outline shows `null`-symbols.")
        },
        'outline.showEnumMembers': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.enumMember', "When enabled, Outline shows `enumMember`-symbols.")
        },
        'outline.showStructs': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.struct', "When enabled, Outline shows `struct`-symbols.")
        },
        'outline.showEvents': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.event', "When enabled, Outline shows `event`-symbols.")
        },
        'outline.showOperators': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.operator', "When enabled, Outline shows `operator`-symbols.")
        },
        'outline.showTypeParameters': {
            type: 'boolean',
            default: true,
            scope: 5,
            markdownDescription: localize('filteredTypes.typeParameter', "When enabled, Outline shows `typeParameter`-symbols.")
        }
    }
});
