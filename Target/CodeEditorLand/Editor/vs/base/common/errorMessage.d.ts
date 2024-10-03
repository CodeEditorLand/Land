import { IAction } from './actions.js';
export declare function toErrorMessage(error?: any, verbose?: boolean): string;
export interface IErrorWithActions extends Error {
    actions: IAction[];
}
export declare function isErrorWithActions(obj: unknown): obj is IErrorWithActions;
export declare function createErrorWithActions(messageOrError: string | Error, actions: IAction[]): IErrorWithActions;
