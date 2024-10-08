import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import Severity from '../../../../base/common/severity.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { Command } from '../../../../editor/common/languages.js';
import { LanguageSelector } from '../../../../editor/common/languageSelector.js';
import { IAccessibilityInformation } from '../../../../platform/accessibility/common/accessibility.js';
export interface ILanguageStatus {
    readonly id: string;
    readonly name: string;
    readonly selector: LanguageSelector;
    readonly severity: Severity;
    readonly label: string | {
        value: string;
        shortValue: string;
    };
    readonly detail: string;
    readonly busy: boolean;
    readonly source: string;
    readonly command: Command | undefined;
    readonly accessibilityInfo: IAccessibilityInformation | undefined;
}
export interface ILanguageStatusProvider {
    provideLanguageStatus(langId: string, token: CancellationToken): Promise<ILanguageStatus | undefined>;
}
export declare const ILanguageStatusService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageStatusService>;
export interface ILanguageStatusService {
    _serviceBrand: undefined;
    onDidChange: Event<void>;
    addStatus(status: ILanguageStatus): IDisposable;
    getLanguageStatus(model: ITextModel): ILanguageStatus[];
}
