import { BreadcrumbsWidget } from '../../../../base/browser/ui/breadcrumbs/breadcrumbsWidget.js';
import { Event } from '../../../../base/common/event.js';
import * as glob from '../../../../base/common/glob.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationOverrides, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { GroupIdentifier } from '../../../common/editor.js';
export declare const IBreadcrumbsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBreadcrumbsService>;
export interface IBreadcrumbsService {
    readonly _serviceBrand: undefined;
    register(group: GroupIdentifier, widget: BreadcrumbsWidget): IDisposable;
    getWidget(group: GroupIdentifier): BreadcrumbsWidget | undefined;
}
export declare class BreadcrumbsService implements IBreadcrumbsService {
    readonly _serviceBrand: undefined;
    private readonly _map;
    register(group: number, widget: BreadcrumbsWidget): IDisposable;
    getWidget(group: number): BreadcrumbsWidget | undefined;
}
export declare abstract class BreadcrumbsConfig<T> {
    abstract get name(): string;
    abstract get onDidChange(): Event<void>;
    abstract getValue(overrides?: IConfigurationOverrides): T;
    abstract updateValue(value: T, overrides?: IConfigurationOverrides): Promise<void>;
    abstract dispose(): void;
    private constructor();
    static readonly IsEnabled: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<boolean>;
    };
    static readonly UseQuickPick: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<boolean>;
    };
    static readonly FilePath: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<"on" | "off" | "last">;
    };
    static readonly SymbolPath: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<"on" | "off" | "last">;
    };
    static readonly SymbolSortOrder: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<"name" | "type" | "position">;
    };
    static readonly Icons: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<boolean>;
    };
    static readonly TitleScrollbarSizing: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<Required<NonNullable<"default" | "large" | undefined>>>;
    };
    static readonly FileExcludes: {
        bindTo(service: IConfigurationService): BreadcrumbsConfig<glob.IExpression>;
    };
    private static _stub;
}
