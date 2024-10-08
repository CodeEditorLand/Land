import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { IGlyphMarginWidget, IGlyphMarginWidgetPosition } from '../../../editorBrowser.js';
import { DiffEditorEditors } from '../components/diffEditorEditors.js';
import { DiffEditorOptions } from '../diffEditorOptions.js';
import { DiffEditorViewModel } from '../diffEditorViewModel.js';
import { DiffEditorWidget } from '../diffEditorWidget.js';
import { LineRangeMapping, RangeMapping } from '../../../../common/diff/rangeMapping.js';
export declare class RevertButtonsFeature extends Disposable {
    private readonly _editors;
    private readonly _diffModel;
    private readonly _options;
    private readonly _widget;
    constructor(_editors: DiffEditorEditors, _diffModel: IObservable<DiffEditorViewModel | undefined>, _options: DiffEditorOptions, _widget: DiffEditorWidget);
    private readonly _selectedDiffs;
}
export declare class RevertButton extends Disposable implements IGlyphMarginWidget {
    private readonly _lineNumber;
    private readonly _widget;
    private readonly _diffs;
    private readonly _revertSelection;
    static counter: number;
    private readonly _id;
    getId(): string;
    private readonly _domNode;
    constructor(_lineNumber: number, _widget: DiffEditorWidget, _diffs: RangeMapping[] | LineRangeMapping, _revertSelection: boolean);
    /**
     * Get the dom node of the glyph widget.
     */
    getDomNode(): HTMLElement;
    /**
     * Get the placement of the glyph widget.
     */
    getPosition(): IGlyphMarginWidgetPosition;
}
