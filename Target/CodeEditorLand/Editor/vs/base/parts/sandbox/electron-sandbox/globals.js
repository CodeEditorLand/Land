/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscodeGlobal = globalThis.vscode;
export const ipcRenderer = vscodeGlobal.ipcRenderer;
export const ipcMessagePort = vscodeGlobal.ipcMessagePort;
export const webFrame = vscodeGlobal.webFrame;
export const process = vscodeGlobal.process;
export const context = vscodeGlobal.context;
export const webUtils = vscodeGlobal.webUtils;
