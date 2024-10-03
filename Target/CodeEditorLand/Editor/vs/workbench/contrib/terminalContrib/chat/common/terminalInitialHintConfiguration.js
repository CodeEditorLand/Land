import { localize } from '../../../../../nls.js';
export const terminalInitialHintConfiguration = {
    ["terminal.integrated.initialHint"]: {
        restricted: true,
        markdownDescription: localize('terminal.integrated.initialHint', "Controls if the first terminal without input will show a hint about available actions when it is focused."),
        type: 'boolean',
        default: true
    }
};
