import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { AnyStackFrame } from '../../../debug/browser/callStackWidget.js';
import { ITestMessageStackFrame } from '../../common/testTypes.js';
export declare class TestResultStackWidget extends Disposable {
    private readonly container;
    private readonly widget;
    private readonly changeStackFrameEmitter;
    readonly onDidChangeStackFrame: import("../../../../workbench.web.main.internal.js").Event<ITestMessageStackFrame>;
    constructor(container: HTMLElement, containingEditor: ICodeEditor | undefined, instantiationService: IInstantiationService);
    collapseAll(): void;
    update(messageFrame: AnyStackFrame, stack: ITestMessageStackFrame[]): void;
    layout(height?: number, width?: number): void;
}
