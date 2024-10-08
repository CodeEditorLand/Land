import { IAction } from './actions.js';
/**
 * Tries to generate a human readable error message out of the error. If the verbose parameter
 * is set to true, the error message will include stacktrace details if provided.
 *
 * @returns A string containing the error message.
 */
export declare function toErrorMessage(error?: any, verbose?: boolean): string;
export interface IErrorWithActions extends Error {
    actions: IAction[];
}
export declare function isErrorWithActions(obj: unknown): obj is IErrorWithActions;
export declare function createErrorWithActions(messageOrError: string | Error, actions: IAction[]): IErrorWithActions;
