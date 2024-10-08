import { RawContextKey } from '../../platform/contextkey/common/contextkey.js';
import { ICommandHandler } from '../../platform/commands/common/commands.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { IResourceEditorInput, ITextResourceEditorInput } from '../../platform/editor/common/editor.js';
import { IEditorGroup, IEditorGroupsService } from '../services/editor/common/editorGroupsService.js';
import { ACTIVE_GROUP_TYPE, AUX_WINDOW_GROUP_TYPE, IEditorService, SIDE_GROUP_TYPE } from '../services/editor/common/editorService.js';
import { IUntitledTextResourceEditorInput, IUntypedEditorInput, GroupIdentifier, IEditorPane } from '../common/editor.js';
export declare const inQuickPickContextKeyValue = "inQuickOpen";
export declare const InQuickPickContextKey: RawContextKey<boolean>;
export declare const inQuickPickContext: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
export declare const defaultQuickAccessContextKeyValue = "inFilesPicker";
export declare const defaultQuickAccessContext: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
export interface IWorkbenchQuickAccessConfiguration {
    readonly workbench: {
        readonly commandPalette: {
            readonly history: number;
            readonly preserveInput: boolean;
            readonly experimental: {
                readonly suggestCommands: boolean;
                readonly enableNaturalLanguageSearch: boolean;
                readonly askChatLocation: 'quickChat' | 'chatView';
            };
        };
        readonly quickOpen: {
            readonly enableExperimentalNewVersion: boolean;
            readonly preserveInput: boolean;
        };
    };
}
export declare function getQuickNavigateHandler(id: string, next?: boolean): ICommandHandler;
export declare class PickerEditorState extends Disposable {
    private readonly editorService;
    private readonly editorGroupsService;
    private _editorViewState;
    private readonly openedTransientEditors;
    constructor(editorService: IEditorService, editorGroupsService: IEditorGroupsService);
    set(): void;
    /**
     * Open a transient editor such that it may be closed when the state is restored.
     * Note that, when the state is restored, if the editor is no longer transient, it will not be closed.
     */
    openTransientEditor(editor: IResourceEditorInput | ITextResourceEditorInput | IUntitledTextResourceEditorInput | IUntypedEditorInput, group?: IEditorGroup | GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE): Promise<IEditorPane | undefined>;
    restore(): Promise<void>;
    reset(): void;
    dispose(): void;
}
