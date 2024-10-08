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
import * as nls from '../../../../nls.js';
import { isObject } from '../../../../base/common/types.js';
import { IDebugService, debuggerDisabledMessage, DebugConfigurationProviderTriggerKind } from './debug.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import * as ConfigurationResolverUtils from '../../../services/configurationResolver/common/configurationResolverUtils.js';
import { ITextResourcePropertiesService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { URI } from '../../../../base/common/uri.js';
import { Schemas } from '../../../../base/common/network.js';
import { isDebuggerMainContribution } from './debugUtils.js';
import { cleanRemoteAuthority } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { filter } from '../../../../base/common/objects.js';
let Debugger = class Debugger {
    constructor(adapterManager, dbgContribution, extensionDescription, configurationService, resourcePropertiesService, configurationResolverService, environmentService, debugService, contextKeyService) {
        this.adapterManager = adapterManager;
        this.configurationService = configurationService;
        this.resourcePropertiesService = resourcePropertiesService;
        this.configurationResolverService = configurationResolverService;
        this.environmentService = environmentService;
        this.debugService = debugService;
        this.contextKeyService = contextKeyService;
        this.mergedExtensionDescriptions = [];
        this.debuggerContribution = { type: dbgContribution.type };
        this.merge(dbgContribution, extensionDescription);
        this.debuggerWhen = typeof this.debuggerContribution.when === 'string' ? ContextKeyExpr.deserialize(this.debuggerContribution.when) : undefined;
        this.debuggerHiddenWhen = typeof this.debuggerContribution.hiddenWhen === 'string' ? ContextKeyExpr.deserialize(this.debuggerContribution.hiddenWhen) : undefined;
    }
    merge(otherDebuggerContribution, extensionDescription) {
        /**
         * Copies all properties of source into destination. The optional parameter "overwrite" allows to control
         * if existing non-structured properties on the destination should be overwritten or not. Defaults to true (overwrite).
         */
        function mixin(destination, source, overwrite, level = 0) {
            if (!isObject(destination)) {
                return source;
            }
            if (isObject(source)) {
                Object.keys(source).forEach(key => {
                    if (key !== '__proto__') {
                        if (isObject(destination[key]) && isObject(source[key])) {
                            mixin(destination[key], source[key], overwrite, level + 1);
                        }
                        else {
                            if (key in destination) {
                                if (overwrite) {
                                    if (level === 0 && key === 'type') {
                                        // don't merge the 'type' property
                                    }
                                    else {
                                        destination[key] = source[key];
                                    }
                                }
                            }
                            else {
                                destination[key] = source[key];
                            }
                        }
                    }
                });
            }
            return destination;
        }
        // only if not already merged
        if (this.mergedExtensionDescriptions.indexOf(extensionDescription) < 0) {
            // remember all extensions that have been merged for this debugger
            this.mergedExtensionDescriptions.push(extensionDescription);
            // merge new debugger contribution into existing contributions (and don't overwrite values in built-in extensions)
            mixin(this.debuggerContribution, otherDebuggerContribution, extensionDescription.isBuiltin);
            // remember the extension that is considered the "main" debugger contribution
            if (isDebuggerMainContribution(otherDebuggerContribution)) {
                this.mainExtensionDescription = extensionDescription;
            }
        }
    }
    async startDebugging(configuration, parentSessionId) {
        const parentSession = this.debugService.getModel().getSession(parentSessionId);
        return await this.debugService.startDebugging(undefined, configuration, { parentSession }, undefined);
    }
    async createDebugAdapter(session) {
        await this.adapterManager.activateDebuggers('onDebugAdapterProtocolTracker', this.type);
        const da = this.adapterManager.createDebugAdapter(session);
        if (da) {
            return Promise.resolve(da);
        }
        throw new Error(nls.localize('cannot.find.da', "Cannot find debug adapter for type '{0}'.", this.type));
    }
    async substituteVariables(folder, config) {
        const substitutedConfig = await this.adapterManager.substituteVariables(this.type, folder, config);
        return await this.configurationResolverService.resolveWithInteractionReplace(folder, substitutedConfig, 'launch', this.variables, substitutedConfig.__configurationTarget);
    }
    runInTerminal(args, sessionId) {
        return this.adapterManager.runInTerminal(this.type, args, sessionId);
    }
    get label() {
        return this.debuggerContribution.label || this.debuggerContribution.type;
    }
    get type() {
        return this.debuggerContribution.type;
    }
    get variables() {
        return this.debuggerContribution.variables;
    }
    get configurationSnippets() {
        return this.debuggerContribution.configurationSnippets;
    }
    get languages() {
        return this.debuggerContribution.languages;
    }
    get when() {
        return this.debuggerWhen;
    }
    get hiddenWhen() {
        return this.debuggerHiddenWhen;
    }
    get enabled() {
        return !this.debuggerWhen || this.contextKeyService.contextMatchesRules(this.debuggerWhen);
    }
    get isHiddenFromDropdown() {
        if (!this.debuggerHiddenWhen) {
            return false;
        }
        return this.contextKeyService.contextMatchesRules(this.debuggerHiddenWhen);
    }
    get strings() {
        return this.debuggerContribution.strings ?? this.debuggerContribution.uiMessages;
    }
    interestedInLanguage(languageId) {
        return !!(this.languages && this.languages.indexOf(languageId) >= 0);
    }
    hasInitialConfiguration() {
        return !!this.debuggerContribution.initialConfigurations;
    }
    hasDynamicConfigurationProviders() {
        return this.debugService.getConfigurationManager().hasDebugConfigurationProvider(this.type, DebugConfigurationProviderTriggerKind.Dynamic);
    }
    hasConfigurationProvider() {
        return this.debugService.getConfigurationManager().hasDebugConfigurationProvider(this.type);
    }
    getInitialConfigurationContent(initialConfigs) {
        // at this point we got some configs from the package.json and/or from registered DebugConfigurationProviders
        let initialConfigurations = this.debuggerContribution.initialConfigurations || [];
        if (initialConfigs) {
            initialConfigurations = initialConfigurations.concat(initialConfigs);
        }
        const eol = this.resourcePropertiesService.getEOL(URI.from({ scheme: Schemas.untitled, path: '1' })) === '\r\n' ? '\r\n' : '\n';
        const configs = JSON.stringify(initialConfigurations, null, '\t').split('\n').map(line => '\t' + line).join(eol).trim();
        const comment1 = nls.localize('launch.config.comment1', "Use IntelliSense to learn about possible attributes.");
        const comment2 = nls.localize('launch.config.comment2', "Hover to view descriptions of existing attributes.");
        const comment3 = nls.localize('launch.config.comment3', "For more information, visit: {0}", 'https://go.microsoft.com/fwlink/?linkid=830387');
        let content = [
            '{',
            `\t// ${comment1}`,
            `\t// ${comment2}`,
            `\t// ${comment3}`,
            `\t"version": "0.2.0",`,
            `\t"configurations": ${configs}`,
            '}'
        ].join(eol);
        // fix formatting
        const editorConfig = this.configurationService.getValue();
        if (editorConfig.editor && editorConfig.editor.insertSpaces) {
            content = content.replace(new RegExp('\t', 'g'), ' '.repeat(editorConfig.editor.tabSize));
        }
        return Promise.resolve(content);
    }
    getMainExtensionDescriptor() {
        return this.mainExtensionDescription || this.mergedExtensionDescriptions[0];
    }
    getCustomTelemetryEndpoint() {
        const aiKey = this.debuggerContribution.aiKey;
        if (!aiKey) {
            return undefined;
        }
        const sendErrorTelemtry = cleanRemoteAuthority(this.environmentService.remoteAuthority) !== 'other';
        return {
            id: `${this.getMainExtensionDescriptor().publisher}.${this.type}`,
            aiKey,
            sendErrorTelemetry: sendErrorTelemtry
        };
    }
    getSchemaAttributes(definitions) {
        if (!this.debuggerContribution.configurationAttributes) {
            return null;
        }
        // fill in the default configuration attributes shared by all adapters.
        return Object.keys(this.debuggerContribution.configurationAttributes).map(request => {
            const definitionId = `${this.type}:${request}`;
            const platformSpecificDefinitionId = `${this.type}:${request}:platform`;
            const attributes = this.debuggerContribution.configurationAttributes[request];
            const defaultRequired = ['name', 'type', 'request'];
            attributes.required = attributes.required && attributes.required.length ? defaultRequired.concat(attributes.required) : defaultRequired;
            attributes.additionalProperties = false;
            attributes.type = 'object';
            if (!attributes.properties) {
                attributes.properties = {};
            }
            const properties = attributes.properties;
            properties['type'] = {
                enum: [this.type],
                enumDescriptions: [this.label],
                description: nls.localize('debugType', "Type of configuration."),
                pattern: '^(?!node2)',
                deprecationMessage: this.debuggerContribution.deprecated || (this.enabled ? undefined : debuggerDisabledMessage(this.type)),
                doNotSuggest: !!this.debuggerContribution.deprecated,
                errorMessage: nls.localize('debugTypeNotRecognised', "The debug type is not recognized. Make sure that you have a corresponding debug extension installed and that it is enabled."),
                patternErrorMessage: nls.localize('node2NotSupported', "\"node2\" is no longer supported, use \"node\" instead and set the \"protocol\" attribute to \"inspector\".")
            };
            properties['request'] = {
                enum: [request],
                description: nls.localize('debugRequest', "Request type of configuration. Can be \"launch\" or \"attach\"."),
            };
            for (const prop in definitions['common'].properties) {
                properties[prop] = {
                    $ref: `#/definitions/common/properties/${prop}`
                };
            }
            Object.keys(properties).forEach(name => {
                // Use schema allOf property to get independent error reporting #21113
                ConfigurationResolverUtils.applyDeprecatedVariableMessage(properties[name]);
            });
            definitions[definitionId] = { ...attributes };
            definitions[platformSpecificDefinitionId] = {
                type: 'object',
                additionalProperties: false,
                properties: filter(properties, key => key !== 'type' && key !== 'request' && key !== 'name')
            };
            // Don't add the OS props to the real attributes object so they don't show up in 'definitions'
            const attributesCopy = { ...attributes };
            attributesCopy.properties = {
                ...properties,
                ...{
                    windows: {
                        $ref: `#/definitions/${platformSpecificDefinitionId}`,
                        description: nls.localize('debugWindowsConfiguration', "Windows specific launch configuration attributes."),
                    },
                    osx: {
                        $ref: `#/definitions/${platformSpecificDefinitionId}`,
                        description: nls.localize('debugOSXConfiguration', "OS X specific launch configuration attributes."),
                    },
                    linux: {
                        $ref: `#/definitions/${platformSpecificDefinitionId}`,
                        description: nls.localize('debugLinuxConfiguration', "Linux specific launch configuration attributes."),
                    }
                }
            };
            return attributesCopy;
        });
    }
};
Debugger = __decorate([
    __param(3, IConfigurationService),
    __param(4, ITextResourcePropertiesService),
    __param(5, IConfigurationResolverService),
    __param(6, IWorkbenchEnvironmentService),
    __param(7, IDebugService),
    __param(8, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], Debugger);
export { Debugger };
