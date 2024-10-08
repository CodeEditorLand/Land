import '../common/extHost.common.services.js';
import './extHost.worker.services.js';
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(): {
    onmessage: (message: any) => void;
};
