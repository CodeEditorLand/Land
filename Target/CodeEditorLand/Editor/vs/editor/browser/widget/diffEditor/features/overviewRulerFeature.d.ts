import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { DiffEditorEditors } from '../components/diffEditorEditors.js';
import { DiffEditorViewModel } from '../diffEditorViewModel.js';
import { EditorLayoutInfo } from '../../../../common/config/editorOptions.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
export declare class OverviewRulerFeature extends Disposable {
    private readonly _editors;
    private readonly _rootElement;
    private readonly _diffModel;
    private readonly _rootWidth;
    private readonly _rootHeight;
    private readonly _modifiedEditorLayoutInfo;
    private readonly _themeService;
    private static readonly ONE_OVERVIEW_WIDTH;
    static readonly ENTIRE_DIFF_OVERVIEW_WIDTH: number;
    readonly width: number;
    constructor(_editors: DiffEditorEditors, _rootElement: HTMLElement, _diffModel: IObservable<DiffEditorViewModel | undefined>, _rootWidth: IObservable<number>, _rootHeight: IObservable<number>, _modifiedEditorLayoutInfo: IObservable<EditorLayoutInfo | null>, _themeService: IThemeService);
}
