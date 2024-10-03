import * as DOM from '../../../../base/browser/dom.js';
import { Action, IAction } from '../../../../base/common/actions.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Marker } from './markersModel.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Event } from '../../../../base/common/event.js';
import { ActionViewItem, IActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import './markersViewActions.css';
export interface IMarkersFiltersChangeEvent {
    excludedFiles?: boolean;
    showWarnings?: boolean;
    showErrors?: boolean;
    showInfos?: boolean;
    activeFile?: boolean;
}
export interface IMarkersFiltersOptions {
    filterHistory: string[];
    showErrors: boolean;
    showWarnings: boolean;
    showInfos: boolean;
    excludedFiles: boolean;
    activeFile: boolean;
}
export declare class MarkersFilters extends Disposable {
    private readonly contextKeyService;
    private readonly _onDidChange;
    readonly onDidChange: Event<IMarkersFiltersChangeEvent>;
    constructor(options: IMarkersFiltersOptions, contextKeyService: IContextKeyService);
    filterHistory: string[];
    private readonly _excludedFiles;
    get excludedFiles(): boolean;
    set excludedFiles(filesExclude: boolean);
    private readonly _activeFile;
    get activeFile(): boolean;
    set activeFile(activeFile: boolean);
    private readonly _showWarnings;
    get showWarnings(): boolean;
    set showWarnings(showWarnings: boolean);
    private readonly _showErrors;
    get showErrors(): boolean;
    set showErrors(showErrors: boolean);
    private readonly _showInfos;
    get showInfos(): boolean;
    set showInfos(showInfos: boolean);
}
export declare class QuickFixAction extends Action {
    readonly marker: Marker;
    static readonly ID: string;
    private static readonly CLASS;
    private static readonly AUTO_FIX_CLASS;
    private readonly _onShowQuickFixes;
    readonly onShowQuickFixes: Event<void>;
    private _quickFixes;
    get quickFixes(): IAction[];
    set quickFixes(quickFixes: IAction[]);
    autoFixable(autofixable: boolean): void;
    constructor(marker: Marker);
    run(): Promise<void>;
}
export declare class QuickFixActionViewItem extends ActionViewItem {
    private readonly contextMenuService;
    constructor(action: QuickFixAction, options: IActionViewItemOptions, contextMenuService: IContextMenuService);
    onClick(event: DOM.EventLike): void;
    showQuickFixes(): void;
}
