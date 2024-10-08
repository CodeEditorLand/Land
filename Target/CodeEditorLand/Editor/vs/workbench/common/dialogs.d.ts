import { Event } from '../../base/common/event.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { IDialogArgs, IDialogResult } from '../../platform/dialogs/common/dialogs.js';
export interface IDialogViewItem {
    readonly args: IDialogArgs;
    close(result?: IDialogResult | Error): void;
}
export interface IDialogHandle {
    readonly item: IDialogViewItem;
    readonly result: Promise<IDialogResult | undefined>;
}
export interface IDialogsModel {
    readonly onWillShowDialog: Event<void>;
    readonly onDidShowDialog: Event<void>;
    readonly dialogs: IDialogViewItem[];
    show(dialog: IDialogArgs): IDialogHandle;
}
export declare class DialogsModel extends Disposable implements IDialogsModel {
    readonly dialogs: IDialogViewItem[];
    private readonly _onWillShowDialog;
    readonly onWillShowDialog: Event<void>;
    private readonly _onDidShowDialog;
    readonly onDidShowDialog: Event<void>;
    show(dialog: IDialogArgs): IDialogHandle;
}
