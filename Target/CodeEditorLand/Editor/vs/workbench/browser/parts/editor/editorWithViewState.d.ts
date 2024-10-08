import { URI } from '../../../../base/common/uri.js';
import { IEditorOpenContext } from '../../../common/editor.js';
import { EditorPane } from './editorPane.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IEditorGroupsService, IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IExtUri } from '../../../../base/common/resources.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
/**
 * Base class of editors that want to store and restore view state.
 */
export declare abstract class AbstractEditorWithViewState<T extends object> extends EditorPane {
    protected readonly instantiationService: IInstantiationService;
    protected readonly textResourceConfigurationService: ITextResourceConfigurationService;
    protected readonly editorService: IEditorService;
    protected readonly editorGroupService: IEditorGroupsService;
    private viewState;
    private readonly groupListener;
    private editorViewStateDisposables;
    constructor(id: string, group: IEditorGroup, viewStateStorageKey: string, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    protected setEditorVisible(visible: boolean): void;
    private onWillCloseEditor;
    clearInput(): void;
    protected saveState(): void;
    private updateEditorViewState;
    private shouldRestoreEditorViewState;
    getViewState(): T | undefined;
    private saveEditorViewState;
    protected loadEditorViewState(input: EditorInput | undefined, context?: IEditorOpenContext): T | undefined;
    protected moveEditorViewState(source: URI, target: URI, comparer: IExtUri): void;
    protected clearEditorViewState(resource: URI, group?: IEditorGroup): void;
    dispose(): void;
    /**
     * The actual method to provide for gathering the view state
     * object for the control.
     *
     * @param resource the expected `URI` for the view state. This
     * should be used as a way to ensure the view state in the
     * editor control is matching the resource expected, for example
     * by comparing with the underlying model (this was a fix for
     * https://github.com/microsoft/vscode/issues/40114).
     */
    protected abstract computeEditorViewState(resource: URI): T | undefined;
    /**
     * Whether view state should be associated with the given input.
     * Subclasses need to ensure that the editor input is expected
     * for the editor.
     */
    protected abstract tracksEditorViewState(input: EditorInput): boolean;
    /**
     * Whether view state should be tracked even when the editor is
     * disposed.
     *
     * Subclasses should override this if the input can be restored
     * from the resource at a later point, e.g. if backed by files.
     */
    protected tracksDisposedEditorViewState(): boolean;
    /**
     * Asks to return the `URI` to associate with the view state.
     */
    protected abstract toEditorViewStateResource(input: EditorInput): URI | undefined;
}
