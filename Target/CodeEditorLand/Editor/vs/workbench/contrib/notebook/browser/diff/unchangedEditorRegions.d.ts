import { Event } from '../../../../../base/common/event.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
export type UnchangedEditorRegionOptions = {
    options: {
        enabled: boolean;
        contextLineCount: number;
        minimumLineCount: number;
        revealLineCount: number;
    };
    onDidChangeEnablement: Event<boolean>;
};
export declare function getUnchangedRegionSettings(configurationService: IConfigurationService): (Readonly<UnchangedEditorRegionOptions> & IDisposable);
