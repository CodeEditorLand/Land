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
import * as dom from '../../../../base/browser/dom.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { observableConfigValue } from '../../../../platform/observable/common/platformObservableUtils.js';
import { Expression, ExpressionContainer, Variable } from '../common/debugModel.js';
import { ReplEvaluationResult } from '../common/replModel.js';
import { handleANSIOutput } from './debugANSIHandling.js';
import { COPY_EVALUATE_PATH_ID, COPY_VALUE_ID } from './debugCommands.js';
import { LinkDetector } from './linkDetector.js';
const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
const booleanRegex = /^(true|false)$/i;
const stringRegex = /^(['"]).*\1$/;
const allClasses = Object.keys({
    ["value" /* Cls.Value */]: 0,
    ["unavailable" /* Cls.Unavailable */]: 0,
    ["error" /* Cls.Error */]: 0,
    ["changed" /* Cls.Changed */]: 0,
    ["boolean" /* Cls.Boolean */]: 0,
    ["string" /* Cls.String */]: 0,
    ["number" /* Cls.Number */]: 0,
});
let DebugExpressionRenderer = class DebugExpressionRenderer {
    constructor(commandService, configurationService, instantiationService, hoverService) {
        this.commandService = commandService;
        this.hoverService = hoverService;
        this.linkDetector = instantiationService.createInstance(LinkDetector);
        this.displayType = observableConfigValue('debug.showVariableTypes', false, configurationService);
    }
    renderVariable(data, variable, options = {}) {
        const displayType = this.displayType.get();
        if (variable.available) {
            data.type.textContent = '';
            let text = variable.name;
            if (variable.value && typeof variable.name === 'string') {
                if (variable.type && displayType) {
                    text += ': ';
                    data.type.textContent = variable.type + ' =';
                }
                else {
                    text += ' =';
                }
            }
            data.label.set(text, options.highlights, variable.type && !displayType ? variable.type : variable.name);
            data.name.classList.toggle('virtual', variable.presentationHint?.kind === 'virtual');
            data.name.classList.toggle('internal', variable.presentationHint?.visibility === 'internal');
        }
        else if (variable.value && typeof variable.name === 'string' && variable.name) {
            data.label.set(':');
        }
        data.expression.classList.toggle('lazy', !!variable.presentationHint?.lazy);
        const commands = [
            { id: COPY_VALUE_ID, args: [variable, [variable]] }
        ];
        if (variable.evaluateName) {
            commands.push({ id: COPY_EVALUATE_PATH_ID, args: [{ variable }] });
        }
        return this.renderValue(data.value, variable, {
            showChanged: options.showChanged,
            maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
            hover: { commands },
            colorize: true,
            session: variable.getSession(),
        });
    }
    renderValue(container, expressionOrValue, options = {}) {
        const store = new DisposableStore();
        // Use remembered capabilities so REPL elements can render even once a session ends
        const supportsANSI = options.session?.rememberedCapabilities?.supportsANSIStyling ?? options.wasANSI ?? false;
        let value = typeof expressionOrValue === 'string' ? expressionOrValue : expressionOrValue.value;
        // remove stale classes
        for (const cls of allClasses) {
            container.classList.remove(cls);
        }
        container.classList.add("value" /* Cls.Value */);
        // when resolving expressions we represent errors from the server as a variable with name === null.
        if (value === null || ((expressionOrValue instanceof Expression || expressionOrValue instanceof Variable || expressionOrValue instanceof ReplEvaluationResult) && !expressionOrValue.available)) {
            container.classList.add("unavailable" /* Cls.Unavailable */);
            if (value !== Expression.DEFAULT_VALUE) {
                container.classList.add("error" /* Cls.Error */);
            }
        }
        else {
            if (typeof expressionOrValue !== 'string' && options.showChanged && expressionOrValue.valueChanged && value !== Expression.DEFAULT_VALUE) {
                // value changed color has priority over other colors.
                container.classList.add("changed" /* Cls.Changed */);
                expressionOrValue.valueChanged = false;
            }
            if (options.colorize && typeof expressionOrValue !== 'string') {
                if (expressionOrValue.type === 'number' || expressionOrValue.type === 'boolean' || expressionOrValue.type === 'string') {
                    container.classList.add(expressionOrValue.type);
                }
                else if (!isNaN(+value)) {
                    container.classList.add("number" /* Cls.Number */);
                }
                else if (booleanRegex.test(value)) {
                    container.classList.add("boolean" /* Cls.Boolean */);
                }
                else if (stringRegex.test(value)) {
                    container.classList.add("string" /* Cls.String */);
                }
            }
        }
        if (options.maxValueLength && value && value.length > options.maxValueLength) {
            value = value.substring(0, options.maxValueLength) + '...';
        }
        if (!value) {
            value = '';
        }
        const session = options.session ?? ((expressionOrValue instanceof ExpressionContainer) ? expressionOrValue.getSession() : undefined);
        // Only use hovers for links if thre's not going to be a hover for the value.
        const hoverBehavior = options.hover === false ? { type: 0 /* DebugLinkHoverBehavior.Rich */, store } : { type: 2 /* DebugLinkHoverBehavior.None */ };
        dom.clearNode(container);
        const locationReference = options.locationReference ?? (expressionOrValue instanceof ExpressionContainer && expressionOrValue.valueLocationReference);
        let linkDetector = this.linkDetector;
        if (locationReference && session) {
            linkDetector = this.linkDetector.makeReferencedLinkDetector(locationReference, session);
        }
        if (supportsANSI) {
            container.appendChild(handleANSIOutput(value, linkDetector, session ? session.root : undefined));
        }
        else {
            container.appendChild(linkDetector.linkify(value, false, session?.root, true, hoverBehavior));
        }
        if (options.hover !== false) {
            const { commands = [] } = options.hover || {};
            store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), container, () => {
                const container = dom.$('div');
                const markdownHoverElement = dom.$('div.hover-row');
                const hoverContentsElement = dom.append(markdownHoverElement, dom.$('div.hover-contents'));
                const hoverContentsPre = dom.append(hoverContentsElement, dom.$('pre.debug-var-hover-pre'));
                if (supportsANSI) {
                    // note: intentionally using `this.linkDetector` so we don't blindly linkify the
                    // entire contents and instead only link file paths that it contains.
                    hoverContentsPre.appendChild(handleANSIOutput(value, this.linkDetector, session ? session.root : undefined));
                }
                else {
                    hoverContentsPre.textContent = value;
                }
                container.appendChild(markdownHoverElement);
                return container;
            }, {
                actions: commands.map(({ id, args }) => {
                    const description = CommandsRegistry.getCommand(id)?.metadata?.description;
                    return {
                        label: typeof description === 'string' ? description : description ? description.value : id,
                        commandId: id,
                        run: () => this.commandService.executeCommand(id, ...args),
                    };
                })
            }));
        }
        return store;
    }
};
DebugExpressionRenderer = __decorate([
    __param(0, ICommandService),
    __param(1, IConfigurationService),
    __param(2, IInstantiationService),
    __param(3, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], DebugExpressionRenderer);
export { DebugExpressionRenderer };
