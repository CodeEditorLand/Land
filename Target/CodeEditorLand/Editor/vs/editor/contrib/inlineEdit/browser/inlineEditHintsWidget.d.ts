import { IAction } from '../../../../base/common/actions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import './inlineEditHintsWidget.css';
import { ICodeEditor, IContentWidget, IContentWidgetPosition } from '../../../browser/editorBrowser.js';
import { Position } from '../../../common/core/position.js';
import { GhostTextWidget } from './ghostTextWidget.js';
import { IMenuWorkbenchToolBarOptions, WorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
export declare class InlineEditHintsWidget extends Disposable {
    private readonly editor;
    private readonly model;
    private readonly instantiationService;
    private readonly alwaysShowToolbar;
    private sessionPosition;
    private readonly position;
    constructor(editor: ICodeEditor, model: IObservable<GhostTextWidget | undefined>, instantiationService: IInstantiationService);
}
export declare class InlineEditHintsContentWidget extends Disposable implements IContentWidget {
    private readonly editor;
    private readonly withBorder;
    private readonly _position;
    private readonly _contextKeyService;
    private readonly _menuService;
    private static _dropDownVisible;
    static get dropDownVisible(): boolean;
    private static id;
    private readonly id;
    readonly allowEditorOverflow = true;
    readonly suppressMouseDown = false;
    private readonly nodes;
    private readonly toolBar;
    private readonly inlineCompletionsActionsMenus;
    constructor(editor: ICodeEditor, withBorder: boolean, _position: IObservable<Position | null>, instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _menuService: IMenuService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
}
export declare class CustomizedMenuWorkbenchToolBar extends WorkbenchToolBar {
    private readonly editor;
    private readonly menuId;
    private readonly options2;
    private readonly menuService;
    private readonly contextKeyService;
    private readonly menu;
    private additionalActions;
    private prependedPrimaryActions;
    constructor(container: HTMLElement, editor: ICodeEditor, menuId: MenuId, options2: IMenuWorkbenchToolBarOptions | undefined, menuService: IMenuService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService);
    private updateToolbar;
    setPrependedPrimaryActions(actions: IAction[]): void;
    setAdditionalSecondaryActions(actions: IAction[]): void;
}
