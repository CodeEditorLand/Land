import { IThemeService, Themable } from '../../../../../platform/theme/common/themeService.js';
import { INotebookEditorDelegate } from '../notebookBrowser.js';
export declare class NotebookOverviewRuler extends Themable {
    readonly notebookEditor: INotebookEditorDelegate;
    private readonly _domNode;
    private _lanes;
    constructor(notebookEditor: INotebookEditorDelegate, container: HTMLElement, themeService: IThemeService);
    layout(): void;
    private _render;
}
