import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export interface IFindInFilesArgs {
    query?: string;
    replace?: string;
    preserveCase?: boolean;
    triggerSearch?: boolean;
    filesToInclude?: string;
    filesToExclude?: string;
    isRegex?: boolean;
    isCaseSensitive?: boolean;
    matchWholeWord?: boolean;
    useExcludeSettingsAndIgnoreFiles?: boolean;
    onlyOpenEditors?: boolean;
    showIncludesExcludes?: boolean;
}
export declare function findInFilesCommand(accessor: ServicesAccessor, _args?: IFindInFilesArgs): Promise<void>;
