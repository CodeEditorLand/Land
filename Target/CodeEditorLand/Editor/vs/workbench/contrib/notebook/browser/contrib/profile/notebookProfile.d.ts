export declare enum NotebookProfileType {
    default = "default",
    jupyter = "jupyter",
    colab = "colab"
}
export interface ISetProfileArgs {
    profile: NotebookProfileType;
}
