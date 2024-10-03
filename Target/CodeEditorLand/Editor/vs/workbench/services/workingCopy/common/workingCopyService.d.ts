import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IWorkingCopy, IWorkingCopyIdentifier, IWorkingCopySaveEvent as IBaseWorkingCopySaveEvent } from './workingCopy.js';
export declare const IWorkingCopyService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkingCopyService>;
export interface IWorkingCopySaveEvent extends IBaseWorkingCopySaveEvent {
    readonly workingCopy: IWorkingCopy;
}
export interface IWorkingCopyService {
    readonly _serviceBrand: undefined;
    readonly onDidRegister: Event<IWorkingCopy>;
    readonly onDidUnregister: Event<IWorkingCopy>;
    readonly onDidChangeDirty: Event<IWorkingCopy>;
    readonly onDidChangeContent: Event<IWorkingCopy>;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    readonly dirtyCount: number;
    readonly dirtyWorkingCopies: readonly IWorkingCopy[];
    readonly modifiedCount: number;
    readonly modifiedWorkingCopies: readonly IWorkingCopy[];
    readonly hasDirty: boolean;
    isDirty(resource: URI, typeId?: string): boolean;
    readonly workingCopies: readonly IWorkingCopy[];
    registerWorkingCopy(workingCopy: IWorkingCopy): IDisposable;
    has(identifier: IWorkingCopyIdentifier): boolean;
    has(resource: URI): boolean;
    get(identifier: IWorkingCopyIdentifier): IWorkingCopy | undefined;
    getAll(resource: URI): readonly IWorkingCopy[] | undefined;
}
export declare class WorkingCopyService extends Disposable implements IWorkingCopyService {
    readonly _serviceBrand: undefined;
    private readonly _onDidRegister;
    readonly onDidRegister: Event<IWorkingCopy>;
    private readonly _onDidUnregister;
    readonly onDidUnregister: Event<IWorkingCopy>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<IWorkingCopy>;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<IWorkingCopy>;
    private readonly _onDidSave;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    get workingCopies(): IWorkingCopy[];
    private _workingCopies;
    private readonly mapResourceToWorkingCopies;
    private readonly mapWorkingCopyToListeners;
    registerWorkingCopy(workingCopy: IWorkingCopy): IDisposable;
    protected unregisterWorkingCopy(workingCopy: IWorkingCopy): void;
    has(identifier: IWorkingCopyIdentifier): boolean;
    has(resource: URI): boolean;
    get(identifier: IWorkingCopyIdentifier): IWorkingCopy | undefined;
    getAll(resource: URI): readonly IWorkingCopy[] | undefined;
    get hasDirty(): boolean;
    get dirtyCount(): number;
    get dirtyWorkingCopies(): IWorkingCopy[];
    get modifiedCount(): number;
    get modifiedWorkingCopies(): IWorkingCopy[];
    isDirty(resource: URI, typeId?: string): boolean;
}
