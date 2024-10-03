export interface ICommentsConfiguration {
    openView: 'never' | 'file' | 'firstFile' | 'firstFileUnresolved';
    useRelativeTime: boolean;
    visible: boolean;
    maxHeight: boolean;
    collapseOnResolve: boolean;
}
export declare const COMMENTS_SECTION = "comments";
