import { localize, localize2 } from '../../../../nls.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { Action2, MenuId } from '../../../../platform/actions/common/actions.js';
import { ILanguagePackService } from '../../../../platform/languagePacks/common/languagePacks.js';
import { ILocaleService } from '../../../services/localization/common/locale.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
export class ConfigureDisplayLanguageAction extends Action2 {
    static { this.ID = 'workbench.action.configureLocale'; }
    constructor() {
        super({
            id: ConfigureDisplayLanguageAction.ID,
            title: localize2('configureLocale', "Configure Display Language"),
            menu: {
                id: MenuId.CommandPalette
            },
            metadata: {
                description: localize2('configureLocaleDescription', "Changes the locale of VS Code based on installed language packs. Common languages include French, Chinese, Spanish, Japanese, German, Korean, and more.")
            }
        });
    }
    async run(accessor) {
        const languagePackService = accessor.get(ILanguagePackService);
        const quickInputService = accessor.get(IQuickInputService);
        const localeService = accessor.get(ILocaleService);
        const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const installedLanguages = await languagePackService.getInstalledLanguages();
        const disposables = new DisposableStore();
        const qp = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
        qp.matchOnDescription = true;
        qp.placeholder = localize('chooseLocale', "Select Display Language");
        if (installedLanguages?.length) {
            const items = [{ type: 'separator', label: localize('installed', "Installed") }];
            qp.items = items.concat(this.withMoreInfoButton(installedLanguages));
        }
        const source = new CancellationTokenSource();
        disposables.add(qp.onDispose(() => {
            source.cancel();
            disposables.dispose();
        }));
        const installedSet = new Set(installedLanguages?.map(language => language.id) ?? []);
        languagePackService.getAvailableLanguages().then(availableLanguages => {
            const newLanguages = availableLanguages.filter(l => l.id && !installedSet.has(l.id));
            if (newLanguages.length) {
                qp.items = [
                    ...qp.items,
                    { type: 'separator', label: localize('available', "Available") },
                    ...this.withMoreInfoButton(newLanguages)
                ];
            }
            qp.busy = false;
        });
        disposables.add(qp.onDidAccept(async () => {
            const selectedLanguage = qp.activeItems[0];
            if (selectedLanguage) {
                qp.hide();
                await localeService.setLocale(selectedLanguage);
            }
        }));
        disposables.add(qp.onDidTriggerItemButton(async (e) => {
            qp.hide();
            if (e.item.extensionId) {
                await extensionWorkbenchService.open(e.item.extensionId);
            }
        }));
        qp.show();
        qp.busy = true;
    }
    withMoreInfoButton(items) {
        for (const item of items) {
            if (item.extensionId) {
                item.buttons = [{
                        tooltip: localize('moreInfo', "More Info"),
                        iconClass: 'codicon-info'
                    }];
            }
        }
        return items;
    }
}
export class ClearDisplayLanguageAction extends Action2 {
    static { this.ID = 'workbench.action.clearLocalePreference'; }
    static { this.LABEL = localize2('clearDisplayLanguage', "Clear Display Language Preference"); }
    constructor() {
        super({
            id: ClearDisplayLanguageAction.ID,
            title: ClearDisplayLanguageAction.LABEL,
            menu: {
                id: MenuId.CommandPalette
            }
        });
    }
    async run(accessor) {
        const localeService = accessor.get(ILocaleService);
        await localeService.clearLocalePreference();
    }
}
