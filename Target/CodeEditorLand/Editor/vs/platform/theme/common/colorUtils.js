import { assertNever } from '../../../base/common/assert.js';
import { RunOnceScheduler } from '../../../base/common/async.js';
import { Color } from '../../../base/common/color.js';
import { Emitter } from '../../../base/common/event.js';
import { Extensions as JSONExtensions } from '../../jsonschemas/common/jsonContributionRegistry.js';
import * as platform from '../../registry/common/platform.js';
import * as nls from '../../../nls.js';
export function asCssVariableName(colorIdent) {
    return `--vscode-${colorIdent.replace(/\./g, '-')}`;
}
export function asCssVariable(color) {
    return `var(${asCssVariableName(color)})`;
}
export function asCssVariableWithDefault(color, defaultCssValue) {
    return `var(${asCssVariableName(color)}, ${defaultCssValue})`;
}
export function isColorDefaults(value) {
    return value !== null && typeof value === 'object' && 'light' in value && 'dark' in value;
}
export const Extensions = {
    ColorContribution: 'base.contributions.colors'
};
export const DEFAULT_COLOR_CONFIG_VALUE = 'default';
class ColorRegistry {
    constructor() {
        this._onDidChangeSchema = new Emitter();
        this.onDidChangeSchema = this._onDidChangeSchema.event;
        this.colorSchema = { type: 'object', properties: {} };
        this.colorReferenceSchema = { type: 'string', enum: [], enumDescriptions: [] };
        this.colorsById = {};
    }
    notifyThemeUpdate(colorThemeData) {
        for (const key of Object.keys(this.colorsById)) {
            const color = colorThemeData.getColor(key);
            if (color) {
                this.colorSchema.properties[key].oneOf[0].defaultSnippets[0].body = `\${1:${color.toString()}}`;
            }
        }
        this._onDidChangeSchema.fire();
    }
    registerColor(id, defaults, description, needsTransparency = false, deprecationMessage) {
        const colorContribution = { id, description, defaults, needsTransparency, deprecationMessage };
        this.colorsById[id] = colorContribution;
        const propertySchema = { type: 'string', format: 'color-hex', defaultSnippets: [{ body: '${1:#ff0000}' }] };
        if (deprecationMessage) {
            propertySchema.deprecationMessage = deprecationMessage;
        }
        if (needsTransparency) {
            propertySchema.pattern = '^#(?:(?<rgba>[0-9a-fA-f]{3}[0-9a-eA-E])|(?:[0-9a-fA-F]{6}(?:(?![fF]{2})(?:[0-9a-fA-F]{2}))))?$';
            propertySchema.patternErrorMessage = nls.localize('transparecyRequired', 'This color must be transparent or it will obscure content');
        }
        this.colorSchema.properties[id] = {
            description,
            oneOf: [
                propertySchema,
                { type: 'string', const: DEFAULT_COLOR_CONFIG_VALUE, description: nls.localize('useDefault', 'Use the default color.') }
            ]
        };
        this.colorReferenceSchema.enum.push(id);
        this.colorReferenceSchema.enumDescriptions.push(description);
        this._onDidChangeSchema.fire();
        return id;
    }
    deregisterColor(id) {
        delete this.colorsById[id];
        delete this.colorSchema.properties[id];
        const index = this.colorReferenceSchema.enum.indexOf(id);
        if (index !== -1) {
            this.colorReferenceSchema.enum.splice(index, 1);
            this.colorReferenceSchema.enumDescriptions.splice(index, 1);
        }
        this._onDidChangeSchema.fire();
    }
    getColors() {
        return Object.keys(this.colorsById).map(id => this.colorsById[id]);
    }
    resolveDefaultColor(id, theme) {
        const colorDesc = this.colorsById[id];
        if (colorDesc?.defaults) {
            const colorValue = isColorDefaults(colorDesc.defaults) ? colorDesc.defaults[theme.type] : colorDesc.defaults;
            return resolveColorValue(colorValue, theme);
        }
        return undefined;
    }
    getColorSchema() {
        return this.colorSchema;
    }
    getColorReferenceSchema() {
        return this.colorReferenceSchema;
    }
    toString() {
        const sorter = (a, b) => {
            const cat1 = a.indexOf('.') === -1 ? 0 : 1;
            const cat2 = b.indexOf('.') === -1 ? 0 : 1;
            if (cat1 !== cat2) {
                return cat1 - cat2;
            }
            return a.localeCompare(b);
        };
        return Object.keys(this.colorsById).sort(sorter).map(k => `- \`${k}\`: ${this.colorsById[k].description}`).join('\n');
    }
}
const colorRegistry = new ColorRegistry();
platform.Registry.add(Extensions.ColorContribution, colorRegistry);
export function registerColor(id, defaults, description, needsTransparency, deprecationMessage) {
    return colorRegistry.registerColor(id, defaults, description, needsTransparency, deprecationMessage);
}
export function getColorRegistry() {
    return colorRegistry;
}
export function executeTransform(transform, theme) {
    switch (transform.op) {
        case 0:
            return resolveColorValue(transform.value, theme)?.darken(transform.factor);
        case 1:
            return resolveColorValue(transform.value, theme)?.lighten(transform.factor);
        case 2:
            return resolveColorValue(transform.value, theme)?.transparent(transform.factor);
        case 3: {
            const backgroundColor = resolveColorValue(transform.background, theme);
            if (!backgroundColor) {
                return resolveColorValue(transform.value, theme);
            }
            return resolveColorValue(transform.value, theme)?.makeOpaque(backgroundColor);
        }
        case 4:
            for (const candidate of transform.values) {
                const color = resolveColorValue(candidate, theme);
                if (color) {
                    return color;
                }
            }
            return undefined;
        case 6:
            return resolveColorValue(theme.defines(transform.if) ? transform.then : transform.else, theme);
        case 5: {
            const from = resolveColorValue(transform.value, theme);
            if (!from) {
                return undefined;
            }
            const backgroundColor = resolveColorValue(transform.background, theme);
            if (!backgroundColor) {
                return from.transparent(transform.factor * transform.transparency);
            }
            return from.isDarkerThan(backgroundColor)
                ? Color.getLighterColor(from, backgroundColor, transform.factor).transparent(transform.transparency)
                : Color.getDarkerColor(from, backgroundColor, transform.factor).transparent(transform.transparency);
        }
        default:
            throw assertNever(transform);
    }
}
export function darken(colorValue, factor) {
    return { op: 0, value: colorValue, factor };
}
export function lighten(colorValue, factor) {
    return { op: 1, value: colorValue, factor };
}
export function transparent(colorValue, factor) {
    return { op: 2, value: colorValue, factor };
}
export function opaque(colorValue, background) {
    return { op: 3, value: colorValue, background };
}
export function oneOf(...colorValues) {
    return { op: 4, values: colorValues };
}
export function ifDefinedThenElse(ifArg, thenArg, elseArg) {
    return { op: 6, if: ifArg, then: thenArg, else: elseArg };
}
export function lessProminent(colorValue, backgroundColorValue, factor, transparency) {
    return { op: 5, value: colorValue, background: backgroundColorValue, factor, transparency };
}
export function resolveColorValue(colorValue, theme) {
    if (colorValue === null) {
        return undefined;
    }
    else if (typeof colorValue === 'string') {
        if (colorValue[0] === '#') {
            return Color.fromHex(colorValue);
        }
        return theme.getColor(colorValue);
    }
    else if (colorValue instanceof Color) {
        return colorValue;
    }
    else if (typeof colorValue === 'object') {
        return executeTransform(colorValue, theme);
    }
    return undefined;
}
export const workbenchColorsSchemaId = 'vscode://schemas/workbench-colors';
const schemaRegistry = platform.Registry.as(JSONExtensions.JSONContribution);
schemaRegistry.registerSchema(workbenchColorsSchemaId, colorRegistry.getColorSchema());
const delayer = new RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(workbenchColorsSchemaId), 200);
colorRegistry.onDidChangeSchema(() => {
    if (!delayer.isScheduled()) {
        delayer.schedule();
    }
});
