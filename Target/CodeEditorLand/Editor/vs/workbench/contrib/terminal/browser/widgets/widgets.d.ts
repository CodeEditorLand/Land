import { IDisposable } from '../../../../../base/common/lifecycle.js';
export interface ITerminalWidget extends IDisposable {
    id: string;
    attach(container: HTMLElement): void;
}
