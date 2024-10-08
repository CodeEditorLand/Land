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
import { Emitter } from '../../../../base/common/event.js';
import { HierarchicalKind } from '../../../../base/common/hierarchicalKind.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { editorConfigurationBaseNode } from '../../../../editor/common/config/editorConfigurationSchema.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { codeActionCommandId, refactorCommandId, sourceActionCommandId } from '../../../../editor/contrib/codeAction/browser/codeAction.js';
import { CodeActionKind } from '../../../../editor/contrib/codeAction/common/types.js';
import * as nls from '../../../../nls.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
const createCodeActionsAutoSave = (description) => {
    return {
        type: 'string',
        enum: ['always', 'explicit', 'never', true, false],
        enumDescriptions: [
            nls.localize('alwaysSave', 'Triggers Code Actions on explicit saves and auto saves triggered by window or focus changes.'),
            nls.localize('explicitSave', 'Triggers Code Actions only when explicitly saved'),
            nls.localize('neverSave', 'Never triggers Code Actions on save'),
            nls.localize('explicitSaveBoolean', 'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "explicit".'),
            nls.localize('neverSaveBoolean', 'Never triggers Code Actions on save. This value will be deprecated in favor of "never".')
        ],
        default: 'explicit',
        description: description
    };
};
const createNotebookCodeActionsAutoSave = (description) => {
    return {
        type: ['string', 'boolean'],
        enum: ['explicit', 'never', true, false],
        enumDescriptions: [
            nls.localize('explicit', 'Triggers Code Actions only when explicitly saved.'),
            nls.localize('never', 'Never triggers Code Actions on save.'),
            nls.localize('explicitBoolean', 'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "explicit".'),
            nls.localize('neverBoolean', 'Triggers Code Actions only when explicitly saved. This value will be deprecated in favor of "never".')
        ],
        default: 'explicit',
        description: description
    };
};
const codeActionsOnSaveSchema = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: {
                type: 'string'
            },
        },
        {
            type: 'array',
            items: { type: 'string' }
        }
    ],
    markdownDescription: nls.localize('editor.codeActionsOnSave', 'Run Code Actions for the editor on save. Code Actions must be specified and the editor must not be shutting down. Example: `"source.organizeImports": "explicit" `'),
    type: ['object', 'array'],
    additionalProperties: {
        type: 'string',
        enum: ['always', 'explicit', 'never', true, false],
    },
    default: {},
    scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
};
export const editorConfiguration = Object.freeze({
    ...editorConfigurationBaseNode,
    properties: {
        'editor.codeActionsOnSave': codeActionsOnSaveSchema
    }
});
const notebookCodeActionsOnSaveSchema = {
    oneOf: [
        {
            type: 'object',
            additionalProperties: {
                type: 'string'
            },
        },
        {
            type: 'array',
            items: { type: 'string' }
        }
    ],
    markdownDescription: nls.localize('notebook.codeActionsOnSave', 'Run a series of Code Actions for a notebook on save. Code Actions must be specified, the file must not be saved after delay, and the editor must not be shutting down. Example: `"notebook.source.organizeImports": "explicit"`'),
    type: 'object',
    additionalProperties: {
        type: ['string', 'boolean'],
        enum: ['explicit', 'never', true, false],
        // enum: ['explicit', 'always', 'never'], -- autosave support needs to be built first
        // nls.localize('always', 'Always triggers Code Actions on save, including autosave, focus, and window change events.'),
    },
    default: {}
};
export const notebookEditorConfiguration = Object.freeze({
    ...editorConfigurationBaseNode,
    properties: {
        'notebook.codeActionsOnSave': notebookCodeActionsOnSaveSchema
    }
});
let CodeActionsContribution = class CodeActionsContribution extends Disposable {
    constructor(codeActionsExtensionPoint, keybindingService, languageFeatures) {
        super();
        this.languageFeatures = languageFeatures;
        this._contributedCodeActions = [];
        this.settings = new Set();
        this._onDidChangeContributions = this._register(new Emitter());
        // TODO: @justschen caching of code actions based on extensions loaded: https://github.com/microsoft/vscode/issues/216019
        languageFeatures.codeActionProvider.onDidChange(() => {
            this.updateSettingsFromCodeActionProviders();
            this.updateConfigurationSchemaFromContribs();
        }, 2000);
        codeActionsExtensionPoint.setHandler(extensionPoints => {
            this._contributedCodeActions = extensionPoints.flatMap(x => x.value).filter(x => Array.isArray(x.actions));
            this.updateConfigurationSchema(this._contributedCodeActions);
            this._onDidChangeContributions.fire();
        });
        keybindingService.registerSchemaContribution({
            getSchemaAdditions: () => this.getSchemaAdditions(),
            onDidChange: this._onDidChangeContributions.event,
        });
    }
    updateSettingsFromCodeActionProviders() {
        const providers = this.languageFeatures.codeActionProvider.allNoModel();
        providers.forEach(provider => {
            if (provider.providedCodeActionKinds) {
                provider.providedCodeActionKinds.forEach(kind => {
                    if (!this.settings.has(kind) && CodeActionKind.Source.contains(new HierarchicalKind(kind))) {
                        this.settings.add(kind);
                    }
                });
            }
        });
    }
    updateConfigurationSchema(codeActionContributions) {
        const newProperties = {};
        const newNotebookProperties = {};
        for (const [sourceAction, props] of this.getSourceActions(codeActionContributions)) {
            this.settings.add(sourceAction);
            newProperties[sourceAction] = createCodeActionsAutoSave(nls.localize('codeActionsOnSave.generic', "Controls whether '{0}' actions should be run on file save.", props.title));
            newNotebookProperties[sourceAction] = createNotebookCodeActionsAutoSave(nls.localize('codeActionsOnSave.generic', "Controls whether '{0}' actions should be run on file save.", props.title));
        }
        codeActionsOnSaveSchema.properties = newProperties;
        notebookCodeActionsOnSaveSchema.properties = newNotebookProperties;
        Registry.as(Extensions.Configuration)
            .notifyConfigurationSchemaUpdated(editorConfiguration);
    }
    updateConfigurationSchemaFromContribs() {
        const properties = { ...codeActionsOnSaveSchema.properties };
        const notebookProperties = { ...notebookCodeActionsOnSaveSchema.properties };
        for (const codeActionKind of this.settings) {
            if (!properties[codeActionKind]) {
                properties[codeActionKind] = createCodeActionsAutoSave(nls.localize('codeActionsOnSave.generic', "Controls whether '{0}' actions should be run on file save.", codeActionKind));
                notebookProperties[codeActionKind] = createNotebookCodeActionsAutoSave(nls.localize('codeActionsOnSave.generic', "Controls whether '{0}' actions should be run on file save.", codeActionKind));
            }
        }
        codeActionsOnSaveSchema.properties = properties;
        notebookCodeActionsOnSaveSchema.properties = notebookProperties;
        Registry.as(Extensions.Configuration)
            .notifyConfigurationSchemaUpdated(editorConfiguration);
    }
    getSourceActions(contributions) {
        const sourceActions = new Map();
        for (const contribution of contributions) {
            for (const action of contribution.actions) {
                const kind = new HierarchicalKind(action.kind);
                if (CodeActionKind.Source.contains(kind)) {
                    sourceActions.set(kind.value, action);
                }
            }
        }
        return sourceActions;
    }
    getSchemaAdditions() {
        const conditionalSchema = (command, actions) => {
            return {
                if: {
                    required: ['command'],
                    properties: {
                        'command': { const: command }
                    }
                },
                then: {
                    properties: {
                        'args': {
                            required: ['kind'],
                            properties: {
                                'kind': {
                                    anyOf: [
                                        {
                                            enum: actions.map(action => action.kind),
                                            enumDescriptions: actions.map(action => action.description ?? action.title),
                                        },
                                        { type: 'string' },
                                    ]
                                }
                            }
                        }
                    }
                }
            };
        };
        const getActions = (ofKind) => {
            const allActions = this._contributedCodeActions.flatMap(desc => desc.actions);
            const out = new Map();
            for (const action of allActions) {
                if (!out.has(action.kind) && ofKind.contains(new HierarchicalKind(action.kind))) {
                    out.set(action.kind, action);
                }
            }
            return Array.from(out.values());
        };
        return [
            conditionalSchema(codeActionCommandId, getActions(HierarchicalKind.Empty)),
            conditionalSchema(refactorCommandId, getActions(CodeActionKind.Refactor)),
            conditionalSchema(sourceActionCommandId, getActions(CodeActionKind.Source)),
        ];
    }
};
CodeActionsContribution = __decorate([
    __param(1, IKeybindingService),
    __param(2, ILanguageFeaturesService),
    __metadata("design:paramtypes", [Object, Object, Object])
], CodeActionsContribution);
export { CodeActionsContribution };
