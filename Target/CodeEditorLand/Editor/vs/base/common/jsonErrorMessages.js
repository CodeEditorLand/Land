import { localize } from '../../nls.js';
export function getParseErrorMessage(errorCode) {
    switch (errorCode) {
        case 1: return localize('error.invalidSymbol', 'Invalid symbol');
        case 2: return localize('error.invalidNumberFormat', 'Invalid number format');
        case 3: return localize('error.propertyNameExpected', 'Property name expected');
        case 4: return localize('error.valueExpected', 'Value expected');
        case 5: return localize('error.colonExpected', 'Colon expected');
        case 6: return localize('error.commaExpected', 'Comma expected');
        case 7: return localize('error.closeBraceExpected', 'Closing brace expected');
        case 8: return localize('error.closeBracketExpected', 'Closing bracket expected');
        case 9: return localize('error.endOfFileExpected', 'End of file expected');
        default:
            return '';
    }
}
