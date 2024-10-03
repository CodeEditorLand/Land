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
var DynamicEditorConfigurations_1;
import { localize } from '../../../../nls.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { workbenchConfigurationNodeBase } from '../../../common/configuration.js';
import { IEditorResolverService, RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { Event } from '../../../../base/common/event.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ByteSize, getLargeFileConfirmationLimit } from '../../../../platform/files/common/files.js';
let DynamicEditorConfigurations = class DynamicEditorConfigurations extends Disposable {
    static { DynamicEditorConfigurations_1 = this; }
    static { this.ID = 'workbench.contrib.dynamicEditorConfigurations'; }
    static { this.AUTO_LOCK_DEFAULT_ENABLED = new Set([
        'terminalEditor',
        'mainThreadWebview-simpleBrowser.view',
        'mainThreadWebview-browserPreview'
    ]); }
    static { this.AUTO_LOCK_EXTRA_EDITORS = [
        {
            id: 'workbench.input.interactive',
            label: localize('interactiveWindow', 'Interactive Window'),
            priority: RegisteredEditorPriority.builtin
        },
        {
            id: 'mainThreadWebview-markdown.preview',
            label: localize('markdownPreview', "Markdown Preview"),
            priority: RegisteredEditorPriority.builtin
        },
        {
            id: 'mainThreadWebview-simpleBrowser.view',
            label: localize('simpleBrowser', "Simple Browser"),
            priority: RegisteredEditorPriority.builtin
        },
        {
            id: 'mainThreadWebview-browserPreview',
            label: localize('livePreview', "Live Preview"),
            priority: RegisteredEditorPriority.builtin
        }
    ]; }
    static { this.AUTO_LOCK_REMOVE_EDITORS = new Set([
        'vscode-interactive-input',
        'interactive',
        'vscode.markdown.preview.editor'
    ]); }
    constructor(editorResolverService, extensionService, environmentService) {
        super();
        this.editorResolverService = editorResolverService;
        this.environmentService = environmentService;
        this.configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
        (async () => {
            await extensionService.whenInstalledExtensionsRegistered();
            this.updateDynamicEditorConfigurations();
            this.registerListeners();
        })();
    }
    registerListeners() {
        this._register(Event.debounce(this.editorResolverService.onDidChangeEditorRegistrations, (_, e) => e)(() => this.updateDynamicEditorConfigurations()));
    }
    updateDynamicEditorConfigurations() {
        const lockableEditors = [...this.editorResolverService.getEditors(), ...DynamicEditorConfigurations_1.AUTO_LOCK_EXTRA_EDITORS].filter(e => !DynamicEditorConfigurations_1.AUTO_LOCK_REMOVE_EDITORS.has(e.id));
        const binaryEditorCandidates = this.editorResolverService.getEditors().filter(e => e.priority !== RegisteredEditorPriority.exclusive).map(e => e.id);
        const autoLockGroupConfiguration = Object.create(null);
        for (const editor of lockableEditors) {
            autoLockGroupConfiguration[editor.id] = {
                type: 'boolean',
                default: DynamicEditorConfigurations_1.AUTO_LOCK_DEFAULT_ENABLED.has(editor.id),
                description: editor.label
            };
        }
        const defaultAutoLockGroupConfiguration = Object.create(null);
        for (const editor of lockableEditors) {
            defaultAutoLockGroupConfiguration[editor.id] = DynamicEditorConfigurations_1.AUTO_LOCK_DEFAULT_ENABLED.has(editor.id);
        }
        const oldAutoLockConfigurationNode = this.autoLockConfigurationNode;
        this.autoLockConfigurationNode = {
            ...workbenchConfigurationNodeBase,
            properties: {
                'workbench.editor.autoLockGroups': {
                    type: 'object',
                    description: localize('workbench.editor.autoLockGroups', "If an editor matching one of the listed types is opened as the first in an editor group and more than one group is open, the group is automatically locked. Locked groups will only be used for opening editors when explicitly chosen by a user gesture (for example drag and drop), but not by default. Consequently, the active editor in a locked group is less likely to be replaced accidentally with a different editor."),
                    properties: autoLockGroupConfiguration,
                    default: defaultAutoLockGroupConfiguration,
                    additionalProperties: false
                }
            }
        };
        const oldDefaultBinaryEditorConfigurationNode = this.defaultBinaryEditorConfigurationNode;
        this.defaultBinaryEditorConfigurationNode = {
            ...workbenchConfigurationNodeBase,
            properties: {
                'workbench.editor.defaultBinaryEditor': {
                    type: 'string',
                    default: '',
                    enum: [...binaryEditorCandidates, ''],
                    description: localize('workbench.editor.defaultBinaryEditor', "The default editor for files detected as binary. If undefined, the user will be presented with a picker."),
                }
            }
        };
        const oldEditorAssociationsConfigurationNode = this.editorAssociationsConfigurationNode;
        this.editorAssociationsConfigurationNode = {
            ...workbenchConfigurationNodeBase,
            properties: {
                'workbench.editorAssociations': {
                    type: 'object',
                    markdownDescription: localize('editor.editorAssociations', "Configure [glob patterns](https://aka.ms/vscode-glob-patterns) to editors (for example `\"*.hex\": \"hexEditor.hexedit\"`). These have precedence over the default behavior."),
                    patternProperties: {
                        '.*': {
                            type: 'string',
                            enum: binaryEditorCandidates,
                        }
                    }
                }
            }
        };
        const oldEditorLargeFileConfirmationConfigurationNode = this.editorLargeFileConfirmationConfigurationNode;
        this.editorLargeFileConfirmationConfigurationNode = {
            ...workbenchConfigurationNodeBase,
            properties: {
                'workbench.editorLargeFileConfirmation': {
                    type: 'number',
                    default: getLargeFileConfirmationLimit(this.environmentService.remoteAuthority) / ByteSize.MB,
                    minimum: 1,
                    scope: 4,
                    markdownDescription: localize('editorLargeFileSizeConfirmation', "Controls the minimum size of a file in MB before asking for confirmation when opening in the editor. Note that this setting may not apply to all editor types and environments."),
                }
            }
        };
        this.configurationRegistry.updateConfigurations({
            add: [
                this.autoLockConfigurationNode,
                this.defaultBinaryEditorConfigurationNode,
                this.editorAssociationsConfigurationNode,
                this.editorLargeFileConfirmationConfigurationNode
            ],
            remove: coalesce([
                oldAutoLockConfigurationNode,
                oldDefaultBinaryEditorConfigurationNode,
                oldEditorAssociationsConfigurationNode,
                oldEditorLargeFileConfirmationConfigurationNode
            ])
        });
    }
};
DynamicEditorConfigurations = DynamicEditorConfigurations_1 = __decorate([
    __param(0, IEditorResolverService),
    __param(1, IExtensionService),
    __param(2, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object])
], DynamicEditorConfigurations);
export { DynamicEditorConfigurations };
