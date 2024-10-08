import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { DiffEditorEditors } from './diffEditorEditors.js';
import { DiffEditorOptions } from '../diffEditorOptions.js';
import { DiffEditorViewModel } from '../diffEditorViewModel.js';
import { DiffEditorWidget } from '../diffEditorWidget.js';
export declare class DiffEditorDecorations extends Disposable {
    private readonly _editors;
    private readonly _diffModel;
    private readonly _options;
    constructor(_editors: DiffEditorEditors, _diffModel: IObservable<DiffEditorViewModel | undefined>, _options: DiffEditorOptions, widget: DiffEditorWidget);
    private readonly _decorations;
}
