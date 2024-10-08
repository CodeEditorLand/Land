import { Event } from '../common/event.js';
export interface IHistoryNavigationWidget {
    readonly element: HTMLElement;
    showPreviousValue(): void;
    showNextValue(): void;
    onDidFocus: Event<void>;
    onDidBlur: Event<void>;
}
