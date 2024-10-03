import { ExtHostTestItemEvent } from '../../contrib/testing/common/testItemCollection.js';
import * as vscode from 'vscode';
export interface IExtHostTestItemApi {
    controllerId: string;
    parent?: vscode.TestItem;
    listener?: (evt: ExtHostTestItemEvent) => void;
}
export declare const createPrivateApiFor: (impl: vscode.TestItem, controllerId: string) => IExtHostTestItemApi;
export declare const getPrivateApiFor: (impl: vscode.TestItem) => IExtHostTestItemApi;
