import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable, DisposableStore, IDisposable } from '../../../base/common/lifecycle.js';
import { IKeyMods, IQuickPickDidAcceptEvent, IQuickPickSeparator, IQuickPick, IQuickPickItem } from '../common/quickInput.js';
import { IQuickAccessProvider, IQuickAccessProviderRunOptions } from '../common/quickAccess.js';
export declare enum TriggerAction {
    /**
     * Do nothing after the button was clicked.
     */
    NO_ACTION = 0,
    /**
     * Close the picker.
     */
    CLOSE_PICKER = 1,
    /**
     * Update the results of the picker.
     */
    REFRESH_PICKER = 2,
    /**
     * Remove the item from the picker.
     */
    REMOVE_ITEM = 3
}
export interface IPickerQuickAccessItem extends IQuickPickItem {
    /**
    * A method that will be executed when the pick item is accepted from
    * the picker. The picker will close automatically before running this.
    *
    * @param keyMods the state of modifier keys when the item was accepted.
    * @param event the underlying event that caused the accept to trigger.
    */
    accept?(keyMods: IKeyMods, event: IQuickPickDidAcceptEvent): void;
    /**
     * A method that will be executed when a button of the pick item was
     * clicked on.
     *
     * @param buttonIndex index of the button of the item that
     * was clicked.
     *
     * @param the state of modifier keys when the button was triggered.
     *
     * @returns a value that indicates what should happen after the trigger
     * which can be a `Promise` for long running operations.
     */
    trigger?(buttonIndex: number, keyMods: IKeyMods): TriggerAction | Promise<TriggerAction>;
}
export interface IPickerQuickAccessSeparator extends IQuickPickSeparator {
    /**
     * A method that will be executed when a button of the pick item was
     * clicked on.
     *
     * @param buttonIndex index of the button of the item that
     * was clicked.
     *
     * @param the state of modifier keys when the button was triggered.
     *
     * @returns a value that indicates what should happen after the trigger
     * which can be a `Promise` for long running operations.
     */
    trigger?(buttonIndex: number, keyMods: IKeyMods): TriggerAction | Promise<TriggerAction>;
}
export interface IPickerQuickAccessProviderOptions<T extends IPickerQuickAccessItem> {
    /**
     * Enables support for opening picks in the background via gesture.
     */
    readonly canAcceptInBackground?: boolean;
    /**
     * Enables to show a pick entry when no results are returned from a search.
     */
    readonly noResultsPick?: T | ((filter: string) => T);
    /** Whether to skip trimming the pick filter string */
    readonly shouldSkipTrimPickFilter?: boolean;
}
export type Pick<T> = T | IQuickPickSeparator;
export type PicksWithActive<T> = {
    items: readonly Pick<T>[];
    active?: T;
};
export type Picks<T> = readonly Pick<T>[] | PicksWithActive<T>;
export type FastAndSlowPicks<T> = {
    /**
     * Picks that will show instantly or after a short delay
     * based on the `mergeDelay` property to reduce flicker.
     */
    readonly picks: Picks<T>;
    /**
     * Picks that will show after they have been resolved.
     */
    readonly additionalPicks: Promise<Picks<T>>;
    /**
     * A delay in milliseconds to wait before showing the
     * `picks` to give a chance to merge with `additionalPicks`
     * for reduced flicker.
     */
    readonly mergeDelay?: number;
};
export declare abstract class PickerQuickAccessProvider<T extends IPickerQuickAccessItem> extends Disposable implements IQuickAccessProvider {
    private prefix;
    protected options?: IPickerQuickAccessProviderOptions<T> | undefined;
    constructor(prefix: string, options?: IPickerQuickAccessProviderOptions<T> | undefined);
    provide(picker: IQuickPick<T, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    /**
     * Returns an array of picks and separators as needed. If the picks are resolved
     * long running, the provided cancellation token should be used to cancel the
     * operation when the token signals this.
     *
     * The implementor is responsible for filtering and sorting the picks given the
     * provided `filter`.
     *
     * @param filter a filter to apply to the picks.
     * @param disposables can be used to register disposables that should be cleaned
     * up when the picker closes.
     * @param token for long running tasks, implementors need to check on cancellation
     * through this token.
     * @returns the picks either directly, as promise or combined fast and slow results.
     * Pickers can return `null` to signal that no change in picks is needed.
     */
    protected abstract _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): Picks<T> | Promise<Picks<T> | FastAndSlowPicks<T>> | FastAndSlowPicks<T> | null;
}
