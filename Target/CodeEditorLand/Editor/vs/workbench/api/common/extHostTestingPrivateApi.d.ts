import { ExtHostTestItemEvent } from '../../contrib/testing/common/testItemCollection.js';
import * as vscode from 'vscode';
export interface IExtHostTestItemApi {
    controllerId: string;
    parent?: vscode.TestItem;
    listener?: (evt: ExtHostTestItemEvent) => void;
}
export declare const createPrivateApiFor: (impl: vscode.TestItem, controllerId: string) => IExtHostTestItemApi;
/**
 * Gets the private API for a test item implementation. This implementation
 * is a managed object, but we keep a weakmap to avoid exposing any of the
 * internals to extensions.
 */
export declare const getPrivateApiFor: (impl: vscode.TestItem) => IExtHostTestItemApi;
