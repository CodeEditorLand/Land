import './minimap.css';
import { FastDomNode } from '../../../../base/browser/fastDomNode.js';
import { ViewPart } from '../../view/viewPart.js';
import { RenderMinimap } from '../../../common/config/editorOptions.js';
import { RGBA8 } from '../../../common/core/rgba.js';
import { IEditorConfiguration } from '../../../common/config/editorConfiguration.js';
import { MinimapCharRenderer } from './minimapCharRenderer.js';
import { MinimapTokensColorTracker } from '../../../common/viewModel/minimapTokensColorTracker.js';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import { EditorTheme } from '../../../common/editorTheme.js';
import * as viewEvents from '../../../common/viewEvents.js';
import { ViewLineData, ViewModelDecoration } from '../../../common/viewModel.js';
import { Selection } from '../../../common/core/selection.js';
import { TextModelResolvedOptions } from '../../../common/model.js';
declare class MinimapOptions {
    readonly renderMinimap: RenderMinimap;
    readonly size: 'proportional' | 'fill' | 'fit';
    readonly minimapHeightIsEditorHeight: boolean;
    readonly scrollBeyondLastLine: boolean;
    readonly paddingTop: number;
    readonly paddingBottom: number;
    readonly showSlider: 'always' | 'mouseover';
    readonly autohide: boolean;
    readonly pixelRatio: number;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly lineHeight: number;
    /**
     * container dom node left position (in CSS px)
     */
    readonly minimapLeft: number;
    /**
     * container dom node width (in CSS px)
     */
    readonly minimapWidth: number;
    /**
     * container dom node height (in CSS px)
     */
    readonly minimapHeight: number;
    /**
     * canvas backing store width (in device px)
     */
    readonly canvasInnerWidth: number;
    /**
     * canvas backing store height (in device px)
     */
    readonly canvasInnerHeight: number;
    /**
     * canvas width (in CSS px)
     */
    readonly canvasOuterWidth: number;
    /**
     * canvas height (in CSS px)
     */
    readonly canvasOuterHeight: number;
    readonly isSampling: boolean;
    readonly editorHeight: number;
    readonly fontScale: number;
    readonly minimapLineHeight: number;
    readonly minimapCharWidth: number;
    readonly sectionHeaderFontFamily: string;
    readonly sectionHeaderFontSize: number;
    /**
     * Space in between the characters of the section header (in CSS px)
     */
    readonly sectionHeaderLetterSpacing: number;
    readonly sectionHeaderFontColor: RGBA8;
    readonly charRenderer: () => MinimapCharRenderer;
    readonly defaultBackgroundColor: RGBA8;
    readonly backgroundColor: RGBA8;
    /**
     * foreground alpha: integer in [0-255]
     */
    readonly foregroundAlpha: number;
    constructor(configuration: IEditorConfiguration, theme: EditorTheme, tokensColorTracker: MinimapTokensColorTracker);
    private static _getMinimapBackground;
    private static _getMinimapForegroundOpacity;
    private static _getSectionHeaderColor;
    equals(other: MinimapOptions): boolean;
}
export interface IMinimapModel {
    readonly tokensColorTracker: MinimapTokensColorTracker;
    readonly options: MinimapOptions;
    getLineCount(): number;
    getRealLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineMaxColumn(lineNumber: number): number;
    getMinimapLinesRenderingData(startLineNumber: number, endLineNumber: number, needed: boolean[]): (ViewLineData | null)[];
    getSelections(): Selection[];
    getMinimapDecorationsInViewport(startLineNumber: number, endLineNumber: number): ViewModelDecoration[];
    getSectionHeaderDecorationsInViewport(startLineNumber: number, endLineNumber: number): ViewModelDecoration[];
    getSectionHeaderText(decoration: ViewModelDecoration, fitWidth: (s: string) => string): string | null;
    getOptions(): TextModelResolvedOptions;
    revealLineNumber(lineNumber: number): void;
    setScrollTop(scrollTop: number): void;
}
/**
 * The minimap appears beside the editor scroll bar and visualizes a zoomed out
 * view of the file.
 */
export declare class Minimap extends ViewPart implements IMinimapModel {
    readonly tokensColorTracker: MinimapTokensColorTracker;
    private _selections;
    private _minimapSelections;
    options: MinimapOptions;
    private _samplingState;
    private _shouldCheckSampling;
    private _sectionHeaderCache;
    private _actual;
    constructor(context: ViewContext);
    dispose(): void;
    getDomNode(): FastDomNode<HTMLElement>;
    private _onOptionsMaybeChanged;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean;
    onTokensColorsChanged(e: viewEvents.ViewTokensColorsChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    private _recreateLineSampling;
    getLineCount(): number;
    getRealLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineMaxColumn(lineNumber: number): number;
    getMinimapLinesRenderingData(startLineNumber: number, endLineNumber: number, needed: boolean[]): (ViewLineData | null)[];
    getSelections(): Selection[];
    getMinimapDecorationsInViewport(startLineNumber: number, endLineNumber: number): ViewModelDecoration[];
    getSectionHeaderDecorationsInViewport(startLineNumber: number, endLineNumber: number): ViewModelDecoration[];
    private _getMinimapDecorationsInViewport;
    getSectionHeaderText(decoration: ViewModelDecoration, fitWidth: (s: string) => string): string | null;
    getOptions(): TextModelResolvedOptions;
    revealLineNumber(lineNumber: number): void;
    setScrollTop(scrollTop: number): void;
}
export {};
