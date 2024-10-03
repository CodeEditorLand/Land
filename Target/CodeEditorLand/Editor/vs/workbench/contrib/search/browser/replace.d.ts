import { Match, FileMatch, FileMatchOrMatch } from './searchModel.js';
import { IProgress, IProgressStep } from '../../../../platform/progress/common/progress.js';
export declare const IReplaceService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IReplaceService>;
export interface IReplaceService {
    readonly _serviceBrand: undefined;
    replace(match: Match): Promise<any>;
    replace(files: FileMatch[], progress?: IProgress<IProgressStep>): Promise<any>;
    openReplacePreview(element: FileMatchOrMatch, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<any>;
    updateReplacePreview(file: FileMatch, override?: boolean): Promise<void>;
}
