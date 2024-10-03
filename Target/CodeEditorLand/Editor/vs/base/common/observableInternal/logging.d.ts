import { AutorunObserver } from './autorun.js';
import { IObservable, ObservableValue, TransactionImpl } from './base.js';
import { Derived } from './derived.js';
import { FromEventObservable } from './utils.js';
export declare function setLogger(logger: IObservableLogger): void;
export declare function getLogger(): IObservableLogger | undefined;
interface IChangeInformation {
    oldValue: unknown;
    newValue: unknown;
    change: unknown;
    didChange: boolean;
    hadValue: boolean;
}
export interface IObservableLogger {
    handleObservableChanged(observable: ObservableValue<any, any>, info: IChangeInformation): void;
    handleFromEventObservableTriggered(observable: FromEventObservable<any, any>, info: IChangeInformation): void;
    handleAutorunCreated(autorun: AutorunObserver): void;
    handleAutorunTriggered(autorun: AutorunObserver): void;
    handleAutorunFinished(autorun: AutorunObserver): void;
    handleDerivedCreated(observable: Derived<any>): void;
    handleDerivedRecomputed(observable: Derived<any>, info: IChangeInformation): void;
    handleBeginTransaction(transaction: TransactionImpl): void;
    handleEndTransaction(): void;
}
export declare class ConsoleObservableLogger implements IObservableLogger {
    private indentation;
    private textToConsoleArgs;
    private formatInfo;
    handleObservableChanged(observable: IObservable<unknown, unknown>, info: IChangeInformation): void;
    private readonly changedObservablesSets;
    formatChanges(changes: Set<IObservable<any, any>>): ConsoleText | undefined;
    handleDerivedCreated(derived: Derived<unknown>): void;
    handleDerivedRecomputed(derived: Derived<unknown>, info: IChangeInformation): void;
    handleFromEventObservableTriggered(observable: FromEventObservable<any, any>, info: IChangeInformation): void;
    handleAutorunCreated(autorun: AutorunObserver): void;
    handleAutorunTriggered(autorun: AutorunObserver): void;
    handleAutorunFinished(autorun: AutorunObserver): void;
    handleBeginTransaction(transaction: TransactionImpl): void;
    handleEndTransaction(): void;
}
type ConsoleText = (ConsoleText | undefined)[] | {
    text: string;
    style: string;
    data?: unknown[];
} | {
    data: unknown[];
};
export {};
