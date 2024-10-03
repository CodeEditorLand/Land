import * as DOM from '../../../../../base/browser/dom.js';
import { IAction } from '../../../../../base/common/actions.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { INotebookEditorDelegate } from '../notebookBrowser.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IWorkbenchAssignmentService } from '../../../../services/assignment/common/assignmentService.js';
import { NotebookOptions } from '../notebookOptions.js';
interface IActionModel {
    action: IAction;
    size: number;
    visible: boolean;
    renderLabel: boolean;
}
export declare enum RenderLabel {
    Always = 0,
    Never = 1,
    Dynamic = 2
}
export type RenderLabelWithFallback = true | false | 'always' | 'never' | 'dynamic';
export declare function convertConfiguration(value: RenderLabelWithFallback): RenderLabel;
export declare class NotebookEditorWorkbenchToolbar extends Disposable {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly contextKeyService: IContextKeyService;
    readonly notebookOptions: NotebookOptions;
    readonly domNode: HTMLElement;
    private readonly instantiationService;
    private readonly configurationService;
    private readonly contextMenuService;
    private readonly menuService;
    private readonly editorService;
    private readonly keybindingService;
    private readonly experimentService;
    private _leftToolbarScrollable;
    private _notebookTopLeftToolbarContainer;
    private _notebookTopRightToolbarContainer;
    private _notebookGlobalActionsMenu;
    private _executeGoToActionsMenu;
    private _notebookLeftToolbar;
    private _primaryActions;
    get primaryActions(): IActionModel[];
    private _secondaryActions;
    get secondaryActions(): IAction[];
    private _notebookRightToolbar;
    private _useGlobalToolbar;
    private _strategy;
    private _renderLabel;
    private _visible;
    set visible(visible: boolean);
    private readonly _onDidChangeVisibility;
    onDidChangeVisibility: Event<boolean>;
    get useGlobalToolbar(): boolean;
    private _dimension;
    private _deferredActionUpdate;
    constructor(notebookEditor: INotebookEditorDelegate, contextKeyService: IContextKeyService, notebookOptions: NotebookOptions, domNode: HTMLElement, instantiationService: IInstantiationService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, menuService: IMenuService, editorService: IEditorService, keybindingService: IKeybindingService, experimentService: IWorkbenchAssignmentService);
    private _buildBody;
    private _updatePerEditorChange;
    private _registerNotebookActionsToolbar;
    private _updateStrategy;
    private _convertConfiguration;
    private _showNotebookActionsinEditorToolbar;
    private _setNotebookActions;
    private _cacheItemSizes;
    private _computeSizes;
    layout(dimension: DOM.Dimension): void;
    dispose(): void;
}
export declare function workbenchCalculateActions(initialPrimaryActions: IActionModel[], initialSecondaryActions: IAction[], leftToolbarContainerMaxWidth: number): {
    primaryActions: IActionModel[];
    secondaryActions: IAction[];
};
export declare function workbenchDynamicCalculateActions(initialPrimaryActions: IActionModel[], initialSecondaryActions: IAction[], leftToolbarContainerMaxWidth: number): {
    primaryActions: IActionModel[];
    secondaryActions: IAction[];
};
export {};
