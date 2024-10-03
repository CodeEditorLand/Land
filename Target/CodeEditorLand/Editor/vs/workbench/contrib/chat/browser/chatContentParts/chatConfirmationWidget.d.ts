import './media/chatConfirmationWidget.css';
import { Event } from '../../../../../base/common/event.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
export interface IChatConfirmationButton {
    label: string;
    isSecondary?: boolean;
    data: any;
}
export declare class ChatConfirmationWidget extends Disposable {
    private readonly instantiationService;
    private _onDidClick;
    get onDidClick(): Event<IChatConfirmationButton>;
    private _domNode;
    get domNode(): HTMLElement;
    setShowButtons(showButton: boolean): void;
    constructor(title: string, message: string | IMarkdownString, buttons: IChatConfirmationButton[], instantiationService: IInstantiationService);
}
