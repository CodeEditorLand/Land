import './media/quickInput.css';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { IQuickInputButton } from '../common/quickInput.js';
import { IAction } from '../../../base/common/actions.js';
export declare function quickInputButtonToAction(button: IQuickInputButton, id: string, run: () => unknown): IAction;
export declare function renderQuickInputDescription(description: string, container: HTMLElement, actionHandler: {
    callback: (content: string) => void;
    disposables: DisposableStore;
}): void;
