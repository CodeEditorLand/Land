import { ILocalExtension } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IExtension } from '../../../../platform/extensions/common/extensions.js';
export declare const IExtensionBisectService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionBisectService>;
export interface IExtensionBisectService {
    readonly _serviceBrand: undefined;
    isDisabledByBisect(extension: IExtension): boolean;
    isActive: boolean;
    disabledCount: number;
    start(extensions: ILocalExtension[]): Promise<void>;
    next(seeingBad: boolean): Promise<{
        id: string;
        bad: boolean;
    } | undefined>;
    reset(): Promise<void>;
}
