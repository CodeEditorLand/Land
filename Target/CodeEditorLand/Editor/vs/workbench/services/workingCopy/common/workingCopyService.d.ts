import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IWorkingCopy, IWorkingCopyIdentifier, IWorkingCopySaveEvent as IBaseWorkingCopySaveEvent } from './workingCopy.js';
export declare const IWorkingCopyService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkingCopyService>;
export interface IWorkingCopySaveEvent extends IBaseWorkingCopySaveEvent {
    /**
     * The working copy that was saved.
     */
    readonly workingCopy: IWorkingCopy;
}
export interface IWorkingCopyService {
    readonly _serviceBrand: undefined;
    /**
     * An event for when a working copy was registered.
     */
    readonly onDidRegister: Event<IWorkingCopy>;
    /**
     * An event for when a working copy was unregistered.
     */
    readonly onDidUnregister: Event<IWorkingCopy>;
    /**
     * An event for when a working copy dirty state changed.
     */
    readonly onDidChangeDirty: Event<IWorkingCopy>;
    /**
     * An event for when a working copy's content changed.
     */
    readonly onDidChangeContent: Event<IWorkingCopy>;
    /**
     * An event for when a working copy was saved.
     */
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    /**
     * The number of dirty working copies that are registered.
     */
    readonly dirtyCount: number;
    /**
     * All dirty working copies that are registered.
     */
    readonly dirtyWorkingCopies: readonly IWorkingCopy[];
    /**
     * The number of modified working copies that are registered,
     * including scratchpads, which are never dirty.
     */
    readonly modifiedCount: number;
    /**
     * All working copies with unsaved changes,
     * including scratchpads, which are never dirty.
     */
    readonly modifiedWorkingCopies: readonly IWorkingCopy[];
    /**
     * Whether there is any registered working copy that is dirty.
     */
    readonly hasDirty: boolean;
    /**
     * Figure out if working copies with the given
     * resource are dirty or not.
     *
     * @param resource the URI of the working copy
     * @param typeId optional type identifier to only
     * consider working copies of that type.
     */
    isDirty(resource: URI, typeId?: string): boolean;
    /**
     * All working copies that are registered.
     */
    readonly workingCopies: readonly IWorkingCopy[];
    /**
     * Register a new working copy with the service. This method will
     * throw if you try to register a working copy on a resource that
     * has already been registered.
     *
     * Overall there can only ever be 1 working copy with the same
     * resource.
     */
    registerWorkingCopy(workingCopy: IWorkingCopy): IDisposable;
    /**
     * Whether a working copy with the given resource or identifier
     * exists.
     */
    has(identifier: IWorkingCopyIdentifier): boolean;
    has(resource: URI): boolean;
    /**
     * Returns a working copy with the given identifier or `undefined`
     * if no such working copy exists.
     */
    get(identifier: IWorkingCopyIdentifier): IWorkingCopy | undefined;
    /**
     * Returns all working copies with the given resource or `undefined`
     * if no such working copy exists.
     */
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
