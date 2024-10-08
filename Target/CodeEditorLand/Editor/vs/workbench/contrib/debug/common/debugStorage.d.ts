import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IDebugModel, IEvaluate, IExpression } from './debug.js';
import { Breakpoint, DataBreakpoint, ExceptionBreakpoint, Expression, FunctionBreakpoint } from './debugModel.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
export declare class DebugStorage extends Disposable {
    private readonly storageService;
    private readonly textFileService;
    private readonly uriIdentityService;
    private readonly logService;
    readonly breakpoints: import("../../../../base/common/observable.js").ISettableObservable<Breakpoint[], void>;
    readonly functionBreakpoints: import("../../../../base/common/observable.js").ISettableObservable<FunctionBreakpoint[], void>;
    readonly exceptionBreakpoints: import("../../../../base/common/observable.js").ISettableObservable<ExceptionBreakpoint[], void>;
    readonly dataBreakpoints: import("../../../../base/common/observable.js").ISettableObservable<DataBreakpoint[], void>;
    readonly watchExpressions: import("../../../../base/common/observable.js").ISettableObservable<Expression[], void>;
    constructor(storageService: IStorageService, textFileService: ITextFileService, uriIdentityService: IUriIdentityService, logService: ILogService);
    loadDebugUxState(): 'simple' | 'default';
    storeDebugUxState(value: 'simple' | 'default'): void;
    private loadBreakpoints;
    private loadFunctionBreakpoints;
    private loadExceptionBreakpoints;
    private loadDataBreakpoints;
    private loadWatchExpressions;
    loadChosenEnvironments(): {
        [key: string]: string;
    };
    storeChosenEnvironments(environments: {
        [key: string]: string;
    }): void;
    storeWatchExpressions(watchExpressions: (IExpression & IEvaluate)[]): void;
    storeBreakpoints(debugModel: IDebugModel): void;
}
