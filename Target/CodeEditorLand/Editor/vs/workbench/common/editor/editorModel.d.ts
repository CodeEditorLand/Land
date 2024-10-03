import { Disposable } from '../../../base/common/lifecycle.js';
export declare class EditorModel extends Disposable {
    private readonly _onWillDispose;
    readonly onWillDispose: import("../../workbench.web.main.internal.js").Event<void>;
    private resolved;
    resolve(): Promise<void>;
    isResolved(): boolean;
    isDisposed(): boolean;
    dispose(): void;
}
