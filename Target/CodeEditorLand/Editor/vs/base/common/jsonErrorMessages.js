/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Extracted from json.ts to keep json nls free.
 */
import { localize } from '../../nls.js';
export function getParseErrorMessage(errorCode) {
    switch (errorCode) {
        case 1 /* ParseErrorCode.InvalidSymbol */: return localize('error.invalidSymbol', 'Invalid symbol');
        case 2 /* ParseErrorCode.InvalidNumberFormat */: return localize('error.invalidNumberFormat', 'Invalid number format');
        case 3 /* ParseErrorCode.PropertyNameExpected */: return localize('error.propertyNameExpected', 'Property name expected');
        case 4 /* ParseErrorCode.ValueExpected */: return localize('error.valueExpected', 'Value expected');
        case 5 /* ParseErrorCode.ColonExpected */: return localize('error.colonExpected', 'Colon expected');
        case 6 /* ParseErrorCode.CommaExpected */: return localize('error.commaExpected', 'Comma expected');
        case 7 /* ParseErrorCode.CloseBraceExpected */: return localize('error.closeBraceExpected', 'Closing brace expected');
        case 8 /* ParseErrorCode.CloseBracketExpected */: return localize('error.closeBracketExpected', 'Closing bracket expected');
        case 9 /* ParseErrorCode.EndOfFileExpected */: return localize('error.endOfFileExpected', 'End of file expected');
        default:
            return '';
    }
}
