import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, IReader } from '../../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { LineRange } from '../../../../common/core/lineRange.js';
import { SymbolKind } from '../../../../common/languages.js';
import { ITextModel } from '../../../../common/model.js';
import { DiffEditorEditors } from '../components/diffEditorEditors.js';
import { DiffEditorOptions } from '../diffEditorOptions.js';
import { DiffEditorViewModel } from '../diffEditorViewModel.js';
import { IObservableViewZone } from '../utils.js';
/**
 * Make sure to add the view zones to the editor!
 */
export declare class HideUnchangedRegionsFeature extends Disposable {
    private readonly _editors;
    private readonly _diffModel;
    private readonly _options;
    private readonly _instantiationService;
    private static readonly _breadcrumbsSourceFactory;
    static setBreadcrumbsSourceFactory(factory: (textModel: ITextModel, instantiationService: IInstantiationService) => IDiffEditorBreadcrumbsSource): void;
    private readonly _modifiedOutlineSource;
    readonly viewZones: IObservable<{
        origViewZones: IObservableViewZone[];
        modViewZones: IObservableViewZone[];
    }>;
    private _isUpdatingHiddenAreas;
    get isUpdatingHiddenAreas(): boolean;
    constructor(_editors: DiffEditorEditors, _diffModel: IObservable<DiffEditorViewModel | undefined>, _options: DiffEditorOptions, _instantiationService: IInstantiationService);
}
export interface IDiffEditorBreadcrumbsSource extends IDisposable {
    getBreadcrumbItems(startRange: LineRange, reader: IReader): {
        name: string;
        kind: SymbolKind;
        startLineNumber: number;
    }[];
}
