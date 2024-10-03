import { CancellationToken } from '../common/cancellation.js';
export declare function realcaseSync(path: string): string | null;
export declare function realcase(path: string, token?: CancellationToken): Promise<string | null>;
export declare function realpath(path: string): Promise<string>;
export declare function realpathSync(path: string): string;
