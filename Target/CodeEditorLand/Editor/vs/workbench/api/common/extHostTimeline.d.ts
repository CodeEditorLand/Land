import * as vscode from 'vscode';
import { UriComponents } from '../../../base/common/uri.js';
import { ExtHostTimelineShape, IMainContext } from './extHost.protocol.js';
import { Timeline } from '../../contrib/timeline/common/timeline.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { CommandsConverter, ExtHostCommands } from './extHostCommands.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
export interface IExtHostTimeline extends ExtHostTimelineShape {
    readonly _serviceBrand: undefined;
    $getTimeline(id: string, uri: UriComponents, options: vscode.TimelineOptions, token: vscode.CancellationToken): Promise<Timeline | undefined>;
}
export declare const IExtHostTimeline: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostTimeline>;
export declare class ExtHostTimeline implements IExtHostTimeline {
    readonly _serviceBrand: undefined;
    private _proxy;
    private _providers;
    private _itemsBySourceAndUriMap;
    constructor(mainContext: IMainContext, commands: ExtHostCommands);
    $getTimeline(id: string, uri: UriComponents, options: vscode.TimelineOptions, token: vscode.CancellationToken): Promise<Timeline | undefined>;
    registerTimelineProvider(scheme: string | string[], provider: vscode.TimelineProvider, extensionId: ExtensionIdentifier, commandConverter: CommandsConverter): IDisposable;
    private convertTimelineItem;
    private registerTimelineProviderCore;
}
