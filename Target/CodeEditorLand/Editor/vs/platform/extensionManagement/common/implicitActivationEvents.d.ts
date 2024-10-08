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
    /**
     * This can run correctly only on the renderer process because that is the only place
     * where all extension points and all implicit activation events generators are known.
     */
    readActivationEvents(extensionDescription: IExtensionDescription): string[];
    /**
     * This can run correctly only on the renderer process because that is the only place
     * where all extension points and all implicit activation events generators are known.
     */
    createActivationEventsMap(extensionDescriptions: IExtensionDescription[]): {
        [extensionId: string]: string[];
    };
    private _readActivationEvents;
}
export declare const ImplicitActivationEvents: ImplicitActivationEventsImpl;
