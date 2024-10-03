import * as dom from '../../../base/browser/dom.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IInputBox, IInputOptions, IKeyMods, IPickOptions, IQuickInput, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, IQuickWidget, QuickInputHideReason, QuickPickInput } from '../common/quickInput.js';
import { IQuickInputStyles, IQuickInputOptions } from './quickInput.js';
import { ILayoutService } from '../../layout/browser/layoutService.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.js';
import './quickInputActions.js';
export declare class QuickInputController extends Disposable {
    private options;
    private readonly layoutService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private static readonly MAX_WIDTH;
    private idPrefix;
    private ui;
    private dimension?;
    private titleBarOffset?;
    private enabled;
    private readonly onDidAcceptEmitter;
    private readonly onDidCustomEmitter;
    private readonly onDidTriggerButtonEmitter;
    private keyMods;
    private controller;
    get currentQuickInput(): IQuickInput | undefined;
    private _container;
    get container(): HTMLElement;
    private styles;
    private onShowEmitter;
    readonly onShow: Event<void>;
    private onHideEmitter;
    readonly onHide: Event<void>;
    private previousFocusElement?;
    private readonly inQuickInputContext;
    private readonly quickInputTypeContext;
    private readonly endOfQuickInputBoxContext;
    constructor(options: IQuickInputOptions, layoutService: ILayoutService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService);
    private registerKeyModsListeners;
    private getUI;
    private reparentUI;
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: IPickOptions<T>, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    private setValidationOnInput;
    input(options?: IInputOptions, token?: CancellationToken): Promise<string | undefined>;
    backButton: {
        iconClass: string;
        tooltip: string;
        handle: number;
    };
    createQuickPick<T extends IQuickPickItem>(options: {
        useSeparators: true;
    }): IQuickPick<T, {
        useSeparators: true;
    }>;
    createQuickPick<T extends IQuickPickItem>(options?: {
        useSeparators: boolean;
    }): IQuickPick<T, {
        useSeparators: false;
    }>;
    createInputBox(): IInputBox;
    createQuickWidget(): IQuickWidget;
    private show;
    isVisible(): boolean;
    private setVisibilities;
    private setEnabled;
    hide(reason?: QuickInputHideReason): void;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    accept(keyMods?: IKeyMods): Promise<void>;
    back(): Promise<void>;
    cancel(): Promise<void>;
    layout(dimension: dom.IDimension, titleBarOffset: number): void;
    private updateLayout;
    applyStyles(styles: IQuickInputStyles): void;
    private updateStyles;
}
export interface IQuickInputControllerHost extends ILayoutService {
}
