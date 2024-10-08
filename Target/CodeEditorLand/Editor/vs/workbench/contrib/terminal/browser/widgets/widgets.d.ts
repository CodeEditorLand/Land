import { IDisposable } from '../../../../../base/common/lifecycle.js';
export interface ITerminalWidget extends IDisposable {
    /**
     * Only one widget of each ID can be displayed at once.
     */
    id: string;
    attach(container: HTMLElement): void;
}
