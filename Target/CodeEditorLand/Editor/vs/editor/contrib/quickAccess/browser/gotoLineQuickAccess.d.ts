import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IPosition } from '../../../common/core/position.js';
import { AbstractEditorNavigationQuickAccessProvider, IQuickAccessTextEditorContext } from './editorNavigationQuickAccess.js';
import { IQuickPick, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
interface IGotoLineQuickPickItem extends IQuickPickItem, Partial<IPosition> {
}
export declare abstract class AbstractGotoLineQuickAccessProvider extends AbstractEditorNavigationQuickAccessProvider {
    static PREFIX: string;
    constructor();
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoLineQuickPickItem, {
        useSeparators: true;
    }>): IDisposable;
    protected provideWithTextEditor(context: IQuickAccessTextEditorContext, picker: IQuickPick<IGotoLineQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken): IDisposable;
    private toRange;
    private parsePosition;
    private getPickLabel;
    private isValidLineNumber;
    private isValidColumn;
    private lineCount;
}
export {};
