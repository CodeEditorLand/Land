import { ILinesDiffComputer, ILinesDiffComputerOptions, LinesDiff } from '../linesDiffComputer.js';
export declare class DefaultLinesDiffComputer implements ILinesDiffComputer {
    private readonly dynamicProgrammingDiffing;
    private readonly myersDiffingAlgorithm;
    computeDiff(originalLines: string[], modifiedLines: string[], options: ILinesDiffComputerOptions): LinesDiff;
    private computeMoves;
    private refineDiff;
}
