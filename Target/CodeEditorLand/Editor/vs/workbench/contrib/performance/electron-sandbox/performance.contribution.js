import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../common/contributions.js';
import { StartupProfiler } from './startupProfiler.js';
import { NativeStartupTimings } from './startupTimings.js';
import { RendererProfiling } from './rendererAutoProfiler.js';
import { Extensions as ConfigExt } from '../../../../platform/configuration/common/configurationRegistry.js';
import { localize } from '../../../../nls.js';
import { applicationConfigurationNodeBase } from '../../../common/configuration.js';
Registry.as(Extensions.Workbench).registerWorkbenchContribution(RendererProfiling, 4);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(StartupProfiler, 3);
Registry.as(Extensions.Workbench).registerWorkbenchContribution(NativeStartupTimings, 4);
Registry.as(ConfigExt.Configuration).registerConfiguration({
    ...applicationConfigurationNodeBase,
    'properties': {
        'application.experimental.rendererProfiling': {
            type: 'boolean',
            default: false,
            tags: ['experimental'],
            markdownDescription: localize('experimental.rendererProfiling', "When enabled slow renderers are automatically profiled")
        }
    }
});
