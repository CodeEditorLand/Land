import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ProgressBar } from '../../../../base/browser/ui/progressbar/progressbar.js';
import { IProgressRunner, IProgressIndicator } from '../../../../platform/progress/common/progress.js';
import { IEditorGroupView } from '../../../browser/parts/editor/editor.js';
export declare class EditorProgressIndicator extends Disposable implements IProgressIndicator {
    private readonly progressBar;
    private readonly group;
    constructor(progressBar: ProgressBar, group: IEditorGroupView);
    private registerListeners;
    show(infinite: true, delay?: number): IProgressRunner;
    show(total: number, delay?: number): IProgressRunner;
    private doShow;
    showWhile(promise: Promise<unknown>, delay?: number): Promise<void>;
    private doShowWhile;
}
export interface IProgressScope {
    /**
     * Fired whenever `isActive` value changed.
     */
    readonly onDidChangeActive: Event<void>;
    /**
     * Whether progress should be active or not.
     */
    readonly isActive: boolean;
}
export declare class ScopedProgressIndicator extends Disposable implements IProgressIndicator {
    private readonly progressBar;
    private readonly scope;
    private progressState;
    constructor(progressBar: ProgressBar, scope: IProgressScope);
    registerListeners(): void;
    private onDidScopeActivate;
    private onDidScopeDeactivate;
    show(infinite: true, delay?: number): IProgressRunner;
    show(total: number, delay?: number): IProgressRunner;
    showWhile(promise: Promise<unknown>, delay?: number): Promise<void>;
    private doShowWhile;
}
export declare abstract class AbstractProgressScope extends Disposable implements IProgressScope {
    private scopeId;
    private _isActive;
    private readonly _onDidChangeActive;
    readonly onDidChangeActive: Event<void>;
    get isActive(): boolean;
    constructor(scopeId: string, _isActive: boolean);
    protected onScopeOpened(scopeId: string): void;
    protected onScopeClosed(scopeId: string): void;
}
