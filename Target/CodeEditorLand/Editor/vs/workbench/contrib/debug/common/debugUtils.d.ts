import { IDebuggerContribution, IDebugSession, IConfigPresentation } from './debug.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { Position } from '../../../../editor/common/core/position.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
export declare function formatPII(value: string, excludePII: boolean, args: {
    [key: string]: string;
} | undefined): string;
export declare function filterExceptionsFromTelemetry<T extends {
    [key: string]: unknown;
}>(data: T): Partial<T>;
export declare function isSessionAttach(session: IDebugSession): boolean;
export declare function getExtensionHostDebugSession(session: IDebugSession): IDebugSession | void;
export declare function isDebuggerMainContribution(dbg: IDebuggerContribution): string | undefined;
export declare function getExactExpressionStartAndEnd(lineContent: string, looseStart: number, looseEnd: number): {
    start: number;
    end: number;
};
export declare function getEvaluatableExpressionAtPosition(languageFeaturesService: ILanguageFeaturesService, model: ITextModel, position: Position, token?: CancellationToken): Promise<{
    range: IRange;
    matchingExpression: string;
} | null>;
export declare function isUri(s: string | undefined): boolean;
export declare function convertToDAPaths(message: DebugProtocol.ProtocolMessage, toUri: boolean): DebugProtocol.ProtocolMessage;
export declare function convertToVSCPaths(message: DebugProtocol.ProtocolMessage, toUri: boolean): DebugProtocol.ProtocolMessage;
export declare function getVisibleAndSorted<T extends {
    presentation?: IConfigPresentation;
}>(array: T[]): T[];
export declare function saveAllBeforeDebugStart(configurationService: IConfigurationService, editorService: IEditorService): Promise<void>;
export declare const sourcesEqual: (a: DebugProtocol.Source | undefined, b: DebugProtocol.Source | undefined) => boolean;
