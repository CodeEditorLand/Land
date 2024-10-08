import { Event } from '../../../base/common/event.js';
import { type IDisposable } from '../../../base/common/lifecycle.js';
import { type IBufferDirtyTrackerReader } from './bufferDirtyTracker.js';
export interface ObjectCollectionBufferPropertySpec {
    name: string;
}
export type ObjectCollectionPropertyValues<T extends ObjectCollectionBufferPropertySpec[]> = {
    [K in T[number]['name']]: number;
};
export interface IObjectCollectionBuffer<T extends ObjectCollectionBufferPropertySpec[]> extends IDisposable {
    /**
     * The underlying buffer. This **should not** be modified externally.
     */
    readonly buffer: ArrayBuffer;
    /**
     * A view of the underlying buffer. This **should not** be modified externally.
     */
    readonly view: Float32Array;
    /**
     * The size of the used portion of the buffer (in bytes).
     */
    readonly bufferUsedSize: number;
    /**
     * The size of the used portion of the view (in float32s).
     */
    readonly viewUsedSize: number;
    /**
     * The number of entries in the buffer.
     */
    readonly entryCount: number;
    /**
     * A tracker for dirty regions in the buffer.
     */
    readonly dirtyTracker: IBufferDirtyTrackerReader;
    /**
     * Fires when the buffer is modified.
     */
    readonly onDidChange: Event<void>;
    /**
     * Fires when the buffer is recreated.
     */
    readonly onDidChangeBuffer: Event<void>;
    /**
     * Creates an entry in the collection. This will return a managed object that can be modified
     * which will update the underlying buffer.
     * @param data The data of the entry.
     */
    createEntry(data: ObjectCollectionPropertyValues<T>): IObjectCollectionBufferEntry<T>;
}
/**
 * An entry in an {@link ObjectCollectionBuffer}. Property values on the entry can be changed and
 * their values will be updated automatically in the buffer.
 */
export interface IObjectCollectionBufferEntry<T extends ObjectCollectionBufferPropertySpec[]> extends IDisposable {
    set(propertyName: T[number]['name'], value: number): void;
    get(propertyName: T[number]['name']): number;
    setRaw(data: ArrayLike<number>): void;
}
export declare function createObjectCollectionBuffer<T extends ObjectCollectionBufferPropertySpec[]>(propertySpecs: T, capacity: number): IObjectCollectionBuffer<T>;
