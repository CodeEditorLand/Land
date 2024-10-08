export = RequireFunc;
declare function RequireFunc(...args: any[]): any;
declare namespace RequireFunc {
    export { _requireFunc_config as config };
    export function getConfig(): any;
    export function reset(): void;
    export function getBuildInfo(): any;
    export function getStats(): any;
    export { DefineFunc as define };
}
declare function _requireFunc_config(params: any, shouldOverwrite?: boolean): void;
declare function DefineFunc(id: any, dependencies: any, callback: any): void;
declare namespace DefineFunc {
    namespace amd {
        let jQuery: boolean;
    }
}
