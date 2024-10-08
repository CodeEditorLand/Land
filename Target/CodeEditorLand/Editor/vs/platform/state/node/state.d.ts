export declare const IStateReadService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IStateReadService>;
export interface IStateReadService {
    readonly _serviceBrand: undefined;
    getItem<T>(key: string, defaultValue: T): T;
    getItem<T>(key: string, defaultValue?: T): T | undefined;
}
export declare const IStateService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IStateService>;
export interface IStateService extends IStateReadService {
    readonly _serviceBrand: undefined;
    setItem(key: string, data?: object | string | number | boolean | undefined | null): void;
    setItems(items: readonly {
        key: string;
        data?: object | string | number | boolean | undefined | null;
    }[]): void;
    removeItem(key: string): void;
    close(): Promise<void>;
}
