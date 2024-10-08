import { IMouseEvent } from '../../../../../base/browser/mouseEvent.js';
import { Event } from '../../../../../base/common/event.js';
import './referencesWidget.css';
import { ICodeEditor } from '../../../../browser/editorBrowser.js';
import { IRange } from '../../../../common/core/range.js';
import { Location } from '../../../../common/languages.js';
import { ITextModelService } from '../../../../common/services/resolverService.js';
import * as peekView from '../../../peekView/browser/peekView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { OneReference, ReferencesModel } from '../referencesModel.js';
export declare class LayoutData {
    ratio: number;
    heightInLines: number;
    static fromJSON(raw: string): LayoutData;
}
export interface SelectionEvent {
    readonly kind: 'goto' | 'show' | 'side' | 'open';
    readonly source: 'editor' | 'tree' | 'title';
    readonly element?: Location;
}
/**
 * ZoneWidget that is shown inside the editor
 */
export declare class ReferenceWidget extends peekView.PeekViewWidget {
    private _defaultTreeKeyboardSupport;
    layoutData: LayoutData;
    private readonly _textModelResolverService;
    private readonly _instantiationService;
    private readonly _peekViewService;
    private readonly _uriLabel;
    private readonly _keybindingService;
    private _model?;
    private _decorationsManager?;
    private readonly _disposeOnNewModel;
    private readonly _callOnDispose;
    private readonly _onDidSelectReference;
    readonly onDidSelectReference: Event<SelectionEvent>;
    private _tree;
    private _treeContainer;
    private _splitView;
    private _preview;
    private _previewModelReference;
    private _previewNotAvailableMessage;
    private _previewContainer;
    private _messageContainer;
    private _dim;
    private _isClosing;
    constructor(editor: ICodeEditor, _defaultTreeKeyboardSupport: boolean, layoutData: LayoutData, themeService: IThemeService, _textModelResolverService: ITextModelService, _instantiationService: IInstantiationService, _peekViewService: peekView.IPeekViewService, _uriLabel: ILabelService, _keybindingService: IKeybindingService);
    get isClosing(): boolean;
    dispose(): void;
    private _applyTheme;
    show(where: IRange): void;
    focusOnReferenceTree(): void;
    focusOnPreviewEditor(): void;
    isPreviewEditorFocused(): boolean;
    protected _onTitleClick(e: IMouseEvent): void;
    protected _fillBody(containerElement: HTMLElement): void;
    protected _onWidth(width: number): void;
    protected _doLayoutBody(heightInPixel: number, widthInPixel: number): void;
    setSelection(selection: OneReference): Promise<any>;
    setModel(newModel: ReferencesModel | undefined): Promise<any>;
    private _onNewModel;
    private _getFocusedReference;
    revealReference(reference: OneReference): Promise<void>;
    private _revealedReference?;
    private _revealReference;
}
