import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ExtHostNotebookRenderersShape, IMainContext } from './extHost.protocol.js';
import { ExtHostNotebookController } from './extHostNotebook.js';
import * as vscode from 'vscode';
export declare class ExtHostNotebookRenderers implements ExtHostNotebookRenderersShape {
    private readonly _extHostNotebook;
    private readonly _rendererMessageEmitters;
    private readonly proxy;
    constructor(mainContext: IMainContext, _extHostNotebook: ExtHostNotebookController);
    $postRendererMessage(editorId: string, rendererId: string, message: unknown): void;
    createRendererMessaging(manifest: IExtensionDescription, rendererId: string): vscode.NotebookRendererMessaging;
    private getOrCreateEmitterFor;
}
