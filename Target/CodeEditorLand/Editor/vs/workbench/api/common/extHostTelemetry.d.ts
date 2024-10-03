import type * as vscode from 'vscode';
import { Event } from '../../../base/common/event.js';
import { ExtHostTelemetryShape } from './extHost.protocol.js';
import { ICommonProperties, TelemetryLevel } from '../../../platform/telemetry/common/telemetry.js';
import { ILogger, ILoggerService } from '../../../platform/log/common/log.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export declare class ExtHostTelemetry extends Disposable implements ExtHostTelemetryShape {
    private readonly initData;
    private readonly loggerService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeTelemetryEnabled;
    readonly onDidChangeTelemetryEnabled: Event<boolean>;
    private readonly _onDidChangeTelemetryConfiguration;
    readonly onDidChangeTelemetryConfiguration: Event<vscode.TelemetryConfiguration>;
    private _productConfig;
    private _level;
    private _telemetryIsSupported;
    private _oldTelemetryEnablement;
    private readonly _inLoggingOnlyMode;
    private readonly extHostTelemetryLogFile;
    private readonly _outputLogger;
    private readonly _telemetryLoggers;
    constructor(initData: IExtHostInitDataService, loggerService: ILoggerService);
    private updateLoggerVisibility;
    getTelemetryConfiguration(): boolean;
    getTelemetryDetails(): vscode.TelemetryConfiguration;
    instantiateLogger(extension: IExtensionDescription, sender: vscode.TelemetrySender, options?: vscode.TelemetryLoggerOptions): vscode.TelemetryLogger;
    $initializeTelemetryLevel(level: TelemetryLevel, supportsTelemetry: boolean, productConfig?: {
        usage: boolean;
        error: boolean;
    }): void;
    getBuiltInCommonProperties(extension: IExtensionDescription): ICommonProperties;
    $onDidChangeTelemetryLevel(level: TelemetryLevel): void;
    onExtensionError(extension: ExtensionIdentifier, error: Error): boolean;
}
export declare class ExtHostTelemetryLogger {
    private readonly _extension;
    private readonly _logger;
    private readonly _inLoggingOnlyMode;
    private readonly _commonProperties;
    static validateSender(sender: vscode.TelemetrySender): void;
    private readonly _onDidChangeEnableStates;
    private readonly _ignoreBuiltinCommonProperties;
    private readonly _additionalCommonProperties;
    readonly ignoreUnhandledExtHostErrors: boolean;
    private _telemetryEnablements;
    private _apiObject;
    private _sender;
    constructor(sender: vscode.TelemetrySender, options: vscode.TelemetryLoggerOptions | undefined, _extension: IExtensionDescription, _logger: ILogger, _inLoggingOnlyMode: boolean, _commonProperties: Record<string, any>, telemetryEnablements: {
        isUsageEnabled: boolean;
        isErrorsEnabled: boolean;
    });
    updateTelemetryEnablements(isUsageEnabled: boolean, isErrorsEnabled: boolean): void;
    mixInCommonPropsAndCleanData(data: Record<string, any>): Record<string, any>;
    private logEvent;
    logUsage(eventName: string, data?: Record<string, any>): void;
    logError(eventNameOrException: Error | string, data?: Record<string, any>): void;
    get apiTelemetryLogger(): vscode.TelemetryLogger;
    get isDisposed(): boolean;
    dispose(): void;
}
export declare function isNewAppInstall(firstSessionDate: string): boolean;
export declare const IExtHostTelemetry: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostTelemetry>;
export interface IExtHostTelemetry extends ExtHostTelemetry, ExtHostTelemetryShape {
}
