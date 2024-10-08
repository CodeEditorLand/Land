import './media/sidebysideeditor.css';
import { Dimension } from '../../../../base/browser/dom.js';
import { IEditorControl, IEditorPane, IEditorOpenContext, SideBySideEditor as Side, IEditorPaneSelection, IEditorPaneWithSelection, IEditorPaneSelectionChangeEvent } from '../../../common/editor.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { Event } from '../../../../base/common/event.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { AbstractEditorWithViewState } from './editorWithViewState.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { URI } from '../../../../base/common/uri.js';
import { IBoundarySashes } from '../../../../base/browser/ui/sash/sash.js';
interface ISideBySideEditorViewState {
    primary: object;
    secondary: object;
    focus: Side.PRIMARY | Side.SECONDARY | undefined;
    ratio: number | undefined;
}
interface ISideBySideEditorOptions extends IEditorOptions {
    /**
     * Whether the editor options should apply to
     * the primary or secondary side.
     *
     * If a target side is provided, that side will
     * also receive keyboard focus unless focus is
     * to be preserved.
     */
    target?: Side.PRIMARY | Side.SECONDARY;
}
export declare class SideBySideEditor extends AbstractEditorWithViewState<ISideBySideEditorViewState> implements IEditorPaneWithSelection {
    private readonly configurationService;
    static readonly ID: string;
    static SIDE_BY_SIDE_LAYOUT_SETTING: string;
    private static readonly VIEW_STATE_PREFERENCE_KEY;
    private get minimumPrimaryWidth();
    private get maximumPrimaryWidth();
    private get minimumPrimaryHeight();
    private get maximumPrimaryHeight();
    private get minimumSecondaryWidth();
    private get maximumSecondaryWidth();
    private get minimumSecondaryHeight();
    private get maximumSecondaryHeight();
    set minimumWidth(value: number);
    set maximumWidth(value: number);
    set minimumHeight(value: number);
    set maximumHeight(value: number);
    get minimumWidth(): number;
    get maximumWidth(): number;
    get minimumHeight(): number;
    get maximumHeight(): number;
    private _boundarySashes;
    private onDidCreateEditors;
    private _onDidChangeSizeConstraints;
    readonly onDidChangeSizeConstraints: Event<{
        width: number;
        height: number;
    } | undefined>;
    private readonly _onDidChangeSelection;
    readonly onDidChangeSelection: Event<IEditorPaneSelectionChangeEvent>;
    private primaryEditorPane;
    private secondaryEditorPane;
    private primaryEditorContainer;
    private secondaryEditorContainer;
    private splitview;
    private readonly splitviewDisposables;
    private readonly editorDisposables;
    private orientation;
    private dimension;
    private lastFocusedSide;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, configurationService: IConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    private registerListeners;
    private onConfigurationUpdated;
    private recreateSplitview;
    private getSplitViewRatio;
    protected createEditor(parent: HTMLElement): void;
    private createSplitView;
    getTitle(): string;
    setInput(input: SideBySideEditorInput, options: ISideBySideEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private loadViewState;
    private createEditors;
    private doCreateEditor;
    private onDidFocusChange;
    getSelection(): IEditorPaneSelection | undefined;
    setOptions(options: ISideBySideEditorOptions | undefined): void;
    protected setEditorVisible(visible: boolean): void;
    clearInput(): void;
    focus(): void;
    private getLastFocusedEditorPane;
    layout(dimension: Dimension): void;
    setBoundarySashes(sashes: IBoundarySashes): void;
    private layoutPane;
    getControl(): IEditorControl | undefined;
    getPrimaryEditorPane(): IEditorPane | undefined;
    getSecondaryEditorPane(): IEditorPane | undefined;
    protected tracksEditorViewState(input: EditorInput): boolean;
    protected computeEditorViewState(resource: URI): ISideBySideEditorViewState | undefined;
    protected toEditorViewStateResource(input: EditorInput): URI | undefined;
    updateStyles(): void;
    dispose(): void;
    private disposeEditors;
}
export {};
