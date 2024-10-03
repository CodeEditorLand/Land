export interface IRegistry {
    add(id: string, data: any): void;
    knows(id: string): boolean;
    as<T>(id: string): T;
}
export declare const Registry: IRegistry;
