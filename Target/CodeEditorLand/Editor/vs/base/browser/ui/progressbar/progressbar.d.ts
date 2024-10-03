import { Disposable } from '../../../common/lifecycle.js';
import './progressbar.css';
export interface IProgressBarOptions extends IProgressBarStyles {
}
export interface IProgressBarStyles {
    progressBarBackground: string | undefined;
}
export declare const unthemedProgressBarOptions: IProgressBarOptions;
export declare class ProgressBar extends Disposable {
    private static readonly LONG_RUNNING_INFINITE_THRESHOLD;
    private static readonly PROGRESS_SIGNAL_DEFAULT_DELAY;
    private workedVal;
    private element;
    private bit;
    private totalWork;
    private showDelayedScheduler;
    private longRunningScheduler;
    private readonly progressSignal;
    constructor(container: HTMLElement, options?: IProgressBarOptions);
    private create;
    private off;
    done(): ProgressBar;
    stop(): ProgressBar;
    private doDone;
    infinite(): ProgressBar;
    private infiniteLongRunning;
    total(value: number): ProgressBar;
    hasTotal(): boolean;
    worked(value: number): ProgressBar;
    setWorked(value: number): ProgressBar;
    private doSetWorked;
    getContainer(): HTMLElement;
    show(delay?: number): void;
    hide(): void;
}
