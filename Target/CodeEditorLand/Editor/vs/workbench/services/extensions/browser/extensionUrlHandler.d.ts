import { IURLHandler } from '../../../../platform/url/common/url.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
export declare const IExtensionUrlHandler: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionUrlHandler>;
export interface IExtensionContributedURLHandler extends IURLHandler {
    extensionDisplayName: string;
}
export interface IExtensionUrlHandler {
    readonly _serviceBrand: undefined;
    registerExtensionHandler(extensionId: ExtensionIdentifier, handler: IExtensionContributedURLHandler): void;
    unregisterExtensionHandler(extensionId: ExtensionIdentifier): void;
}
export interface ExtensionUrlHandlerEvent {
    readonly extensionId: string;
}
