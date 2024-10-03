import { IAction, IActionRunner } from '../../base/common/actions.js';
import { Component } from '../common/component.js';
import { ITelemetryService } from '../../platform/telemetry/common/telemetry.js';
import { IComposite, ICompositeControl } from '../common/composite.js';
import { Event, Emitter } from '../../base/common/event.js';
import { IThemeService } from '../../platform/theme/common/themeService.js';
import { IConstructorSignature, IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { Dimension, IDomPosition } from '../../base/browser/dom.js';
import { IStorageService } from '../../platform/storage/common/storage.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { IActionViewItem } from '../../base/browser/ui/actionbar/actionbar.js';
import { MenuId } from '../../platform/actions/common/actions.js';
import { IBoundarySashes } from '../../base/browser/ui/sash/sash.js';
import { IBaseActionViewItemOptions } from '../../base/browser/ui/actionbar/actionViewItems.js';
export declare abstract class Composite extends Component implements IComposite {
    protected readonly telemetryService: ITelemetryService;
    private readonly _onTitleAreaUpdate;
    readonly onTitleAreaUpdate: Event<void>;
    protected _onDidFocus: Emitter<void> | undefined;
    get onDidFocus(): Event<void>;
    private _onDidBlur;
    get onDidBlur(): Event<void>;
    private _hasFocus;
    hasFocus(): boolean;
    private registerFocusTrackEvents;
    protected actionRunner: IActionRunner | undefined;
    private visible;
    private parent;
    constructor(id: string, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService);
    getTitle(): string | undefined;
    create(parent: HTMLElement): void;
    getContainer(): HTMLElement | undefined;
    setVisible(visible: boolean): void;
    focus(): void;
    abstract layout(dimension: Dimension, position?: IDomPosition): void;
    abstract setBoundarySashes(sashes: IBoundarySashes): void;
    getMenuIds(): readonly MenuId[];
    getActions(): readonly IAction[];
    getSecondaryActions(): readonly IAction[];
    getContextMenuActions(): readonly IAction[];
    getActionViewItem(action: IAction, options: IBaseActionViewItemOptions): IActionViewItem | undefined;
    getActionsContext(): unknown;
    getActionRunner(): IActionRunner;
    protected updateTitleArea(): void;
    isVisible(): boolean;
    getControl(): ICompositeControl | undefined;
}
export declare abstract class CompositeDescriptor<T extends Composite> {
    private readonly ctor;
    readonly id: string;
    readonly name: string;
    readonly cssClass?: string | undefined;
    readonly order?: number | undefined;
    readonly requestedIndex?: number | undefined;
    constructor(ctor: IConstructorSignature<T>, id: string, name: string, cssClass?: string | undefined, order?: number | undefined, requestedIndex?: number | undefined);
    instantiate(instantiationService: IInstantiationService): T;
}
export declare abstract class CompositeRegistry<T extends Composite> extends Disposable {
    private readonly _onDidRegister;
    readonly onDidRegister: Event<CompositeDescriptor<T>>;
    private readonly _onDidDeregister;
    readonly onDidDeregister: Event<CompositeDescriptor<T>>;
    private readonly composites;
    protected registerComposite(descriptor: CompositeDescriptor<T>): void;
    protected deregisterComposite(id: string): void;
    getComposite(id: string): CompositeDescriptor<T> | undefined;
    protected getComposites(): CompositeDescriptor<T>[];
    private compositeById;
}
