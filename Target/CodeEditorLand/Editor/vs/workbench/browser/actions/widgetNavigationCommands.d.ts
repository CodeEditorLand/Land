import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
interface INavigableContainer {
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
