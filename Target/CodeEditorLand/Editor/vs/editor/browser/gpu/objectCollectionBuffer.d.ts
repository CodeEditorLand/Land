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
    readonly buffer: ArrayBuffer;
    readonly view: Float32Array;
    readonly bufferUsedSize: number;
    readonly viewUsedSize: number;
    readonly entryCount: number;
    readonly dirtyTracker: IBufferDirtyTrackerReader;
    readonly onDidChange: Event<void>;
    readonly onDidChangeBuffer: Event<void>;
    createEntry(data: ObjectCollectionPropertyValues<T>): IObjectCollectionBufferEntry<T>;
}
export interface IObjectCollectionBufferEntry<T extends ObjectCollectionBufferPropertySpec[]> extends IDisposable {
    set(propertyName: T[number]['name'], value: number): void;
    get(propertyName: T[number]['name']): number;
    setRaw(data: ArrayLike<number>): void;
}
export declare function createObjectCollectionBuffer<T extends ObjectCollectionBufferPropertySpec[]>(propertySpecs: T, capacity: number): IObjectCollectionBuffer<T>;
