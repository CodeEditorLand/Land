import * as cp from 'child_process';
import * as glob from '../../../../base/common/glob.js';
import { IFileQuery, IFolderQuery } from '../common/search.js';
export declare function spawnRipgrepCmd(config: IFileQuery, folderQuery: IFolderQuery, includePattern?: glob.IExpression, excludePattern?: glob.IExpression, numThreads?: number): {
    cmd: cp.ChildProcessWithoutNullStreams;
    rgDiskPath: any;
    siblingClauses: glob.IExpression;
    rgArgs: {
        args: string[];
        siblingClauses: glob.IExpression;
    };
    cwd: string;
};
export declare function getAbsoluteGlob(folder: string, key: string): string;
export declare function fixDriveC(path: string): string;
