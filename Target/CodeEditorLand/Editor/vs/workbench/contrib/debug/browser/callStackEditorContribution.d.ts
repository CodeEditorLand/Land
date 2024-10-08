import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IModelDecorationOptions, IModelDeltaDecoration } from '../../../../editor/common/model.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IDebugService, IStackFrame } from '../common/debug.js';
import './media/callStackEditorContribution.css';
export declare const topStackFrameColor: string;
export declare const focusedStackFrameColor: string;
export declare const TOP_STACK_FRAME_DECORATION: IModelDecorationOptions;
export declare const FOCUSED_STACK_FRAME_DECORATION: IModelDecorationOptions;
export declare const makeStackFrameColumnDecoration: (noCharactersBefore: boolean) => IModelDecorationOptions;
export declare function createDecorationsForStackFrame(stackFrame: IStackFrame, isFocusedSession: boolean, noCharactersBefore: boolean): IModelDeltaDecoration[];
export declare class CallStackEditorContribution extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly debugService;
    private readonly uriIdentityService;
    private readonly logService;
    private decorations;
    constructor(editor: ICodeEditor, debugService: IDebugService, uriIdentityService: IUriIdentityService, logService: ILogService);
    private createCallStackDecorations;
    dispose(): void;
}
