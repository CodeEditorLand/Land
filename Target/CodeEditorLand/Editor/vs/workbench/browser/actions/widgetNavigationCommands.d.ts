import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
/** INavigableContainer represents a logical container composed of widgets that can
    be navigated back and forth with key shortcuts */
interface INavigableContainer {
    /**
     * The container may coomposed of multiple parts that share no DOM ancestor
     * (e.g., the main body and filter box of MarkersView may be separated).
     * To track the focus of container we must pass in focus/blur events of all parts
     * as `focusNotifiers`.
     *
     * Each element of `focusNotifiers` notifies the focus/blur event for a part of
     * the container. The container is considered focused if at least one part being
     * focused, and blurred if all parts being blurred.
     */
    readonly focusNotifiers: readonly IFocusNotifier[];
    readonly name?: string;
    focusPreviousWidget(): void;
    focusNextWidget(): void;
}
interface IFocusNotifier {
    readonly onDidFocus: Event<any>;
    readonly onDidBlur: Event<any>;
}
export declare function registerNavigableContainer(container: INavigableContainer): IDisposable;
export {};
