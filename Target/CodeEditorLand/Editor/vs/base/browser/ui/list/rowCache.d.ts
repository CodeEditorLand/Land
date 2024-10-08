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
    /**
     * Returns a row either by creating a new one or reusing
     * a previously released row which shares the same templateId.
     *
     * @returns A row and `isReusingConnectedDomNode` if the row's node is already in the dom in a stale position.
     */
    alloc(templateId: string): {
        row: IRow;
        isReusingConnectedDomNode: boolean;
    };
    /**
     * Releases the row for eventual reuse.
     */
    release(row: IRow): void;
    /**
     * Begin a set of changes that use the cache. This lets us skip work when a row is removed and then inserted again.
     */
    transact(makeChanges: () => void): void;
    private releaseRow;
    private doRemoveNode;
    private getTemplateCache;
    dispose(): void;
    private getRenderer;
}
