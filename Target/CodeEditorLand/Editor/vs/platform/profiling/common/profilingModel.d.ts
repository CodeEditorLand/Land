import type { IV8Profile, IV8ProfileNode } from './profiling.js';
export interface IProfileModel {
    nodes: ReadonlyArray<IComputedNode>;
    locations: ReadonlyArray<ILocation>;
    samples: ReadonlyArray<number>;
    timeDeltas: ReadonlyArray<number>;
    rootPath?: string;
    duration: number;
}
export interface IComputedNode {
    id: number;
    selfTime: number;
    aggregateTime: number;
    children: number[];
    parent?: number;
    locationId: number;
}
export interface ISourceLocation {
    lineNumber: number;
    columnNumber: number;
    relativePath?: string;
}
export interface CdpCallFrame {
    functionName: string;
    scriptId: string;
    url: string;
    lineNumber: number;
    columnNumber: number;
}
export interface CdpPositionTickInfo {
    line: number;
    ticks: number;
}
export interface INode {
    id: number;
    callFrame: CdpCallFrame;
    src?: ISourceLocation;
}
export interface ILocation extends INode {
    selfTime: number;
    aggregateTime: number;
    ticks: number;
}
export interface IAnnotationLocation {
    callFrame: CdpCallFrame;
    locations: ISourceLocation[];
}
export interface IProfileNode extends IV8ProfileNode {
    locationId?: number;
    positionTicks?: (CdpPositionTickInfo & {
        startLocationId?: number;
        endLocationId?: number;
    })[];
}
export interface ICpuProfileRaw extends IV8Profile {
    nodes: IProfileNode[];
}
/**
 * Computes the model for the given profile.
 */
export declare const buildModel: (profile: ICpuProfileRaw) => IProfileModel;
export declare class BottomUpNode {
    readonly location: ILocation;
    readonly parent?: BottomUpNode | undefined;
    static root(): BottomUpNode;
    children: {
        [id: number]: BottomUpNode;
    };
    aggregateTime: number;
    selfTime: number;
    ticks: number;
    childrenSize: number;
    get id(): number;
    get callFrame(): CdpCallFrame;
    get src(): ISourceLocation | undefined;
    constructor(location: ILocation, parent?: BottomUpNode | undefined);
    addNode(node: IComputedNode): void;
}
export declare const processNode: (aggregate: BottomUpNode, node: IComputedNode, model: IProfileModel, initialNode?: IComputedNode) => void;
export interface BottomUpSample {
    selfTime: number;
    totalTime: number;
    location: string;
    absLocation: string;
    url: string;
    caller: {
        percentage: number;
        absLocation: string;
        location: string;
    }[];
    percentage: number;
    isSpecial: boolean;
}
