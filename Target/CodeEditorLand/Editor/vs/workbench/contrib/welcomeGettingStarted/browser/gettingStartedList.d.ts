import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { ContextKeyExpression, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
type GettingStartedIndexListOptions<T> = {
    title: string;
    klass: string;
    limit: number;
    empty?: HTMLElement | undefined;
    more?: HTMLElement | undefined;
    footer?: HTMLElement | undefined;
    renderElement: (item: T) => HTMLElement;
    rankElement?: (item: T) => number | null;
    contextService: IContextKeyService;
};
export declare class GettingStartedIndexList<T extends {
    id: string;
    when?: ContextKeyExpression;
}> extends Disposable {
    private options;
    private readonly _onDidChangeEntries;
    private readonly onDidChangeEntries;
    private domElement;
    private list;
    private scrollbar;
    private entries;
    private lastRendered;
    itemCount: number;
    private isDisposed;
    private contextService;
    private contextKeysToWatch;
    constructor(options: GettingStartedIndexListOptions<T>);
    getDomElement(): HTMLElement;
    layout(size: Dimension): void;
    onDidChange(listener: () => void): void;
    register(d: IDisposable): void;
    dispose(): void;
    setLimit(limit: number): void;
    rerender(): void;
    setEntries(entries: undefined | T[]): void;
}
export {};
