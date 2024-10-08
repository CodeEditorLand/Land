import { Event } from '../../../../base/common/event.js';
export declare const IHostColorSchemeService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IHostColorSchemeService>;
export interface IHostColorSchemeService {
    readonly _serviceBrand: undefined;
    readonly dark: boolean;
    readonly highContrast: boolean;
    readonly onDidChangeColorScheme: Event<void>;
}
