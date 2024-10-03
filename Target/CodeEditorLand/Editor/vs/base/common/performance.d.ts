export declare const mark: (name: string) => void;
export interface PerformanceMark {
    readonly name: string;
    readonly startTime: number;
}
export declare const getMarks: () => PerformanceMark[];
