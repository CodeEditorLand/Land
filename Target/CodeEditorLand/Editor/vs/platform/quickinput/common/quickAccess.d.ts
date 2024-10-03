import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { ItemActivation, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, QuickPickItem, IQuickPickSeparator } from './quickInput.js';
export interface IQuickAccessProviderRunOptions {
    readonly from?: string;
    readonly placeholder?: string;
    readonly handleAccept?: (item: IQuickPickItem) => void;
}
export interface AnythingQuickAccessProviderRunOptions extends IQuickAccessProviderRunOptions {
    readonly includeHelp?: boolean;
    readonly filter?: (item: IQuickPickItem | IQuickPickSeparator) => boolean;
    readonly additionPicks?: QuickPickItem[];
}
export interface IQuickAccessOptions {
    readonly quickNavigateConfiguration?: IQuickNavigateConfiguration;
    readonly itemActivation?: ItemActivation;
    readonly preserveValue?: boolean;
    readonly providerOptions?: IQuickAccessProviderRunOptions;
    readonly enabledProviderPrefixes?: string[];
    readonly placeholder?: string;
}
export interface IQuickAccessController {
    show(value?: string, options?: IQuickAccessOptions): void;
    pick(value?: string, options?: IQuickAccessOptions): Promise<IQuickPickItem[] | undefined>;
}
export declare enum DefaultQuickAccessFilterValue {
    PRESERVE = 0,
    LAST = 1
}
export interface IQuickAccessProvider {
    readonly defaultFilterValue?: string | DefaultQuickAccessFilterValue;
    provide(picker: IQuickPick<IQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken, options?: IQuickAccessProviderRunOptions): IDisposable;
}
export interface IQuickAccessProviderHelp {
    readonly prefix?: string;
    readonly description: string;
    readonly commandId?: string;
    readonly commandCenterOrder?: number;
    readonly commandCenterLabel?: string;
}
export interface IQuickAccessProviderDescriptor {
    readonly ctor: {
        new (...services: any[]): IQuickAccessProvider;
    };
    readonly prefix: string;
    readonly placeholder?: string;
    readonly helpEntries: IQuickAccessProviderHelp[];
    readonly contextKey?: string;
}
export declare const Extensions: {
    Quickaccess: string;
};
export interface IQuickAccessRegistry {
    registerQuickAccessProvider(provider: IQuickAccessProviderDescriptor): IDisposable;
    getQuickAccessProviders(): IQuickAccessProviderDescriptor[];
    getQuickAccessProvider(prefix: string): IQuickAccessProviderDescriptor | undefined;
}
export declare class QuickAccessRegistry implements IQuickAccessRegistry {
    private providers;
    private defaultProvider;
    registerQuickAccessProvider(provider: IQuickAccessProviderDescriptor): IDisposable;
    getQuickAccessProviders(): IQuickAccessProviderDescriptor[];
    getQuickAccessProvider(prefix: string): IQuickAccessProviderDescriptor | undefined;
    clear(): Function;
}
