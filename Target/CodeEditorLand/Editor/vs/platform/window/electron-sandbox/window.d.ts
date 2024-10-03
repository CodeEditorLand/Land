import { ISandboxConfiguration } from '../../../base/parts/sandbox/common/sandboxTypes.js';
export declare enum ApplyZoomTarget {
    ACTIVE_WINDOW = 1,
    ALL_WINDOWS = 2
}
export declare const MAX_ZOOM_LEVEL = 8;
export declare const MIN_ZOOM_LEVEL = -8;
export declare function applyZoom(zoomLevel: number, target: ApplyZoomTarget | Window): void;
export declare function zoomIn(target: ApplyZoomTarget | Window): void;
export declare function zoomOut(target: ApplyZoomTarget | Window): void;
export interface ILoadOptions<T extends ISandboxConfiguration = ISandboxConfiguration> {
    configureDeveloperSettings?: (config: T) => {
        forceDisableShowDevtoolsOnError?: boolean;
        forceEnableDeveloperKeybindings?: boolean;
        disallowReloadKeybinding?: boolean;
        removeDeveloperKeybindingsAfterLoad?: boolean;
    };
    beforeImport?: (config: T) => void;
}
export interface ILoadResult<M, T> {
    readonly result: M;
    readonly configuration: T;
}
export interface IBootstrapWindow {
    load<M, T extends ISandboxConfiguration = ISandboxConfiguration>(esModule: string, options: ILoadOptions<T>): Promise<ILoadResult<M, T>>;
}
