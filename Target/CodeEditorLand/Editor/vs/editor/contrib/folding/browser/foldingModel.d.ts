import { Event } from '../../../../base/common/event.js';
import { IModelDecorationOptions, IModelDecorationsChangeAccessor, ITextModel } from '../../../common/model.js';
import { FoldingRegion, FoldingRegions, ILineRange, FoldSource } from './foldingRanges.js';
import { SelectedLines } from './folding.js';
export interface IDecorationProvider {
    getDecorationOption(isCollapsed: boolean, isHidden: boolean, isManual: boolean): IModelDecorationOptions;
    changeDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T | null;
    removeDecorations(decorationIds: string[]): void;
}
export interface FoldingModelChangeEvent {
    model: FoldingModel;
    collapseStateChanged?: FoldingRegion[];
}
interface ILineMemento extends ILineRange {
    checksum?: number;
    isCollapsed?: boolean;
    source?: FoldSource;
}
export type CollapseMemento = ILineMemento[];
export declare class FoldingModel {
    private readonly _textModel;
    private readonly _decorationProvider;
    private _regions;
    private _editorDecorationIds;
    private readonly _updateEventEmitter;
    readonly onDidChange: Event<FoldingModelChangeEvent>;
    get regions(): FoldingRegions;
    get textModel(): ITextModel;
    get decorationProvider(): IDecorationProvider;
    constructor(textModel: ITextModel, decorationProvider: IDecorationProvider);
    toggleCollapseState(toggledRegions: FoldingRegion[]): void;
    removeManualRanges(ranges: ILineRange[]): void;
    update(newRegions: FoldingRegions, selection?: SelectedLines): void;
    updatePost(newRegions: FoldingRegions): void;
    private _currentFoldedOrManualRanges;
    getMemento(): CollapseMemento | undefined;
    applyMemento(state: CollapseMemento): void;
    private _getLinesChecksum;
    dispose(): void;
    getAllRegionsAtLine(lineNumber: number, filter?: (r: FoldingRegion, level: number) => boolean): FoldingRegion[];
    getRegionAtLine(lineNumber: number): FoldingRegion | null;
    getRegionsInside(region: FoldingRegion | null, filter?: RegionFilter | RegionFilterWithLevel): FoldingRegion[];
}
type RegionFilter = (r: FoldingRegion) => boolean;
type RegionFilterWithLevel = (r: FoldingRegion, level: number) => boolean;
export declare function toggleCollapseState(foldingModel: FoldingModel, levels: number, lineNumbers: number[]): void;
export declare function setCollapseStateLevelsDown(foldingModel: FoldingModel, doCollapse: boolean, levels?: number, lineNumbers?: number[]): void;
export declare function setCollapseStateLevelsUp(foldingModel: FoldingModel, doCollapse: boolean, levels: number, lineNumbers: number[]): void;
export declare function setCollapseStateUp(foldingModel: FoldingModel, doCollapse: boolean, lineNumbers: number[]): void;
export declare function setCollapseStateAtLevel(foldingModel: FoldingModel, foldLevel: number, doCollapse: boolean, blockedLineNumbers: number[]): void;
export declare function setCollapseStateForRest(foldingModel: FoldingModel, doCollapse: boolean, blockedLineNumbers: number[]): void;
export declare function setCollapseStateForMatchingLines(foldingModel: FoldingModel, regExp: RegExp, doCollapse: boolean): void;
export declare function setCollapseStateForType(foldingModel: FoldingModel, type: string, doCollapse: boolean): void;
export declare function getParentFoldLine(lineNumber: number, foldingModel: FoldingModel): number | null;
export declare function getPreviousFoldLine(lineNumber: number, foldingModel: FoldingModel): number | null;
export declare function getNextFoldLine(lineNumber: number, foldingModel: FoldingModel): number | null;
export {};
