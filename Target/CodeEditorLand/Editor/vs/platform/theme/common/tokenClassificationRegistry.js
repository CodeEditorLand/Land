/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { RunOnceScheduler } from '../../../base/common/async.js';
import { Color } from '../../../base/common/color.js';
import { Emitter } from '../../../base/common/event.js';
import * as nls from '../../../nls.js';
import { Extensions as JSONExtensions } from '../../jsonschemas/common/jsonContributionRegistry.js';
import * as platform from '../../registry/common/platform.js';
const TOKEN_TYPE_WILDCARD = '*';
const TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR = ':';
const CLASSIFIER_MODIFIER_SEPARATOR = '.';
const idPattern = '\\w+[-_\\w+]*';
export const typeAndModifierIdPattern = `^${idPattern}$`;
const selectorPattern = `^(${idPattern}|\\*)(\\${CLASSIFIER_MODIFIER_SEPARATOR}${idPattern})*(${TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR}${idPattern})?$`;
const fontStylePattern = '^(\\s*(italic|bold|underline|strikethrough))*\\s*$';
export class TokenStyle {
    constructor(foreground, bold, underline, strikethrough, italic) {
        this.foreground = foreground;
        this.bold = bold;
        this.underline = underline;
        this.strikethrough = strikethrough;
        this.italic = italic;
    }
}
(function (TokenStyle) {
    function toJSONObject(style) {
        return {
            _foreground: style.foreground === undefined ? null : Color.Format.CSS.formatHexA(style.foreground, true),
            _bold: style.bold === undefined ? null : style.bold,
            _underline: style.underline === undefined ? null : style.underline,
            _italic: style.italic === undefined ? null : style.italic,
            _strikethrough: style.strikethrough === undefined ? null : style.strikethrough,
        };
    }
    TokenStyle.toJSONObject = toJSONObject;
    function fromJSONObject(obj) {
        if (obj) {
            const boolOrUndef = (b) => (typeof b === 'boolean') ? b : undefined;
            const colorOrUndef = (s) => (typeof s === 'string') ? Color.fromHex(s) : undefined;
            return new TokenStyle(colorOrUndef(obj._foreground), boolOrUndef(obj._bold), boolOrUndef(obj._underline), boolOrUndef(obj._strikethrough), boolOrUndef(obj._italic));
        }
        return undefined;
    }
    TokenStyle.fromJSONObject = fromJSONObject;
    function equals(s1, s2) {
        if (s1 === s2) {
            return true;
        }
        return s1 !== undefined && s2 !== undefined
            && (s1.foreground instanceof Color ? s1.foreground.equals(s2.foreground) : s2.foreground === undefined)
            && s1.bold === s2.bold
            && s1.underline === s2.underline
            && s1.strikethrough === s2.strikethrough
            && s1.italic === s2.italic;
    }
    TokenStyle.equals = equals;
    function is(s) {
        return s instanceof TokenStyle;
    }
    TokenStyle.is = is;
    function fromData(data) {
        return new TokenStyle(data.foreground, data.bold, data.underline, data.strikethrough, data.italic);
    }
    TokenStyle.fromData = fromData;
    function fromSettings(foreground, fontStyle, bold, underline, strikethrough, italic) {
        let foregroundColor = undefined;
        if (foreground !== undefined) {
            foregroundColor = Color.fromHex(foreground);
        }
        if (fontStyle !== undefined) {
            bold = italic = underline = strikethrough = false;
            const expression = /italic|bold|underline|strikethrough/g;
            let match;
            while ((match = expression.exec(fontStyle))) {
                switch (match[0]) {
                    case 'bold':
                        bold = true;
                        break;
                    case 'italic':
                        italic = true;
                        break;
                    case 'underline':
                        underline = true;
                        break;
                    case 'strikethrough':
                        strikethrough = true;
                        break;
                }
            }
        }
        return new TokenStyle(foregroundColor, bold, underline, strikethrough, italic);
    }
    TokenStyle.fromSettings = fromSettings;
})(TokenStyle || (TokenStyle = {}));
export var SemanticTokenRule;
(function (SemanticTokenRule) {
    function fromJSONObject(registry, o) {
        if (o && typeof o._selector === 'string' && o._style) {
            const style = TokenStyle.fromJSONObject(o._style);
            if (style) {
                try {
                    return { selector: registry.parseTokenSelector(o._selector), style };
                }
                catch (_ignore) {
                }
            }
        }
        return undefined;
    }
    SemanticTokenRule.fromJSONObject = fromJSONObject;
    function toJSONObject(rule) {
        return {
            _selector: rule.selector.id,
            _style: TokenStyle.toJSONObject(rule.style)
        };
    }
    SemanticTokenRule.toJSONObject = toJSONObject;
    function equals(r1, r2) {
        if (r1 === r2) {
            return true;
        }
        return r1 !== undefined && r2 !== undefined
            && r1.selector && r2.selector && r1.selector.id === r2.selector.id
            && TokenStyle.equals(r1.style, r2.style);
    }
    SemanticTokenRule.equals = equals;
    function is(r) {
        return r && r.selector && typeof r.selector.id === 'string' && TokenStyle.is(r.style);
    }
    SemanticTokenRule.is = is;
})(SemanticTokenRule || (SemanticTokenRule = {}));
// TokenStyle registry
const Extensions = {
    TokenClassificationContribution: 'base.contributions.tokenClassification'
};
class TokenClassificationRegistry {
    constructor() {
        this._onDidChangeSchema = new Emitter();
        this.onDidChangeSchema = this._onDidChangeSchema.event;
        this.currentTypeNumber = 0;
        this.currentModifierBit = 1;
        this.tokenStylingDefaultRules = [];
        this.tokenStylingSchema = {
            type: 'object',
            properties: {},
            patternProperties: {
                [selectorPattern]: getStylingSchemeEntry()
            },
            //errorMessage: nls.localize('schema.token.errors', 'Valid token selectors have the form (*|tokenType)(.tokenModifier)*(:tokenLanguage)?.'),
            additionalProperties: false,
            definitions: {
                style: {
                    type: 'object',
                    description: nls.localize('schema.token.settings', 'Colors and styles for the token.'),
                    properties: {
                        foreground: {
                            type: 'string',
                            description: nls.localize('schema.token.foreground', 'Foreground color for the token.'),
                            format: 'color-hex',
                            default: '#ff0000'
                        },
                        background: {
                            type: 'string',
                            deprecationMessage: nls.localize('schema.token.background.warning', 'Token background colors are currently not supported.')
                        },
                        fontStyle: {
                            type: 'string',
                            description: nls.localize('schema.token.fontStyle', 'Sets the all font styles of the rule: \'italic\', \'bold\', \'underline\' or \'strikethrough\' or a combination. All styles that are not listed are unset. The empty string unsets all styles.'),
                            pattern: fontStylePattern,
                            patternErrorMessage: nls.localize('schema.fontStyle.error', 'Font style must be \'italic\', \'bold\', \'underline\' or \'strikethrough\' or a combination. The empty string unsets all styles.'),
                            defaultSnippets: [
                                { label: nls.localize('schema.token.fontStyle.none', 'None (clear inherited style)'), bodyText: '""' },
                                { body: 'italic' },
                                { body: 'bold' },
                                { body: 'underline' },
                                { body: 'strikethrough' },
                                { body: 'italic bold' },
                                { body: 'italic underline' },
                                { body: 'italic strikethrough' },
                                { body: 'bold underline' },
                                { body: 'bold strikethrough' },
                                { body: 'underline strikethrough' },
                                { body: 'italic bold underline' },
                                { body: 'italic bold strikethrough' },
                                { body: 'italic underline strikethrough' },
                                { body: 'bold underline strikethrough' },
                                { body: 'italic bold underline strikethrough' }
                            ]
                        },
                        bold: {
                            type: 'boolean',
                            description: nls.localize('schema.token.bold', 'Sets or unsets the font style to bold. Note, the presence of \'fontStyle\' overrides this setting.'),
                        },
                        italic: {
                            type: 'boolean',
                            description: nls.localize('schema.token.italic', 'Sets or unsets the font style to italic. Note, the presence of \'fontStyle\' overrides this setting.'),
                        },
                        underline: {
                            type: 'boolean',
                            description: nls.localize('schema.token.underline', 'Sets or unsets the font style to underline. Note, the presence of \'fontStyle\' overrides this setting.'),
                        },
                        strikethrough: {
                            type: 'boolean',
                            description: nls.localize('schema.token.strikethrough', 'Sets or unsets the font style to strikethrough. Note, the presence of \'fontStyle\' overrides this setting.'),
                        }
                    },
                    defaultSnippets: [{ body: { foreground: '${1:#FF0000}', fontStyle: '${2:bold}' } }]
                }
            }
        };
        this.tokenTypeById = Object.create(null);
        this.tokenModifierById = Object.create(null);
        this.typeHierarchy = Object.create(null);
    }
    registerTokenType(id, description, superType, deprecationMessage) {
        if (!id.match(typeAndModifierIdPattern)) {
            throw new Error('Invalid token type id.');
        }
        if (superType && !superType.match(typeAndModifierIdPattern)) {
            throw new Error('Invalid token super type id.');
        }
        const num = this.currentTypeNumber++;
        const tokenStyleContribution = { num, id, superType, description, deprecationMessage };
        this.tokenTypeById[id] = tokenStyleContribution;
        const stylingSchemeEntry = getStylingSchemeEntry(description, deprecationMessage);
        this.tokenStylingSchema.properties[id] = stylingSchemeEntry;
        this.typeHierarchy = Object.create(null);
    }
    registerTokenModifier(id, description, deprecationMessage) {
        if (!id.match(typeAndModifierIdPattern)) {
            throw new Error('Invalid token modifier id.');
        }
        const num = this.currentModifierBit;
        this.currentModifierBit = this.currentModifierBit * 2;
        const tokenStyleContribution = { num, id, description, deprecationMessage };
        this.tokenModifierById[id] = tokenStyleContribution;
        this.tokenStylingSchema.properties[`*.${id}`] = getStylingSchemeEntry(description, deprecationMessage);
    }
    parseTokenSelector(selectorString, language) {
        const selector = parseClassifierString(selectorString, language);
        if (!selector.type) {
            return {
                match: () => -1,
                id: '$invalid'
            };
        }
        return {
            match: (type, modifiers, language) => {
                let score = 0;
                if (selector.language !== undefined) {
                    if (selector.language !== language) {
                        return -1;
                    }
                    score += 10;
                }
                if (selector.type !== TOKEN_TYPE_WILDCARD) {
                    const hierarchy = this.getTypeHierarchy(type);
                    const level = hierarchy.indexOf(selector.type);
                    if (level === -1) {
                        return -1;
                    }
                    score += (100 - level);
                }
                // all selector modifiers must be present
                for (const selectorModifier of selector.modifiers) {
                    if (modifiers.indexOf(selectorModifier) === -1) {
                        return -1;
                    }
                }
                return score + selector.modifiers.length * 100;
            },
            id: `${[selector.type, ...selector.modifiers.sort()].join('.')}${selector.language !== undefined ? ':' + selector.language : ''}`
        };
    }
    registerTokenStyleDefault(selector, defaults) {
        this.tokenStylingDefaultRules.push({ selector, defaults });
    }
    deregisterTokenStyleDefault(selector) {
        const selectorString = selector.id;
        this.tokenStylingDefaultRules = this.tokenStylingDefaultRules.filter(r => r.selector.id !== selectorString);
    }
    deregisterTokenType(id) {
        delete this.tokenTypeById[id];
        delete this.tokenStylingSchema.properties[id];
        this.typeHierarchy = Object.create(null);
    }
    deregisterTokenModifier(id) {
        delete this.tokenModifierById[id];
        delete this.tokenStylingSchema.properties[`*.${id}`];
    }
    getTokenTypes() {
        return Object.keys(this.tokenTypeById).map(id => this.tokenTypeById[id]);
    }
    getTokenModifiers() {
        return Object.keys(this.tokenModifierById).map(id => this.tokenModifierById[id]);
    }
    getTokenStylingSchema() {
        return this.tokenStylingSchema;
    }
    getTokenStylingDefaultRules() {
        return this.tokenStylingDefaultRules;
    }
    getTypeHierarchy(typeId) {
        let hierarchy = this.typeHierarchy[typeId];
        if (!hierarchy) {
            this.typeHierarchy[typeId] = hierarchy = [typeId];
            let type = this.tokenTypeById[typeId];
            while (type && type.superType) {
                hierarchy.push(type.superType);
                type = this.tokenTypeById[type.superType];
            }
        }
        return hierarchy;
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
        return Object.keys(this.tokenTypeById).sort(sorter).map(k => `- \`${k}\`: ${this.tokenTypeById[k].description}`).join('\n');
    }
}
const CHAR_LANGUAGE = TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR.charCodeAt(0);
const CHAR_MODIFIER = CLASSIFIER_MODIFIER_SEPARATOR.charCodeAt(0);
export function parseClassifierString(s, defaultLanguage) {
    let k = s.length;
    let language = defaultLanguage;
    const modifiers = [];
    for (let i = k - 1; i >= 0; i--) {
        const ch = s.charCodeAt(i);
        if (ch === CHAR_LANGUAGE || ch === CHAR_MODIFIER) {
            const segment = s.substring(i + 1, k);
            k = i;
            if (ch === CHAR_LANGUAGE) {
                language = segment;
            }
            else {
                modifiers.push(segment);
            }
        }
    }
    const type = s.substring(0, k);
    return { type, modifiers, language };
}
const tokenClassificationRegistry = createDefaultTokenClassificationRegistry();
platform.Registry.add(Extensions.TokenClassificationContribution, tokenClassificationRegistry);
function createDefaultTokenClassificationRegistry() {
    const registry = new TokenClassificationRegistry();
    function registerTokenType(id, description, scopesToProbe = [], superType, deprecationMessage) {
        registry.registerTokenType(id, description, superType, deprecationMessage);
        if (scopesToProbe) {
            registerTokenStyleDefault(id, scopesToProbe);
        }
        return id;
    }
    function registerTokenStyleDefault(selectorString, scopesToProbe) {
        try {
            const selector = registry.parseTokenSelector(selectorString);
            registry.registerTokenStyleDefault(selector, { scopesToProbe });
        }
        catch (e) {
            console.log(e);
        }
    }
    // default token types
    registerTokenType('comment', nls.localize('comment', "Style for comments."), [['comment']]);
    registerTokenType('string', nls.localize('string', "Style for strings."), [['string']]);
    registerTokenType('keyword', nls.localize('keyword', "Style for keywords."), [['keyword.control']]);
    registerTokenType('number', nls.localize('number', "Style for numbers."), [['constant.numeric']]);
    registerTokenType('regexp', nls.localize('regexp', "Style for expressions."), [['constant.regexp']]);
    registerTokenType('operator', nls.localize('operator', "Style for operators."), [['keyword.operator']]);
    registerTokenType('namespace', nls.localize('namespace', "Style for namespaces."), [['entity.name.namespace']]);
    registerTokenType('type', nls.localize('type', "Style for types."), [['entity.name.type'], ['support.type']]);
    registerTokenType('struct', nls.localize('struct', "Style for structs."), [['entity.name.type.struct']]);
    registerTokenType('class', nls.localize('class', "Style for classes."), [['entity.name.type.class'], ['support.class']]);
    registerTokenType('interface', nls.localize('interface', "Style for interfaces."), [['entity.name.type.interface']]);
    registerTokenType('enum', nls.localize('enum', "Style for enums."), [['entity.name.type.enum']]);
    registerTokenType('typeParameter', nls.localize('typeParameter', "Style for type parameters."), [['entity.name.type.parameter']]);
    registerTokenType('function', nls.localize('function', "Style for functions"), [['entity.name.function'], ['support.function']]);
    registerTokenType('member', nls.localize('member', "Style for member functions"), [], 'method', 'Deprecated use `method` instead');
    registerTokenType('method', nls.localize('method', "Style for method (member functions)"), [['entity.name.function.member'], ['support.function']]);
    registerTokenType('macro', nls.localize('macro', "Style for macros."), [['entity.name.function.preprocessor']]);
    registerTokenType('variable', nls.localize('variable', "Style for variables."), [['variable.other.readwrite'], ['entity.name.variable']]);
    registerTokenType('parameter', nls.localize('parameter', "Style for parameters."), [['variable.parameter']]);
    registerTokenType('property', nls.localize('property', "Style for properties."), [['variable.other.property']]);
    registerTokenType('enumMember', nls.localize('enumMember', "Style for enum members."), [['variable.other.enummember']]);
    registerTokenType('event', nls.localize('event', "Style for events."), [['variable.other.event']]);
    registerTokenType('decorator', nls.localize('decorator', "Style for decorators & annotations."), [['entity.name.decorator'], ['entity.name.function']]);
    registerTokenType('label', nls.localize('labels', "Style for labels. "), undefined);
    // default token modifiers
    registry.registerTokenModifier('declaration', nls.localize('declaration', "Style for all symbol declarations."), undefined);
    registry.registerTokenModifier('documentation', nls.localize('documentation', "Style to use for references in documentation."), undefined);
    registry.registerTokenModifier('static', nls.localize('static', "Style to use for symbols that are static."), undefined);
    registry.registerTokenModifier('abstract', nls.localize('abstract', "Style to use for symbols that are abstract."), undefined);
    registry.registerTokenModifier('deprecated', nls.localize('deprecated', "Style to use for symbols that are deprecated."), undefined);
    registry.registerTokenModifier('modification', nls.localize('modification', "Style to use for write accesses."), undefined);
    registry.registerTokenModifier('async', nls.localize('async', "Style to use for symbols that are async."), undefined);
    registry.registerTokenModifier('readonly', nls.localize('readonly', "Style to use for symbols that are read-only."), undefined);
    registerTokenStyleDefault('variable.readonly', [['variable.other.constant']]);
    registerTokenStyleDefault('property.readonly', [['variable.other.constant.property']]);
    registerTokenStyleDefault('type.defaultLibrary', [['support.type']]);
    registerTokenStyleDefault('class.defaultLibrary', [['support.class']]);
    registerTokenStyleDefault('interface.defaultLibrary', [['support.class']]);
    registerTokenStyleDefault('variable.defaultLibrary', [['support.variable'], ['support.other.variable']]);
    registerTokenStyleDefault('variable.defaultLibrary.readonly', [['support.constant']]);
    registerTokenStyleDefault('property.defaultLibrary', [['support.variable.property']]);
    registerTokenStyleDefault('property.defaultLibrary.readonly', [['support.constant.property']]);
    registerTokenStyleDefault('function.defaultLibrary', [['support.function']]);
    registerTokenStyleDefault('member.defaultLibrary', [['support.function']]);
    return registry;
}
export function getTokenClassificationRegistry() {
    return tokenClassificationRegistry;
}
function getStylingSchemeEntry(description, deprecationMessage) {
    return {
        description,
        deprecationMessage,
        defaultSnippets: [{ body: '${1:#ff0000}' }],
        anyOf: [
            {
                type: 'string',
                format: 'color-hex'
            },
            {
                $ref: '#/definitions/style'
            }
        ]
    };
}
export const tokenStylingSchemaId = 'vscode://schemas/token-styling';
const schemaRegistry = platform.Registry.as(JSONExtensions.JSONContribution);
schemaRegistry.registerSchema(tokenStylingSchemaId, tokenClassificationRegistry.getTokenStylingSchema());
const delayer = new RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(tokenStylingSchemaId), 200);
tokenClassificationRegistry.onDidChangeSchema(() => {
    if (!delayer.isScheduled()) {
        delayer.schedule();
    }
});
