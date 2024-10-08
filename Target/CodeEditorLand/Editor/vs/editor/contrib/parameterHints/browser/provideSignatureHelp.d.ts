import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Position } from '../../../common/core/position.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
import * as languages from '../../../common/languages.js';
import { ITextModel } from '../../../common/model.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const Context: {
    Visible: RawContextKey<boolean>;
    MultipleSignatures: RawContextKey<boolean>;
};
export declare function provideSignatureHelp(registry: LanguageFeatureRegistry<languages.SignatureHelpProvider>, model: ITextModel, position: Position, context: languages.SignatureHelpContext, token: CancellationToken): Promise<languages.SignatureHelpResult | undefined>;
