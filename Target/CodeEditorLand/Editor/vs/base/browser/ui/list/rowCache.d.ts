import { IDisposable } from '../../../common/lifecycle.js';
import { IListRenderer } from './list.js';
export interface IRow {
    domNode: HTMLElement;
    templateId: string;
    templateData: any;
}
export declare class RowCache<T> implements IDisposable {
    private renderers;
    private cache;
    private readonly transactionNodesPendingRemoval;
    private inTransaction;
    constructor(renderers: Map<string, IListRenderer<T, any>>);
    alloc(templateId: string): {
        row: IRow;
        isReusingConnectedDomNode: boolean;
    };
    release(row: IRow): void;
    transact(makeChanges: () => void): void;
    private releaseRow;
    private doRemoveNode;
    private getTemplateCache;
    dispose(): void;
    private getRenderer;
}
