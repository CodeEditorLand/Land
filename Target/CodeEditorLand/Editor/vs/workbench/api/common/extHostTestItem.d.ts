import { ITestItemChildren, TestItemCollection } from '../../contrib/testing/common/testItemCollection.js';
import { ITestItemContext } from '../../contrib/testing/common/testTypes.js';
import type * as vscode from 'vscode';
import { ExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
export declare const toItemFromContext: (context: ITestItemContext) => TestItemImpl;
export declare class TestItemImpl implements vscode.TestItem {
    readonly id: string;
    readonly uri: vscode.Uri | undefined;
    readonly children: ITestItemChildren<vscode.TestItem>;
    readonly parent: TestItemImpl | undefined;
    range: vscode.Range | undefined;
    description: string | undefined;
    sortText: string | undefined;
    label: string;
    error: string | vscode.MarkdownString;
    busy: boolean;
    canResolveChildren: boolean;
    tags: readonly vscode.TestTag[];
    constructor(controllerId: string, id: string, label: string, uri: vscode.Uri | undefined);
}
export declare class TestItemRootImpl extends TestItemImpl {
    readonly _isRoot = true;
    constructor(controllerId: string, label: string);
}
export declare class ExtHostTestItemCollection extends TestItemCollection<TestItemImpl> {
    constructor(controllerId: string, controllerLabel: string, editors: ExtHostDocumentsAndEditors);
}
