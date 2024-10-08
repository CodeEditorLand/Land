export interface IV8Profile {
    nodes: IV8ProfileNode[];
    samples?: number[];
    timeDeltas?: number[];
    startTime: number;
    endTime: number;
}
export interface IV8ProfileNode {
    id: number;
    hitCount?: number;
    children?: number[];
    callFrame: IV8CallFrame;
    deoptReason?: string;
    positionTicks?: {
        line: number;
        ticks: number;
    }[];
}
export interface IV8CallFrame {
    url: string;
    scriptId: string;
    functionName: string;
    lineNumber: number;
    columnNumber: number;
}
export declare const IV8InspectProfilingService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IV8InspectProfilingService>;
export interface IV8InspectProfilingService {
    _serviceBrand: undefined;
    startProfiling(options: {
        host: string;
        port: number;
    }): Promise<string>;
    stopProfiling(sessionId: string): Promise<IV8Profile>;
}
export declare namespace Utils {
    function isValidProfile(profile: IV8Profile): profile is Required<IV8Profile>;
    function rewriteAbsolutePaths(profile: IV8Profile, replace?: string): IV8Profile;
}
