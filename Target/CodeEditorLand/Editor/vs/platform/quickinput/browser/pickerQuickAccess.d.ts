import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable, DisposableStore, IDisposable } from '../../../base/common/lifecycle.js';
import { IKeyMods, IQuickPickDidAcceptEvent, IQuickPickSeparator, IQuickPick, IQuickPickItem } from '../common/quickInput.js';
import { IQuickAccessProvider, IQuickAccessProviderRunOptions } from '../common/quickAccess.js';
export declare enum TriggerAction {
    NO_ACTION = 0,
    CLOSE_PICKER = 1,
    REFRESH_PICKER = 2,
    REMOVE_ITEM = 3
}
export interface IPickerQuickAccessItem extends IQuickPickItem {
    accept?(keyMods: IKeyMods, event: IQuickPickDidAcceptEvent): void;
    trigger?(buttonIndex: number, keyMods: IKeyMods): TriggerAction | Promise<TriggerAction>;
}
export interface IPickerQuickAccessSeparator extends IQuickPickSeparator {
    trigger?(buttonIndex: number, keyMods: IKeyMods): TriggerAction | Promise<TriggerAction>;
}
export interface IPickerQuickAccessProviderOptions<T extends IPickerQuickAccessItem> {
    readonly canAcceptInBackground?: boolean;
    readonly noResultsPick?: T | ((filter: string) => T);
    readonly shouldSkipTrimPickFilter?: boolean;
}
export type Pick<T> = T | IQuickPickSeparator;
export type PicksWithActive<T> = {
    items: readonly Pick<T>[];
    active?: T;
};
export type Picks<T> = readonly Pick<T>[] | PicksWithActive<T>;
export type FastAndSlowPicks<T> = {
    readonly picks: Picks<T>;
    readonly additionalPicks: Promise<Picks<T>>;
    readonly mergeDelay?: number;
};
export declare abstract class PickerQuickAccessProvider<T extends IPickerQuickAccessItem> extends Disposable implements IQuickAccessProvider {
    private prefix;
    protected options?: IPickerQuickAccessProviderOptions<T> | undefined;
    constructor(prefix: string, options?: IPickerQuickAccessProviderOptions<T> | undefined);
    provide(picker: IQuickPick<T, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    protected abstract _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): Picks<T> | Promise<Picks<T> | FastAndSlowPicks<T>> | FastAndSlowPicks<T> | null;
}
