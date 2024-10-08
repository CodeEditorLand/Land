import { IBoundarySashes } from '../../../../../base/browser/ui/sash/sash.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { DetailedLineRangeMapping } from '../../../../common/diff/rangeMapping.js';
import { DiffEditorEditors } from '../components/diffEditorEditors.js';
import { SashLayout } from '../components/diffEditorSash.js';
import { DiffEditorOptions } from '../diffEditorOptions.js';
import { DiffEditorViewModel } from '../diffEditorViewModel.js';
export declare class DiffEditorGutter extends Disposable {
    private readonly _diffModel;
    private readonly _editors;
    private readonly _options;
    private readonly _sashLayout;
    private readonly _boundarySashes;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _menuService;
    private readonly _menu;
    private readonly _actions;
    private readonly _hasActions;
    private readonly _showSash;
    readonly width: IObservable<0 | 35, unknown>;
    private readonly elements;
    constructor(diffEditorRoot: HTMLDivElement, _diffModel: IObservable<DiffEditorViewModel | undefined>, _editors: DiffEditorEditors, _options: DiffEditorOptions, _sashLayout: SashLayout, _boundarySashes: IObservable<IBoundarySashes | undefined, void>, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _menuService: IMenuService);
    computeStagedValue(mapping: DetailedLineRangeMapping): string;
    private readonly _currentDiff;
    private readonly _selectedDiffs;
    layout(left: number): void;
}
export interface DiffEditorSelectionHunkToolbarContext {
    mapping: DetailedLineRangeMapping;
    /**
     * The original text with the selected modified changes applied.
    */
    originalWithModifiedChanges: string;
    modifiedUri: URI;
    originalUri: URI;
}
