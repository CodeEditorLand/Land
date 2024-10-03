import * as nls from '../../../../nls.js';
import { registerAction2 } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import * as JSONContributionRegistry from '../../../../platform/jsonschemas/common/jsonContributionRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { ConfigureSnippetsAction } from './commands/configureSnippets.js';
import { ApplyFileSnippetAction } from './commands/fileTemplateSnippets.js';
import { InsertSnippetAction } from './commands/insertSnippet.js';
import { SurroundWithSnippetEditorAction } from './commands/surroundWithSnippet.js';
import { SnippetCodeActions } from './snippetCodeActionProvider.js';
import { ISnippetsService } from './snippets.js';
import { SnippetsService } from './snippetsService.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import './tabCompletion.js';
import { editorConfigurationBaseNode } from '../../../../editor/common/config/editorConfigurationSchema.js';
registerSingleton(ISnippetsService, SnippetsService, 1);
registerAction2(InsertSnippetAction);
CommandsRegistry.registerCommandAlias('editor.action.showSnippets', 'editor.action.insertSnippet');
registerAction2(SurroundWithSnippetEditorAction);
registerAction2(ApplyFileSnippetAction);
registerAction2(ConfigureSnippetsAction);
const workbenchContribRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContribRegistry.registerWorkbenchContribution(SnippetCodeActions, 3);
Registry
    .as(Extensions.Configuration)
    .registerConfiguration({
    ...editorConfigurationBaseNode,
    'properties': {
        'editor.snippets.codeActions.enabled': {
            'description': nls.localize('editor.snippets.codeActions.enabled', 'Controls if surround-with-snippets or file template snippets show as Code Actions.'),
            'type': 'boolean',
            'default': true
        }
    }
});
const languageScopeSchemaId = 'vscode://schemas/snippets';
const snippetSchemaProperties = {
    prefix: {
        description: nls.localize('snippetSchema.json.prefix', 'The prefix to use when selecting the snippet in intellisense'),
        type: ['string', 'array']
    },
    isFileTemplate: {
        description: nls.localize('snippetSchema.json.isFileTemplate', 'The snippet is meant to populate or replace a whole file'),
        type: 'boolean'
    },
    body: {
        markdownDescription: nls.localize('snippetSchema.json.body', 'The snippet content. Use `$1`, `${1:defaultText}` to define cursor positions, use `$0` for the final cursor position. Insert variable values with `${varName}` and `${varName:defaultText}`, e.g. `This is file: $TM_FILENAME`.'),
        type: ['string', 'array'],
        items: {
            type: 'string'
        }
    },
    description: {
        description: nls.localize('snippetSchema.json.description', 'The snippet description.'),
        type: ['string', 'array']
    }
};
const languageScopeSchema = {
    id: languageScopeSchemaId,
    allowComments: true,
    allowTrailingCommas: true,
    defaultSnippets: [{
            label: nls.localize('snippetSchema.json.default', "Empty snippet"),
            body: { '${1:snippetName}': { 'prefix': '${2:prefix}', 'body': '${3:snippet}', 'description': '${4:description}' } }
        }],
    type: 'object',
    description: nls.localize('snippetSchema.json', 'User snippet configuration'),
    additionalProperties: {
        type: 'object',
        required: ['body'],
        properties: snippetSchemaProperties,
        additionalProperties: false
    }
};
const globalSchemaId = 'vscode://schemas/global-snippets';
const globalSchema = {
    id: globalSchemaId,
    allowComments: true,
    allowTrailingCommas: true,
    defaultSnippets: [{
            label: nls.localize('snippetSchema.json.default', "Empty snippet"),
            body: { '${1:snippetName}': { 'scope': '${2:scope}', 'prefix': '${3:prefix}', 'body': '${4:snippet}', 'description': '${5:description}' } }
        }],
    type: 'object',
    description: nls.localize('snippetSchema.json', 'User snippet configuration'),
    additionalProperties: {
        type: 'object',
        required: ['body'],
        properties: {
            ...snippetSchemaProperties,
            scope: {
                description: nls.localize('snippetSchema.json.scope', "A list of language names to which this snippet applies, e.g. 'typescript,javascript'."),
                type: 'string'
            }
        },
        additionalProperties: false
    }
};
const reg = Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
reg.registerSchema(languageScopeSchemaId, languageScopeSchema);
reg.registerSchema(globalSchemaId, globalSchema);
