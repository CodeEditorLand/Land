import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const OUTPUT_MIME = "text/x-code-output";
export declare const OUTPUT_MODE_ID = "Log";
export declare const LOG_MIME = "text/x-code-log-output";
export declare const LOG_MODE_ID = "log";
export declare const OUTPUT_VIEW_ID = "workbench.panel.output";
export declare const CONTEXT_IN_OUTPUT: RawContextKey<boolean>;
export declare const CONTEXT_ACTIVE_FILE_OUTPUT: RawContextKey<boolean>;
export declare const CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE: RawContextKey<boolean>;
export declare const CONTEXT_ACTIVE_OUTPUT_LEVEL: RawContextKey<string>;
export declare const CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT: RawContextKey<boolean>;
export declare const CONTEXT_OUTPUT_SCROLL_LOCK: RawContextKey<boolean>;
export declare const IOutputService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IOutputService>;
export interface IOutputService {
    readonly _serviceBrand: undefined;
    getChannel(id: string): IOutputChannel | undefined;
    getChannelDescriptor(id: string): IOutputChannelDescriptor | undefined;
    getChannelDescriptors(): IOutputChannelDescriptor[];
    getActiveChannel(): IOutputChannel | undefined;
    showChannel(id: string, preserveFocus?: boolean): Promise<void>;
    onActiveOutputChannel: Event<string>;
}
export declare enum OutputChannelUpdateMode {
    Append = 1,
    Replace = 2,
    Clear = 3
}
export interface IOutputChannel {
    id: string;
    label: string;
    uri: URI;
    append(output: string): void;
    clear(): void;
    replace(output: string): void;
    update(mode: OutputChannelUpdateMode.Append): void;
    update(mode: OutputChannelUpdateMode, till: number): void;
    dispose(): void;
}
export declare const Extensions: {
    OutputChannels: string;
};
export interface IOutputChannelDescriptor {
    id: string;
    label: string;
    log: boolean;
    languageId?: string;
    file?: URI;
    extensionId?: string;
}
export interface IFileOutputChannelDescriptor extends IOutputChannelDescriptor {
    file: URI;
}
export interface IOutputChannelRegistry {
    readonly onDidRegisterChannel: Event<string>;
    readonly onDidRemoveChannel: Event<string>;
    registerChannel(descriptor: IOutputChannelDescriptor): void;
    getChannels(): IOutputChannelDescriptor[];
    getChannel(id: string): IOutputChannelDescriptor | undefined;
    removeChannel(id: string): void;
}
export declare const ACTIVE_OUTPUT_CHANNEL_CONTEXT: RawContextKey<string>;
