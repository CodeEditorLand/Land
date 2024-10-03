import { IExtensionDescription } from '../../extensions/common/extensions.js';
export interface IActivationEventsGenerator<T> {
    (contributions: T[], result: {
        push(item: string): void;
    }): void;
}
export declare class ImplicitActivationEventsImpl {
    private readonly _generators;
    private readonly _cache;
    register<T>(extensionPointName: string, generator: IActivationEventsGenerator<T>): void;
    readActivationEvents(extensionDescription: IExtensionDescription): string[];
    createActivationEventsMap(extensionDescriptions: IExtensionDescription[]): {
        [extensionId: string]: string[];
    };
    private _readActivationEvents;
}
export declare const ImplicitActivationEvents: ImplicitActivationEventsImpl;
