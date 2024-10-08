import { EditorInput } from '../../../common/editor/editorInput.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { EditorPlaceholder, IEditorPlaceholderContents } from './editorPlaceholder.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
export interface IOpenCallbacks {
    openInternal: (input: EditorInput, options: IEditorOptions | undefined) => Promise<void>;
}
export declare abstract class BaseBinaryResourceEditor extends EditorPlaceholder {
    private readonly callbacks;
    private readonly _onDidChangeMetadata;
    readonly onDidChangeMetadata: import("../../../workbench.web.main.internal.js").Event<void>;
    private readonly _onDidOpenInPlace;
    readonly onDidOpenInPlace: import("../../../workbench.web.main.internal.js").Event<void>;
    private metadata;
    constructor(id: string, group: IEditorGroup, callbacks: IOpenCallbacks, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService);
    getTitle(): string;
    protected getContents(input: EditorInput, options: IEditorOptions): Promise<IEditorPlaceholderContents>;
    private handleMetadataChanged;
    getMetadata(): string | undefined;
}
