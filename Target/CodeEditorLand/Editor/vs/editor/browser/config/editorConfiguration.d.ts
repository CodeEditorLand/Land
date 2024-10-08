import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ConfigurationChangedEvent, EditorOption, FindComputedEditorOptionValueById, IComputedEditorOptions, IEditorOptions } from '../../common/config/editorOptions.js';
import { BareFontInfo, FontInfo } from '../../common/config/fontInfo.js';
import { IDimension } from '../../common/core/dimension.js';
import { IEditorConfiguration } from '../../common/config/editorConfiguration.js';
import { AccessibilitySupport, IAccessibilityService } from '../../../platform/accessibility/common/accessibility.js';
import { MenuId } from '../../../platform/actions/common/actions.js';
export interface IEditorConstructionOptions extends IEditorOptions {
    /**
     * The initial editor dimension (to avoid measuring the container).
     */
    dimension?: IDimension;
    /**
     * Place overflow widgets inside an external DOM node.
     * Defaults to an internal DOM node.
     */
    overflowWidgetsDomNode?: HTMLElement;
}
export declare class EditorConfiguration extends Disposable implements IEditorConfiguration {
    private readonly _accessibilityService;
    private _onDidChange;
    readonly onDidChange: Event<ConfigurationChangedEvent>;
    private _onDidChangeFast;
    readonly onDidChangeFast: Event<ConfigurationChangedEvent>;
    readonly isSimpleWidget: boolean;
    readonly contextMenuId: MenuId;
    private readonly _containerObserver;
    private _isDominatedByLongLines;
    private _viewLineCount;
    private _lineNumbersDigitCount;
    private _reservedHeight;
    private _glyphMarginDecorationLaneCount;
    private _targetWindowId;
    private readonly _computeOptionsMemory;
    /**
     * Raw options as they were passed in and merged with all calls to `updateOptions`.
     */
    private readonly _rawOptions;
    /**
     * Validated version of `_rawOptions`.
     */
    private _validatedOptions;
    /**
     * Complete options which are a combination of passed in options and env values.
     */
    options: ComputedEditorOptions;
    constructor(isSimpleWidget: boolean, contextMenuId: MenuId, options: Readonly<IEditorConstructionOptions>, container: HTMLElement | null, _accessibilityService: IAccessibilityService);
    private _recomputeOptions;
    private _computeOptions;
    protected _readEnvConfiguration(): IEnvConfiguration;
    protected _readFontInfo(bareFontInfo: BareFontInfo): FontInfo;
    getRawOptions(): IEditorOptions;
    updateOptions(_newOptions: Readonly<IEditorOptions>): void;
    observeContainer(dimension?: IDimension): void;
    setIsDominatedByLongLines(isDominatedByLongLines: boolean): void;
    setModelLineCount(modelLineCount: number): void;
    setViewLineCount(viewLineCount: number): void;
    setReservedHeight(reservedHeight: number): void;
    setGlyphMarginDecorationLaneCount(decorationLaneCount: number): void;
}
export interface IEnvConfiguration {
    extraEditorClassName: string;
    outerWidth: number;
    outerHeight: number;
    emptySelectionClipboard: boolean;
    pixelRatio: number;
    accessibilitySupport: AccessibilitySupport;
}
export declare class ComputedEditorOptions implements IComputedEditorOptions {
    private readonly _values;
    _read<T>(id: EditorOption): T;
    get<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
    _write<T>(id: EditorOption, value: T): void;
}
