import { Emitter } from '../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
export function getUnchangedRegionSettings(configurationService) {
    return createHideUnchangedRegionOptions(configurationService);
}
function createHideUnchangedRegionOptions(configurationService) {
    const disposables = new DisposableStore();
    const unchangedRegionsEnablementEmitter = disposables.add(new Emitter());
    const result = {
        options: {
            enabled: configurationService.getValue('diffEditor.hideUnchangedRegions.enabled'),
            minimumLineCount: configurationService.getValue('diffEditor.hideUnchangedRegions.minimumLineCount'),
            contextLineCount: configurationService.getValue('diffEditor.hideUnchangedRegions.contextLineCount'),
            revealLineCount: configurationService.getValue('diffEditor.hideUnchangedRegions.revealLineCount'),
        },
        onDidChangeEnablement: unchangedRegionsEnablementEmitter.event.bind(unchangedRegionsEnablementEmitter),
        dispose: () => disposables.dispose()
    };
    disposables.add(configurationService.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('diffEditor.hideUnchangedRegions.minimumLineCount')) {
            result.options.minimumLineCount = configurationService.getValue('diffEditor.hideUnchangedRegions.minimumLineCount');
        }
        if (e.affectsConfiguration('diffEditor.hideUnchangedRegions.contextLineCount')) {
            result.options.contextLineCount = configurationService.getValue('diffEditor.hideUnchangedRegions.contextLineCount');
        }
        if (e.affectsConfiguration('diffEditor.hideUnchangedRegions.revealLineCount')) {
            result.options.revealLineCount = configurationService.getValue('diffEditor.hideUnchangedRegions.revealLineCount');
        }
        if (e.affectsConfiguration('diffEditor.hideUnchangedRegions.enabled')) {
            result.options.enabled = configurationService.getValue('diffEditor.hideUnchangedRegions.enabled');
            unchangedRegionsEnablementEmitter.fire(result.options.enabled);
        }
    }));
    return result;
}
