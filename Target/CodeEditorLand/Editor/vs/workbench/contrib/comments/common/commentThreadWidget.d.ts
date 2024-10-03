export interface ICommentThreadWidget {
    submitComment: () => Promise<void>;
    collapse: () => void;
}
